using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Models;
using FloresFuertes.Data;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

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
                return NotFound("Gebruiker niet gevonden.");
            }

            if(gebruiker.LockoutEndTime != null && gebruiker.LockoutEndTime > DateTime.Now)
            {
                return StatusCode(423, "Account is geblokkeerd. Probeer het later opnieuw.");
            }

            if (gebruiker.Wachtwoord != loginModel.Wachtwoord)
            {
                gebruiker.FailedLoginAttempts += 1;

                if (gebruiker.FailedLoginAttempts >= 5)
                {
                    gebruiker.LockoutEndTime = DateTime.Now.AddMinutes(15);
                    gebruiker.FailedLoginAttempts = 0; // Reset after lockout
                }
                await _context.SaveChangesAsync();
                return Unauthorized("Ongeldig wachtwoord.");
            }

            gebruiker.FailedLoginAttempts = 0;
            gebruiker.LockoutEndTime = null;
            await _context.SaveChangesAsync();

            return Ok(gebruiker);
        }
    }
}