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
        public async Task<ActionResult<BiedingDto>> Create(BiedingCreateDto dto)
        {
            // Check klant
            var klant = await _context.Klanten.FindAsync(dto.Klant_Id);
            if (klant == null)
                return BadRequest("Klant bestaat niet.");

            // Check product
            var product = await _context.Producten.FindAsync(dto.Product_Id);
            if (product == null)
                return BadRequest("Product bestaat niet.");

            // Hoogste bod check
            var hoogsteBod= await _context.Biedingen
                .Where(x => x.Product_Id == dto.Product_Id)
                .OrderByDescending(x => x.Bedrag)
                .FirstOrDefaultAsync();

            if (hoogsteBod != null && dto.Bedrag <= hoogsteBod.Bedrag)
                return BadRequest("Bod moet hoger zijn dan het huidige hoogste bod.");

            var nieuweBieding = new Bieding
            {
                Bedrag = dto.Bedrag,
                Klant_Id = dto.Klant_Id,
                Product_Id = dto.Product_Id,
                Tijdstip = DateTime.UtcNow
            };

            _context.Biedingen.Add(nieuweBieding);
            await _context.SaveChangesAsync();

            // DTO response
            var response = new BiedingDto
            {
                Bieding_Id = nieuweBieding.Bieding_Id,
                Bedrag = nieuweBieding.Bedrag,
                Tijdstip = nieuweBieding.Tijdstip,
                Klant_Id = nieuweBieding.Klant_Id,
                Product_Id = nieuweBieding.Product_Id
            };

            return CreatedAtAction(nameof(GetById), new { id = nieuweBieding.Bieding_Id }, response);
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