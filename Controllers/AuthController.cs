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

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<Gebruiker>> Login(LoginModel loginModel)
        {
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Email == loginModel.Email);

            if (gebruiker == null)
            {
                // Gebruik een algemene foutmelding om "user enumeration" te voorkomen
                return Unauthorized("E-mail of wachtwoord is onjuist.");
            }

            if(gebruiker.LockoutEndTime != null && gebruiker.LockoutEndTime > DateTime.Now)
            {
                return StatusCode(423, "Account is geblokkeerd. Probeer het later opnieuw.");
            }

            // --- 3. DIT IS DE CORRECTIE ---
            // Vervang de foute '!=' controle
            var result = _passwordHasher.VerifyHashedPassword(gebruiker, gebruiker.Wachtwoord, loginModel.Wachtwoord);

            if (result == PasswordVerificationResult.Failed)
            {
                // Het wachtwoord is fout, voer de faallogica uit
                gebruiker.FailedLoginAttempts += 1;

                if (gebruiker.FailedLoginAttempts >= 5)
                {
                    gebruiker.LockoutEndTime = DateTime.Now.AddMinutes(15);
                    gebruiker.FailedLoginAttempts = 0; // Reset na lockout
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