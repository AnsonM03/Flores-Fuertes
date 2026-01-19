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

        // ✅ Alle veilingen (zonder cycles)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VeilingListDto>>> GetAll()
        {
            var data = await _context.Veilingen
                .Include(v => v.Veilingmeester)
                .AsNoTracking()
                .Select(v => new VeilingListDto
                {
                    Veiling_Id = v.Veiling_Id,
                    VeilingPrijs = v.VeilingPrijs,
                    VeilingDatum = v.VeilingDatum,
                    StartTijd = v.StartTijd,
                    EindTijd = v.EindTijd,
                    Kloklocatie = v.Kloklocatie,
                    Status = v.Status,
                    Veilingmeester_Id = v.Veilingmeester_Id,
                    VeilingmeesterNaam = v.Veilingmeester.Voornaam + " " + v.Veilingmeester.Achternaam,
                    MinimumPrijs = v.MinimumPrijs
                })
                .ToListAsync();

            return Ok(data);
        }

        // ✅ 1 veiling detail (zonder cycles)
        [HttpGet("{id}")]
        public async Task<ActionResult<VeilingDetailDto>> GetById(string id)
        {
            var veiling = await _context.Veilingen
                .Include(v => v.Veilingmeester)
                .Include(v => v.VeilingProducten)
                    .ThenInclude(vp => vp.Product)
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Veiling_Id == id);

            if (veiling == null) return NotFound(new { message = "Veiling niet gevonden" });

            var dto = new VeilingDetailDto
            {
                Veiling_Id = veiling.Veiling_Id,
                VeilingPrijs = veiling.VeilingPrijs,
                VeilingDatum = veiling.VeilingDatum,
                StartTijd = veiling.StartTijd,
                EindTijd = veiling.EindTijd,
                Kloklocatie = veiling.Kloklocatie,
                Status = veiling.Status,
                Veilingmeester_Id = veiling.Veilingmeester_Id,
                VeilingmeesterNaam = veiling.Veilingmeester.Voornaam + " " + veiling.Veilingmeester.Achternaam,
                MinimumPrijs = veiling.MinimumPrijs,

                VeilingProducten = veiling.VeilingProducten.Select(vp => new VeilingProductDto
                {
                    VeilingProduct_Id = vp.VeilingProduct_Id,
                    Veiling_Id = vp.Veiling_Id,
                    Product_Id = vp.Product_Id,
                    Hoeveelheid = vp.Hoeveelheid,
                    Status = vp.Status,

                    Naam = vp.Product?.Naam ?? "",
                    ArtikelKenmerken = vp.Product?.ArtikelKenmerken ?? "",
                    Foto = vp.Product?.Foto,
                    StartPrijs = vp.Product?.StartPrijs ?? 0
                }).ToList()
            };

            return Ok(dto);
        }

        // ✅ Veiling aanmaken (Dutch auction: GEEN prijs/tijden hier)
        [HttpPost]
        public async Task<IActionResult> CreateVeiling([FromBody] VeilingCreateDto dto)
        {
            if (dto == null) return BadRequest("Ongeldige invoer");
            if (string.IsNullOrWhiteSpace(dto.Kloklocatie)) return BadRequest("Kloklocatie is verplicht.");
            if (string.IsNullOrWhiteSpace(dto.Veilingmeester_Id)) return BadRequest("Veilingmeester_Id is verplicht.");

            var nieuweVeiling = new Veiling
            {
                Veiling_Id = Guid.NewGuid().ToString(),
                VeilingDatum = dto.VeilingDatum ?? DateOnly.FromDateTime(DateTime.UtcNow),
                Kloklocatie = dto.Kloklocatie,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "wachtend" : dto.Status,
                Veilingmeester_Id = dto.Veilingmeester_Id,

                // Dutch auction: pas invullen bij StartVeiling
                StartTijd = null,
                EindTijd = null,
                VeilingPrijs = null,
                MinimumPrijs = null
            };

            _context.Veilingen.Add(nieuweVeiling);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById),
                new { id = nieuweVeiling.Veiling_Id },
                new { nieuweVeiling.Veiling_Id });
        }

        // Wachtlijst per veiling
        [HttpGet("veiling/{veilingId}/wachtlijst")]
        public async Task<IActionResult> GetWachtlijst(string veilingId)
        {
            var lijst = await _context.VeilingProducten
                .Where(vp =>
                    vp.Veiling_Id == veilingId &&
                    (vp.Status ?? "").Trim().ToLower() == "wachtend"
                )
                .Include(vp => vp.Product)
                .AsNoTracking()
                .Select(vp => new VeilingProductDto
                {
                    VeilingProduct_Id = vp.VeilingProduct_Id,
                    Veiling_Id = vp.Veiling_Id,
                    Product_Id = vp.Product_Id,
                    Hoeveelheid = vp.Hoeveelheid,
                    Status = vp.Status,
                    Naam = vp.Product!.Naam,
                    ArtikelKenmerken = vp.Product!.ArtikelKenmerken,
                    Foto = vp.Product!.Foto,
                    StartPrijs = vp.Product!.StartPrijs
                })
                .ToListAsync();

            return Ok(lijst);
        }

        // ✅ Actieve producten per veiling
        [HttpGet("veiling/{veilingId}/actief")]
        public async Task<IActionResult> GetActieveProducten(string veilingId)
        {
            var lijst = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId && vp.Status == "actief")
                .Include(vp => vp.Product)
                .AsNoTracking()
                .Select(vp => new VeilingProductDto
                {
                    VeilingProduct_Id = vp.VeilingProduct_Id,
                    Veiling_Id = vp.Veiling_Id,
                    Product_Id = vp.Product_Id,
                    Hoeveelheid = vp.Hoeveelheid,
                    Status = vp.Status,

                    Naam = vp.Product!.Naam,
                    ArtikelKenmerken = vp.Product!.ArtikelKenmerken,
                    Foto = vp.Product!.Foto,
                    StartPrijs = vp.Product!.StartPrijs
                })
                .ToListAsync();

            return Ok(lijst);
        }

        // ✅ Product activeren (1 tegelijk actief)
        [HttpPut("{veilingProductId}/activeer")]
        public async Task<IActionResult> ActiveerProduct(string veilingProductId)
        {
            var vp = await _context.VeilingProducten
                .FirstOrDefaultAsync(x => x.VeilingProduct_Id == veilingProductId);

            if (vp == null) return NotFound("Koppeling niet gevonden.");

            var andereActieve = await _context.VeilingProducten
                .Where(x => x.Veiling_Id == vp.Veiling_Id &&
                            x.Status == "actief" &&
                            x.VeilingProduct_Id != vp.VeilingProduct_Id)
                .ToListAsync();

            foreach (var item in andereActieve)
                item.Status = "afgerond";

            vp.Status = "actief";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product geactiveerd", veilingProductId });
        }

        // ✅ Product weigeren
        [HttpPut("{veilingProductId}/weiger")]
        public async Task<IActionResult> WeigerProduct(string veilingProductId)
        {
            var vp = await _context.VeilingProducten
                .FirstOrDefaultAsync(x => x.VeilingProduct_Id == veilingProductId);

            if (vp == null) return NotFound("Koppeling niet gevonden.");

            vp.Status = "geweigerd";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product geweigerd", veilingProductId });
        }

        // ✅ Koppel product aan veiling -> standaard "wachtend"
        [HttpPost("{veilingId}/koppel")]
        public async Task<IActionResult> KoppelProduct(string veilingId, [FromBody] KoppelProductDto dto)
        {
            if (dto == null) return BadRequest("Ongeldige invoer");

            var veiling = await _context.Veilingen.FindAsync(veilingId);
            if (veiling == null) return NotFound("Veiling niet gevonden.");

            var product = await _context.Producten.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Product niet gevonden.");

            if (dto.Hoeveelheid <= 0) return BadRequest("Hoeveelheid moet groter zijn dan 0.");
            if (product.Hoeveelheid < dto.Hoeveelheid) return BadRequest("Niet genoeg voorraad.");

            var koppeling = new VeilingProduct
            {
                Veiling_Id = veilingId,
                Product_Id = dto.ProductId,
                Hoeveelheid = dto.Hoeveelheid,
                Prijs = dto.Prijs,
                Status = "wachtend"
            };

            _context.VeilingProducten.Add(koppeling);

            // voorraad afboeken
            product.Hoeveelheid -= dto.Hoeveelheid;

            // als je een prijs meegeeft bij koppelen, zet je die als StartPrijs op product
            if (dto.Prijs.HasValue)
                product.StartPrijs = dto.Prijs.Value;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product staat in wachtlijst",
                veilingProductId = koppeling.VeilingProduct_Id
            });
        }

        // ✅ Veiling starten (Dutch auction klok)
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartVeiling(string id, [FromBody] StartVeilingDto? dto)
        {
            var veiling = await _context.Veilingen.FirstOrDefaultAsync(v => v.Veiling_Id == id);
            if (veiling == null) return NotFound(new { message = "Veiling niet gevonden" });

            // vereist actief product
            var actiefVp = await _context.VeilingProducten
                .Include(vp => vp.Product)
                .FirstOrDefaultAsync(vp => vp.Veiling_Id == id && vp.Status == "actief");

            if (actiefVp == null)
                return BadRequest(new { message = "Geen actief product. Activeer eerst een product." });

            var duur = dto?.DuurInSeconden ?? 20;
            if (duur < 5) duur = 5;
            if (duur > 120) duur = 120;

            var minPrijs = dto?.MinimumPrijs ?? 0m;
            if (minPrijs < 0) minPrijs = 0;

            // startprijs uit actief product
            var startPrijs = (decimal)(actiefVp.Prijs ?? (actiefVp.Product?.StartPrijs ?? 0));

            if (startPrijs <= minPrijs)
                return BadRequest(new { message = "Minimum prijs moet lager zijn dan startprijs." });

            veiling.StartTijd = DateTime.UtcNow;
            veiling.EindTijd = veiling.StartTijd.Value.AddSeconds(duur);
            veiling.Status = "actief";
            veiling.MinimumPrijs = minPrijs;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                veiling_Id = veiling.Veiling_Id,
                startTijd = veiling.StartTijd,
                eindTijd = veiling.EindTijd,
                status = veiling.Status,
                startPrijs,
                minimumPrijs = minPrijs,
                actiefVeilingProductId = actiefVp.VeilingProduct_Id
            });
        }

        // ✅ Veiling verwijderen
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiling(string id)
        {
            var veiling = await _context.Veilingen.FindAsync(id);
            if (veiling == null) return NotFound(new { message = "Veiling niet gevonden" });

            _context.Veilingen.Remove(veiling);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}