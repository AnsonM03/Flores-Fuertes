using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FloresFuertes.Data;
using FloresFuertes.Models;
using FloresFuertes.DTOs;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GebruikersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<Gebruiker> _passwordHasher = new();

        public GebruikersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GebruikerDto>>> GetAll()
        {
            var gebruikers = await _context.Gebruikers.ToListAsync();

            return gebruikers.Select(g => new GebruikerDto
            {
                Gebruiker_Id = g.Gebruiker_Id,
                Voornaam = g.Voornaam,
                Achternaam = g.Achternaam,
                Email = g.Email,
                Adres = g.Adres,
                Telefoonnr = g.Telefoonnr,
                Woonplaats = g.Woonplaats,
                GebruikerType = g.GebruikerType
            }).ToList();
        }

        // GET BY ID – return DTO
        [HttpGet("{id}")]
        public async Task<ActionResult<GebruikerDto>> GetById(string id)
        {
            var g = await _context.Gebruikers.FindAsync(id);
            if (g == null) return NotFound();

            return new GebruikerDto
            {
                Gebruiker_Id = g.Gebruiker_Id,
                Voornaam = g.Voornaam,
                Achternaam = g.Achternaam,
                Email = g.Email,
                Adres = g.Adres,
                Telefoonnr = g.Telefoonnr,
                Woonplaats = g.Woonplaats,
                GebruikerType = g.GebruikerType
            };
        }

        [HttpPost]
        public async Task<ActionResult<GebruikerDto>> Create(GebruikerCreateDto dto)
        {
            if (await _context.Gebruikers.AnyAsync(g => g.Email == dto.Email))
                return Conflict("E-mail bestaat al.");
            if (await _context.Gebruikers.AnyAsync(g => g.Telefoonnr == dto.Telefoonnr))
                return Conflict("Telefoonnummer bestaat al.");

            var gebruiker = new Gebruiker
            {
                Voornaam = dto.Voornaam,
                Achternaam = dto.Achternaam,
                Email = dto.Email,
                Adres = dto.Adres,
                Telefoonnr = dto.Telefoonnr,
                Woonplaats = dto.Woonplaats,
                GebruikerType = "Klant" // of meegeven via DTO
            };

            gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, dto.Wachtwoord);

            _context.Gebruikers.Add(gebruiker);
            await _context.SaveChangesAsync();

            var result = new GebruikerDto
            {
                Gebruiker_Id = gebruiker.Gebruiker_Id,
                Voornaam = gebruiker.Voornaam,
                Achternaam = gebruiker.Achternaam,
                Email = gebruiker.Email,
                Adres = gebruiker.Adres,
                Telefoonnr = gebruiker.Telefoonnr,
                Woonplaats = gebruiker.Woonplaats,
                GebruikerType = gebruiker.GebruikerType
            };

            return CreatedAtAction(nameof(GetById),
                new { id = gebruiker.Gebruiker_Id },
                result);
        }

        // UPDATE – gebruikt UpdateDTO
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, GebruikerUpdateDto dto)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound();

            if (await _context.Gebruikers.AnyAsync(g => g.Email == dto.Email && g.Gebruiker_Id != id))
                return Conflict("E-mail in gebruik");

            gebruiker.Voornaam = dto.Voornaam;
            gebruiker.Achternaam = dto.Achternaam;
            gebruiker.Email = dto.Email;
            gebruiker.Adres = dto.Adres;
            gebruiker.Telefoonnr = dto.Telefoonnr;
            gebruiker.Woonplaats = dto.Woonplaats;
            gebruiker.GebruikerType = dto.GebruikerType;

            await _context.SaveChangesAsync();

            return Ok("Gebruiker bijgewerkt");
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound();

            _context.Gebruikers.Remove(gebruiker);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // CHANGE PASSWORD
        [HttpPost("{id}/changepassword")]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] PasswordChangeRequest dto)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound("Gebruiker niet gevonden.");

            var result = _passwordHasher.VerifyHashedPassword(gebruiker, gebruiker.Wachtwoord, dto.OldPassword);
            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Oud wachtwoord is onjuist.");

            if (dto.NewPassword.Length < 6)
                return BadRequest("Nieuw wachtwoord te kort.");

            gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Wachtwoord gewijzigd");
        }

        public class PasswordChangeRequest
        {
            public string OldPassword { get; set; }
            public string NewPassword { get; set; }
        }
    }
}