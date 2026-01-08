using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
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
                    VeilingmeesterNaam = v.Veilingmeester.Voornaam + " " + v.Veilingmeester.Achternaam
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

            if (veiling == null) return NotFound();

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

        // ✅ Veiling aanmaken (zonder product)
        [HttpPost]
        public async Task<IActionResult> CreateVeiling([FromBody] VeilingCreateDto dto)
        {
            if (dto == null) return BadRequest("Ongeldige invoer");

            var nieuweVeiling = new Veiling
            {
                Veiling_Id = Guid.NewGuid().ToString(),
                VeilingPrijs = dto.VeilingPrijs,
                VeilingDatum = dto.VeilingDatum,
                StartTijd = dto.StartTijd,
                EindTijd = dto.EindTijd,
                Kloklocatie = dto.Kloklocatie,
                Status = dto.Status,
                Veilingmeester_Id = dto.Veilingmeester_Id
            };

            _context.Veilingen.Add(nieuweVeiling);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById),
                new { id = nieuweVeiling.Veiling_Id },
                new { nieuweVeiling.Veiling_Id });
        }

        // ✅ Wachtlijst per veiling
        [HttpGet("veiling/{veilingId}/wachtlijst")]
        public async Task<IActionResult> GetWachtlijst(string veilingId)
        {
            var lijst = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId && vp.Status == "wachtend")
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

        // ✅ Actieve producten per veiling (voor klok)
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

        // ✅ Product activeren
        [HttpPut("{veilingProductId}/activeer")]
        public async Task<IActionResult> ActiveerProduct(string veilingProductId)
        {
            var vp = await _context.VeilingProducten
                .FirstOrDefaultAsync(x => x.VeilingProduct_Id == veilingProductId);

            if (vp == null) return NotFound("Koppeling niet gevonden.");

            // 1 tegelijk actief in dezelfde veiling
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

        // ✅ Aanvoerder koppelt product aan veiling -> standaard "wachtend"
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

            // prijs aanpassen indien opgegeven
            if (dto.Prijs.HasValue)
                product.StartPrijs = dto.Prijs.Value;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product staat in wachtlijst",
                veilingProductId = koppeling.VeilingProduct_Id
            });
        }

        // ✅ Veiling starten (Dutch auction klok) — return start/eind
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartVeiling(string id, [FromBody] StartVeilingDto? dto)
        {
            var veiling = await _context.Veilingen.FirstOrDefaultAsync(v => v.Veiling_Id == id);
            if (veiling == null) return NotFound(new { message = "Veiling niet gevonden" });

            var duur = dto?.DuurInSeconden ?? 20;
            if (duur < 5) duur = 5;
            if (duur > 120) duur = 120;

            veiling.StartTijd = DateTime.UtcNow;
            veiling.EindTijd = veiling.StartTijd.AddSeconds(duur);
            veiling.Status = "actief";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                veiling_Id = veiling.Veiling_Id,
                startTijd = veiling.StartTijd,
                eindTijd = veiling.EindTijd,
                status = veiling.Status
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