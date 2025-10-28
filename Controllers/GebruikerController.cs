using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GebruikersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GebruikersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gebruiker>>> GetAll()
        {
            return await _context.Gebruikers.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Gebruiker>> GetById(string id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound();
            return gebruiker;
        }

        // [HttpPost]
        // public async Task<ActionResult<Gebruiker>> Create(Gebruiker gebruiker)
        // {
        //     _context.Gebruikers.Add(gebruiker);
        //     await _context.SaveChangesAsync();
        //     return CreatedAtAction(nameof(GetById), new { id = gebruiker.Gebruiker_Id }, gebruiker);
        // }

        [HttpPost]
        public async Task<ActionResult<Gebruiker>> Create(GebruikerCreateDto dto)
        {
            var gebruiker = new Gebruiker
            {
                Voornaam = dto.Voornaam,
                Achternaam = dto.Achternaam,
                Email = dto.Email,
                Adres = dto.Adres,
                Telefoonnr = dto.Telefoonnr,
                Woonplaats = dto.Woonplaats,
                Wachtwoord = dto.Wachtwoord
            };

            await _context.Gebruikers.AddAsync(gebruiker);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = gebruiker.Gebruiker_Id }, gebruiker);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var gebruiker = _context.Gebruikers
                .FirstOrDefault(g => g.Email == request.Email && g.Wachtwoord == request.Wachtwoord);

            if (gebruiker == null)
            {
                return Unauthorized("Ongeldige inloggegevens.");
            }

            return Ok(gebruiker);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Gebruiker gebruiker)
        {
            if (id != gebruiker.Gebruiker_Id) return BadRequest();
            _context.Entry(gebruiker).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound();
            _context.Gebruikers.Remove(gebruiker);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}