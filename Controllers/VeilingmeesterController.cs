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
        public async Task<ActionResult<Veilingmeester>> Create(Veilingmeester meester)
        {
            _context.Veilingmeesters.Add(meester);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = meester.Gebruiker_Id }, meester);
        }
    }
}