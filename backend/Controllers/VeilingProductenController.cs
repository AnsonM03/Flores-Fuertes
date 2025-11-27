using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeilingProductenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VeilingProductenController(AppDbContext context)
        {
            _context = context;
        }

        // 1️⃣ ALLE koppelingen
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VeilingProduct>>> GetAll()
        {
            return Ok(await _context.VeilingProducten
                .Include(vp => vp.Product)
                .Include(vp => vp.Veiling)
                .ToListAsync());
        }

        // 2️⃣ Producten van 1 veiling
        [HttpGet("veiling/{veilingId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetProductenVanVeiling(string veilingId)
        {
            var koppelingen = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId)
                .Include(vp => vp.Product)
                .ToListAsync();

            return Ok(koppelingen.Select(vp => new
            {
                vp.VeilingProduct_Id,
                Product_Id = vp.Product!.Product_Id,
                vp.Hoeveelheid,
                vp.Prijs,
                naam = vp.Product.Naam,
                artikelKenmerken = vp.Product.ArtikelKenmerken,
                startPrijs = vp.Prijs ?? vp.Product.StartPrijs
            }));
        }

        // 3️⃣ Koppelen
        [HttpPost("koppel")]
        public async Task<IActionResult> KoppelProduct([FromBody] KoppelProductDto dto)
        {
            if (dto == null)
                return BadRequest("Body mag niet leeg zijn");

            var veiling = await _context.Veilingen.FindAsync(dto.VeilingId);
            if (veiling == null)
                return NotFound("Veiling niet gevonden");

            var product = await _context.Producten.FindAsync(dto.ProductId);
            if (product == null)
                return NotFound("Product niet gevonden");

            if (dto.Hoeveelheid <= 0)
                return BadRequest("Hoeveelheid moet groter zijn dan 0");

            if (product.Hoeveelheid < dto.Hoeveelheid)
                return BadRequest("Niet genoeg voorraad");

            var vp = new VeilingProduct
            {
                Veiling_Id = dto.VeilingId,
                Product_Id = dto.ProductId,
                Hoeveelheid = dto.Hoeveelheid,
                Prijs = dto.Prijs
            };

            _context.VeilingProducten.Add(vp);

            // voorraad updaten
            product.Hoeveelheid -= dto.Hoeveelheid;

            if (dto.Prijs.HasValue)
                product.StartPrijs = dto.Prijs.Value;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product gekoppeld", koppeling = vp });
        }
    }
}