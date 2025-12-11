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
        public async Task<ActionResult<IEnumerable<VeilingProductDto>>> GetAll()
        {
            var data = await _context.VeilingProducten
                .Include(vp => vp.Product)
                .Include(vp => vp.Veiling)
                .ToListAsync();

            return Ok(data.Select(vp => new VeilingProductDto
            {
                VeilingProduct_Id = vp.VeilingProduct_Id,
                Product_Id = vp.Product_Id,
                Naam = vp.Product.Naam,
                ArtikelKenmerken = vp.Product.ArtikelKenmerken,
                Hoeveelheid = vp.Hoeveelheid,
                StartPrijs = vp.Prijs ?? vp.Product.StartPrijs,
                Foto = vp.Product.Foto
            }));
        }

        // 2️⃣ Producten van 1 specifieke veiling
        [HttpGet("veiling/{veilingId}")]
        public async Task<ActionResult<IEnumerable<VeilingProductDto>>> GetProductenVanVeiling(string veilingId)
        {
            var koppelingen = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId)
                .Include(vp => vp.Product)
                .ToListAsync();

            return Ok(koppelingen.Select(vp => new VeilingProductDto
            {
                VeilingProduct_Id = vp.VeilingProduct_Id,
                Product_Id = vp.Product_Id,
                Naam = vp.Product.Naam,
                ArtikelKenmerken = vp.Product.ArtikelKenmerken,
                Hoeveelheid = vp.Hoeveelheid,
                StartPrijs = vp.Prijs ?? vp.Product.StartPrijs,
                Foto = vp.Product.Foto   // 👈 FOTO MEEGEVEN!
            }));
        }

        // 3️⃣ Product aan veiling koppelen
        [HttpPost("koppel")]
        public async Task<IActionResult> KoppelProduct([FromBody] KoppelProductDto dto)
        {
            if (dto == null)
                return BadRequest("Body mag niet leeg zijn.");

            var veiling = await _context.Veilingen.FindAsync(dto.VeilingId);
            if (veiling == null)
                return NotFound("Veiling niet gevonden.");

            var product = await _context.Producten.FindAsync(dto.ProductId);
            if (product == null)
                return NotFound("Product niet gevonden.");

            if (dto.Hoeveelheid <= 0)
                return BadRequest("Hoeveelheid moet groter zijn dan 0.");

            if (product.Hoeveelheid < dto.Hoeveelheid)
                return BadRequest("Niet genoeg voorraad beschikbaar.");

            var koppeling = new VeilingProduct
            {
                Veiling_Id = dto.VeilingId,
                Product_Id = dto.ProductId,
                Hoeveelheid = dto.Hoeveelheid,
                Prijs = dto.Prijs
            };

            // Voorraad verminderen
            product.Hoeveelheid -= dto.Hoeveelheid;

            // Eventueel startprijs updaten
            if (dto.Prijs.HasValue)
                product.StartPrijs = dto.Prijs.Value;

            _context.VeilingProducten.Add(koppeling);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product succesvol gekoppeld.",
                koppeling
            });
        }
    }
}