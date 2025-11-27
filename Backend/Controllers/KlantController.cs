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

        public KlantenController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Klant>>> GetAll()
            => await _context.Klanten.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Klant>> GetById(string id)
        {
            var klant = await _context.Klanten.FindAsync(id);
            if (klant == null) return NotFound();
            return klant;
        }

        [HttpPost]
        public async Task<ActionResult<Klant>> Create(KlantCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email)) return BadRequest("Email is verplicht");

            if (await _context.Klanten.AnyAsync(k => k.Email == dto.Email))
                return Conflict("E-mail bestaat al.");

            var klant = new Klant
            {
                Voornaam = dto.Voornaam,
                Achternaam = dto.Achternaam,
                Email = dto.Email,
                Adres = dto.Adres,
                Telefoonnr = dto.Telefoonnr,
                Woonplaats = dto.Woonplaats,
                Wachtwoord = dto.Wachtwoord,
                Saldo = dto.Saldo
            };

            await _context.Klanten.AddAsync(klant);
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