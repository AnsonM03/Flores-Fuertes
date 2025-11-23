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
        private const string JwtSecret = "gH7$kP9!sL2@xQ5#dR8&Tz4%wB1^mN0pF3*Jk6L"; // Gebruik later Secret Manager

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginModel loginModel)
        {
            // -----------------------------
            // 1. Gebruiker zoeken
            // -----------------------------
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Email == loginModel.Email);

            if (gebruiker == null)
                return Unauthorized("E-mail of wachtwoord is onjuist.");

            // -----------------------------
            // 2. Check of account gelockt is
            // -----------------------------
            if (gebruiker.LockoutEndTime != null && gebruiker.LockoutEndTime > DateTime.UtcNow)
                return StatusCode(423, "Account geblokkeerd. Probeer later opnieuw.");

            // -----------------------------
            // 3. Wachtwoord controleren
            // -----------------------------
            var result = _passwordHasher.VerifyHashedPassword(
                gebruiker,
                gebruiker.Wachtwoord,
                loginModel.Wachtwoord
            );

            if (result == PasswordVerificationResult.Failed)
            {
                gebruiker.FailedLoginAttempts++;

                if (gebruiker.FailedLoginAttempts >= 5)
                {
                    gebruiker.LockoutEndTime = DateTime.UtcNow.AddMinutes(15);
                    gebruiker.FailedLoginAttempts = 0;
                }

                await _context.SaveChangesAsync();
                return Unauthorized("E-mail of wachtwoord is onjuist.");
            }

            // -----------------------------
            // 4. Succesvol ingelogd
            // -----------------------------
            gebruiker.FailedLoginAttempts = 0;
            gebruiker.LockoutEndTime = null;

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                gebruiker.Wachtwoord =
                    _passwordHasher.HashPassword(gebruiker, loginModel.Wachtwoord);
            }

            await _context.SaveChangesAsync();

            // -----------------------------
            // 5. JWT aanmaken
            // -----------------------------
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSecret);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, gebruiker.Gebruiker_Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, gebruiker.Email),
                new Claim("rol", gebruiker.GebruikerType.ToLower())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials =
                    new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtTokenString = tokenHandler.WriteToken(token);

            // -----------------------------
            // 6. JWT zetten in HttpOnly cookie
            // -----------------------------
            Response.Cookies.Append("token", jwtTokenString, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // MOET true worden op HTTPS / productie
                SameSite = SameSiteMode.None, // verplicht bij localhost + credentials
                Expires = DateTime.UtcNow.AddHours(2)
            });

            // -----------------------------
            // 7. Gebruiker terugsturen
            // -----------------------------
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
                token = jwtTokenString // alleen voor debug; frontend gebruikt cookie
            });
        }
    }
}