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

            if (gebruiker.Wachtwoord != loginModel.Wachtwoord)
            {
                return Unauthorized("Ongeldig wachtwoord.");
            }

            return Ok(gebruiker);
        }
    }
}