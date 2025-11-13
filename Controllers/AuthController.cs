using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Models;
using FloresFuertes.Data;
using Microsoft.AspNetCore.Identity; // <-- 1. VOEG DEZE TOE

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        // 2. VOEG DE HASHER TOE
        private readonly PasswordHasher<Gebruiker> _passwordHasher = new();

        public AuthController(AppDbContext context) => _context = context;

        [HttpPost("login")]
        public async Task<ActionResult<Gebruiker>> Login(LoginModel loginModel)
        {
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Email == loginModel.Email);

            if (gebruiker == null)
            {
                return NotFound("Gebruiker niet gevonden.");
            }

            if (gebruiker.LockoutEndTime != null && gebruiker.LockoutEndTime > DateTime.UtcNow)
                return StatusCode(423, "Account geblokkeerd. Probeer later.");

            if (gebruiker.Wachtwoord != loginModel.Wachtwoord)
            {
                gebruiker.FailedLoginAttempts += 1;

                if (gebruiker.FailedLoginAttempts >= 5)
                {
                    gebruiker.LockoutEndTime = DateTime.Now.AddMinutes(15);
                    gebruiker.FailedLoginAttempts = 0; // Reset after lockout
                }
                await _context.SaveChangesAsync();
                return Unauthorized("E-mail of wachtwoord is onjuist.");
            }
            // --- EINDE CORRECTIE ---

            // Wachtwoord is correct, reset faalpogingen
            gebruiker.FailedLoginAttempts = 0;
            gebruiker.LockoutEndTime = null;
            await _context.SaveChangesAsync();

            return Ok(gebruiker);
        }
    }
}