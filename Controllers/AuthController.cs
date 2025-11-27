using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Models;
using FloresFuertes.Data;
using Microsoft.AspNetCore.Identity;

using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<Gebruiker> _passwordHasher = new();
        private const string JwtSecret = "gH7$kP9!sL2@xQ5#dR8&Tz4%wB1^mN0pF3*Jk6L"; // Vervang dit door een veilige sleutel
        public AuthController(AppDbContext context) => _context = context;

        [HttpPost("login")]
        public async Task<ActionResult<Gebruiker>> Login(LoginModel loginModel)
        {
            // 1. Zoek de gebruiker op e-mail
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Email == loginModel.Email);

            if (gebruiker == null)
            {
                // Voor veiligheid kun je beter ook Unauthorized teruggeven, 
                // zodat hackers niet kunnen raden welke emails bestaan.
                return Unauthorized("E-mail of wachtwoord is onjuist.");
            }

            // 2. Check lockout
            if (gebruiker.LockoutEndTime != null && gebruiker.LockoutEndTime > DateTime.UtcNow)
                return StatusCode(423, "Account geblokkeerd. Probeer later.");

            // 3. VERIFIEER HET WACHTWOORD MET DE HASHER
            // Dit is de cruciale wijziging:
            var result = _passwordHasher.VerifyHashedPassword(gebruiker, gebruiker.Wachtwoord, loginModel.Wachtwoord);

            if (result == PasswordVerificationResult.Failed)
            {
                // Fout wachtwoord logica
                gebruiker.FailedLoginAttempts += 1;

                if (gebruiker.FailedLoginAttempts >= 5)
                {
                    gebruiker.LockoutEndTime = DateTime.UtcNow.AddMinutes(15);
                    gebruiker.FailedLoginAttempts = 0;
                }
                await _context.SaveChangesAsync();
                return Unauthorized("E-mail of wachtwoord is onjuist.");
            }

            // 4. Succesvol ingelogd
            gebruiker.FailedLoginAttempts = 0;
            gebruiker.LockoutEndTime = null;

            // Optioneel: Als het algoritme is geüpdatet, sla de nieuwe hash op
            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                gebruiker.Wachtwoord = _passwordHasher.HashPassword(gebruiker, loginModel.Wachtwoord);
            }

            await _context.SaveChangesAsync();

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSecret);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, gebruiker.Gebruiker_Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, gebruiker.Email),
                new Claim("rol", gebruiker.GebruikerType.ToLower()), // rol claim in lowercase
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                gebruiker_Id = gebruiker.Gebruiker_Id,
                voornaam = gebruiker.Voornaam,
                achternaam = gebruiker.Achternaam,
                email = gebruiker.Email,
                adres = gebruiker.Adres,
                telefoonnr = gebruiker.Telefoonnr,
                woonplaats = gebruiker.Woonplaats,
                gebruikerType = gebruiker.GebruikerType,
                token = tokenHandler.WriteToken(token)
            });
        }
    }
}