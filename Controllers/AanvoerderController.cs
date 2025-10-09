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

        [HttpPost]
        public async Task<ActionResult<Aanvoerder>> Create(Aanvoerder aanvoerder)
        {
            _context.Aanvoerders.Add(aanvoerder);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = aanvoerder.Gebruiker_Id }, aanvoerder);
        }
    }
}