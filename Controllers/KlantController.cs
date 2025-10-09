using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KlantenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KlantenController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Klant>>> GetAll()
        {
            return await _context.Klanten.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Klant>> GetById(string id)
        {
            var klant = await _context.Klanten.FindAsync(id);
            if (klant == null) return NotFound();
            return klant;
        }

        [HttpPost]
        public async Task<ActionResult<Klant>> Create(Klant klant)
        {
            _context.Klanten.Add(klant);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = klant.Gebruiker_Id }, klant);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Klant klant)
        {
            if (id != klant.Gebruiker_Id) return BadRequest();
            _context.Entry(klant).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var klant = await _context.Klanten.FindAsync(id);
            if (klant == null) return NotFound();
            _context.Klanten.Remove(klant);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}