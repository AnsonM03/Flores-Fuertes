using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AanvoerdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AanvoerdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aanvoerder>>> GetAll()
        {
            return await _context.Aanvoerders.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Aanvoerder>> GetById(string id)
        {
            var aanvoerder = await _context.Aanvoerders.FindAsync(id);
            if (aanvoerder == null) return NotFound();
            return aanvoerder;
        }

        [HttpPost]
        public async Task<ActionResult<Aanvoerder>> Create(AanvoerderCreateDto dto)
        {
            var aanvoerder = new Aanvoerder
            {
                Voornaam = dto.Voornaam,
                Achternaam = dto.Achternaam,
                Email = dto.Email,
                Adres = dto.Adres,
                Telefoonnr = dto.Telefoonnr,
                Woonplaats = dto.Woonplaats,
                Wachtwoord = dto.Wachtwoord
            };

            await _context.Aanvoerders.AddAsync(aanvoerder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll),
                new { id = aanvoerder.Gebruiker_Id },
                aanvoerder);
        }
    }
}