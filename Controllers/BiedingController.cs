using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BiedingenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BiedingenController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bieding>>> GetAll()
        {
            return await _context.Biedingen
                .Include(b => b.Klant)
                .Include(b => b.Product)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Bieding>> GetById(string id)
        {
            var bieding = await _context.Biedingen
                .Include(b => b.Klant)
                .Include(b => b.Product)
                .FirstOrDefaultAsync(b => b.Bieding_Id == id);

            if (bieding == null) return NotFound();
            return bieding;
        }

        [HttpPost]
        public async Task<ActionResult<Bieding>> Create(Bieding bieding)
        {
            // Haal de bestaande Klant en Product op uit de database
            var klant = await _context.Klanten.FindAsync(bieding.Klant_Id);
            var product = await _context.Producten.FindAsync(bieding.Product_Id);

            if (klant == null || product == null)
                return BadRequest("Klant of Product bestaat niet.");

            // Koppel alleen de foreign keys, geen nieuwe objecten toevoegen
            bieding.Klant = klant;
            bieding.Product = product;

            _context.Biedingen.Add(bieding);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = bieding.Bieding_Id }, bieding);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Bieding bieding)
        {
            if (id != bieding.Bieding_Id) return BadRequest();
            _context.Entry(bieding).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var bieding = await _context.Biedingen.FindAsync(id);
            if (bieding == null) return NotFound();
            _context.Biedingen.Remove(bieding);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}