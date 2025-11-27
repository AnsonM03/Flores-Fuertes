using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeilingmeestersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingmeestersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veilingmeester>>> GetAll()
        {
            return await _context.Veilingmeesters.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Veilingmeester>> Create(VeilingmeesterCreateDto dto)
        {
            var veilingmeester = new Veilingmeester
            {
                Voornaam = dto.Voornaam,
                Achternaam = dto.Achternaam,
                Email = dto.Email,
                Adres = dto.Adres,
                Telefoonnr = dto.Telefoonnr,
                Woonplaats = dto.Woonplaats,
                Wachtwoord = dto.Wachtwoord
            };

            await _context.Veilingmeesters.AddAsync(veilingmeester);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll),
                new { id = veilingmeester.Gebruiker_Id },
                veilingmeester);
        }
    }
}