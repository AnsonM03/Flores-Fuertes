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

        // GET - alle gebruikers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Gebruiker>>> GetAll()
        {
            return await _context.Gebruikers.ToListAsync();
        }

        // GET - specifieke gebruiker op ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Gebruiker>> GetById(string id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null)
                return NotFound();
            return gebruiker;
        }

        // PUT - gebruiker bijwerken met controles
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Gebruiker gebruiker)
        {
            if (id != gebruiker.Gebruiker_Id)
                return BadRequest("ID komt niet overeen.");

            bool emailBestaatAl = await _context.Gebruikers
                .AnyAsync(g => g.Email == gebruiker.Email && g.Gebruiker_Id != id);

            if (emailBestaatAl)
                return Conflict("E-mailadres is al in gebruik door een andere gebruiker.");

            bool telefoonBestaatAl = await _context.Gebruikers
                .AnyAsync(g => g.Telefoonnr == gebruiker.Telefoonnr && g.Gebruiker_Id != id);

            if (telefoonBestaatAl)
                return Conflict("Telefoonnummer is al in gebruik door een andere gebruiker.");

            _context.Entry(gebruiker).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Gebruikers.Any(e => e.Gebruiker_Id == id))
                    return NotFound();
                else
                    throw;
            }

            return Ok(gebruiker);
        }

        // POST - nieuwe gebruiker aanmaken met controle op dubbele email en telefoonnummer
        [HttpPost]
        public async Task<ActionResult<Gebruiker>> Create(Gebruiker gebruiker)
        {
            bool emailBestaatAl = await _context.Gebruikers
                .AnyAsync(g => g.Email == gebruiker.Email);

            if (emailBestaatAl)
                return Conflict("Een account met dit e-mailadres bestaat al.");

            bool telefoonBestaatAl = await _context.Gebruikers
                .AnyAsync(g => g.Telefoonnr == gebruiker.Telefoonnr);

            if (telefoonBestaatAl)
                return Conflict("Een account met dit telefoonnummer bestaat al.");

            // Hash het wachtwoord voordat het opgeslagen wordt
            gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, gebruiker.Wachtwoord);

            await _context.Gebruikers.AddAsync(gebruiker);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = gebruiker.Gebruiker_Id }, gebruiker);
        }

        // POST - wachtwoord wijzigen
        [HttpPost("{id}/changepassword")]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] PasswordChangeRequest request)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null)
                return NotFound("Gebruiker niet gevonden.");

            // Controleer oud wachtwoord
            var result = _passwordHasher.VerifyHashedPassword(gebruiker, gebruiker.Wachtwoord, request.OldPassword);
            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Huidig wachtwoord is onjuist.");

            // Optioneel: extra validatie nieuw wachtwoord
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
                return BadRequest("Nieuw wachtwoord is te kort.");

            gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Wachtwoord succesvol gewijzigd.");
        }

        public class PasswordChangeRequest
        {
            public string OldPassword { get; set; }
            public string NewPassword { get; set; }
        }

        // DELETE - gebruiker verwijderen
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var gebruiker = await _context.Gebruikers.FindAsync(id);
            if (gebruiker == null)
                return NotFound();

            _context.Gebruikers.Remove(gebruiker);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
