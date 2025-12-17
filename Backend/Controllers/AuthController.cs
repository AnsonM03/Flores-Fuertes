using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using FloresFuertes.Data;
using FloresFuertes.Models;
using FloresFuertes.DTOs.Auth;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<Gebruiker> _passwordHasher = new();
        private const string JwtSecret = "gH7$kP9!sL2@xQ5#dR8&Tz4%wB1^mN0pF3*Jk6L";

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            // 1. Gebruiker zoeken
            var gebruiker = await _context.Gebruikers
                .FirstOrDefaultAsync(g => g.Email == dto.Email);

            if (gebruiker == null)
                return Unauthorized("E-mail of wachtwoord is onjuist.");

            // 2. Account lock check
            if (gebruiker.LockoutEndTime != null && gebruiker.LockoutEndTime > DateTime.UtcNow)
                return StatusCode(423, "Account tijdelijk geblokkeerd. Probeer later.");

            // 3. Wachtwoord check
            var result = _passwordHasher.VerifyHashedPassword(
                gebruiker,
                gebruiker.Wachtwoord,
                dto.Wachtwoord
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

            // 4. Succesvolle login
            gebruiker.FailedLoginAttempts = 0;
            gebruiker.LockoutEndTime = null;

            if (result == PasswordVerificationResult.SuccessRehashNeeded)
            {
                gebruiker.Wachtwoord =
                    _passwordHasher.HashPassword(gebruiker, dto.Wachtwoord);
            }

            await _context.SaveChangesAsync();

            // 5. JWT genereren
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(JwtSecret);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, gebruiker.Gebruiker_Id),
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
            var jwtString = tokenHandler.WriteToken(token);

            // 6. JWT zetten in HttpOnly cookie
            Response.Cookies.Append("token", jwtString, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,      // op productie: true!
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(2)
            });

            // 7. Bouw DTO response
            var responseDto = new AuthResponseDto
            {
                Gebruiker_Id = gebruiker.Gebruiker_Id,
                Voornaam = gebruiker.Voornaam,
                Achternaam = gebruiker.Achternaam,
                Email = gebruiker.Email,
                Adres = gebruiker.Adres,
                Telefoonnr = gebruiker.Telefoonnr,
                Woonplaats = gebruiker.Woonplaats,
                GebruikerType = gebruiker.GebruikerType,
                Token = jwtString // voor debug
            };

            return Ok(responseDto);
        }
    }
}