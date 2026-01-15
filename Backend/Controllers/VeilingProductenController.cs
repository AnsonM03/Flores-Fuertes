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

        // ✅ 1) Alle koppelingen (admin/debug) - nu met Veiling_Id + Status
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VeilingProductDto>>> GetAll()
        {
            var data = await _context.VeilingProducten
                .Include(vp => vp.Product)
                .AsNoTracking()
                .ToListAsync();

            return Ok(data.Select(MapToDto));
        }

        // ✅ 2) Alle producten van 1 veiling (ongeacht status)
        [HttpGet("veiling/{veilingId}")]
        public async Task<ActionResult<IEnumerable<VeilingProductDto>>> GetProductenVanVeiling(string veilingId)
        {
            var data = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId)
                .Include(vp => vp.Product)
                .AsNoTracking()
                .ToListAsync();

            return Ok(data.Select(MapToDto));
        }

        // ✅ 2b) Wachtlijst van 1 veiling
        [HttpGet("veiling/{veilingId}/wachtlijst")]
        public async Task<ActionResult<IEnumerable<VeilingProductDto>>> GetWachtlijst(string veilingId)
        {
            var data = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId && vp.Status == "wachtend")
                .Include(vp => vp.Product)
                .AsNoTracking()
                .ToListAsync();

            return Ok(data.Select(MapToDto));
        }

        // ✅ 2c) Actief product (lijst, maar normaal max 1)
        [HttpGet("veiling/{veilingId}/actief")]
        public async Task<ActionResult<IEnumerable<VeilingProductDto>>> GetActief(string veilingId)
        {
            var data = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId && vp.Status == "actief")
                .Include(vp => vp.Product)
                .AsNoTracking()
                .ToListAsync();

            return Ok(data.Select(MapToDto));
        }

        // ✅ 2d) Handig: geef 1 actief product terug (of null)
        [HttpGet("veiling/{veilingId}/actief/one")]
        public async Task<ActionResult<VeilingProductDto?>> GetActiefOne(string veilingId)
        {
            var vp = await _context.VeilingProducten
                .Where(x => x.Veiling_Id == veilingId && x.Status == "actief")
                .Include(x => x.Product)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            return Ok(vp == null ? null : MapToDto(vp));
        }

        // ✅ 3) Koppelen (status altijd "wachtend")
        [HttpPost("koppel")]
        public async Task<IActionResult> KoppelProduct([FromBody] KoppelProductDto dto)
        {
            if (dto == null) return BadRequest("Body mag niet leeg zijn.");

            var veiling = await _context.Veilingen.FindAsync(dto.VeilingId);
            if (veiling == null) return NotFound("Veiling niet gevonden.");

            var product = await _context.Producten.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Product niet gevonden.");

            if (dto.Hoeveelheid <= 0)
                return BadRequest("Hoeveelheid moet groter zijn dan 0.");

            if (product.Hoeveelheid < dto.Hoeveelheid)
                return BadRequest("Niet genoeg voorraad beschikbaar.");

            var koppeling = new VeilingProduct
            {
                Veiling_Id = dto.VeilingId,
                Product_Id = dto.ProductId,
                Hoeveelheid = dto.Hoeveelheid,
                Prijs = dto.Prijs,
                Status = "wachtend"
            };

            // voorraad afboeken
            product.Hoeveelheid -= dto.Hoeveelheid;

            // optioneel: als je prijs bij koppelen meegeeft, zet je hem als startprijs op product
            if (dto.Prijs.HasValue)
                product.StartPrijs = dto.Prijs.Value;

            _context.VeilingProducten.Add(koppeling);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product succesvol gekoppeld.",
                veilingProductId = koppeling.VeilingProduct_Id
            });
        }

        // ✅ 4) Activeren: 1 tegelijk actief per veiling
        [HttpPut("{veilingProductId}/activeer")]
        public async Task<IActionResult> Activeer(string veilingProductId)
        {
            var vp = await _context.VeilingProducten.FirstOrDefaultAsync(x => x.VeilingProduct_Id == veilingProductId);
            if (vp == null) return NotFound("Koppeling niet gevonden.");

            // maak alle andere actieve in dezelfde veiling "afgelopen"
            var andereActieve = await _context.VeilingProducten
                .Where(x => x.Veiling_Id == vp.Veiling_Id && x.Status == "actief" && x.VeilingProduct_Id != vp.VeilingProduct_Id)
                .ToListAsync();

            foreach (var a in andereActieve)
                a.Status = "afgelopen";

            vp.Status = "actief";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product geactiveerd", veilingProductId });
        }

        // ✅ 5) Weigeren
        [HttpPut("{veilingProductId}/weiger")]
        public async Task<IActionResult> Weiger(string veilingProductId)
        {
            var vp = await _context.VeilingProducten.FirstOrDefaultAsync(x => x.VeilingProduct_Id == veilingProductId);
            if (vp == null) return NotFound("Koppeling niet gevonden.");

            vp.Status = "geweigerd";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product geweigerd", veilingProductId });
        }

        // -----------------------------
        // Mapper (1 plek, consistent)
        // -----------------------------
        private static VeilingProductDto MapToDto(VeilingProduct vp)
        {
            return new VeilingProductDto
            {
                VeilingProduct_Id = vp.VeilingProduct_Id,
                Veiling_Id = vp.Veiling_Id,
                Product_Id = vp.Product_Id,
                Hoeveelheid = vp.Hoeveelheid,
                Status = vp.Status,

                Naam = vp.Product?.Naam ?? "",
                ArtikelKenmerken = vp.Product?.ArtikelKenmerken ?? "",
                Foto = vp.Product?.Foto,
                StartPrijs = (vp.Prijs ?? vp.Product?.StartPrijs) ?? 0
            };
        }
    }
}