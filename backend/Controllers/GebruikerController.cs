using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FloresFuertes.Data;
using FloresFuertes.Models;

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
        public async Task<ActionResult<IEnumerable<Gebruiker>>> GetAll()
            => await _context.Gebruikers.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Gebruiker>> GetById(string id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound();
            return gebruiker;
        }

        [HttpPost]
        public async Task<ActionResult<Gebruiker>> Create(Gebruiker gebruiker)
        {
            if (await _context.Gebruikers.AnyAsync(g => g.Email == gebruiker.Email))
                return Conflict("E-mail bestaat al.");
            if (await _context.Gebruikers.AnyAsync(g => g.Telefoonnr == gebruiker.Telefoonnr))
                return Conflict("Telefoonnummer bestaat al.");

            gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, gebruiker.Wachtwoord);
            await _context.Gebruikers.AddAsync(gebruiker);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = gebruiker.Gebruiker_Id }, gebruiker);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Gebruiker gebruiker)
        {
            if (id != gebruiker.Gebruiker_Id) return BadRequest("ID mismatch");

            if (await _context.Gebruikers.AnyAsync(g => g.Email == gebruiker.Email && g.Gebruiker_Id != id))
                return Conflict("E-mail in gebruik");
            if (await _context.Gebruikers.AnyAsync(g => g.Telefoonnr == gebruiker.Telefoonnr && g.Gebruiker_Id != id))
                return Conflict("Telefoonnummer in gebruik");

            _context.Entry(gebruiker).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(gebruiker);
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

        [HttpPost("{id}/changepassword")]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] PasswordChangeRequest request)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null) return NotFound("Gebruiker niet gevonden.");

            var result = _passwordHasher.VerifyHashedPassword(gebruiker, gebruiker.Wachtwoord, request.OldPassword);
            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Oud wachtwoord is onjuist.");

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
                return BadRequest("Nieuw wachtwoord te kort.");

            gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, request.NewPassword);
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
