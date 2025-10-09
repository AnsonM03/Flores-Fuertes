using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeilingenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingenController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiling>>> GetAll()
        {
            return await _context.Veilingen
                .Include(v => v.Product)
                .Include(v => v.Veilingmeester)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Veiling>> Create(Veiling veiling)
        {
            _context.Veilingen.Add(veiling);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = veiling.Veiling_Id }, veiling);
        }
    }
}