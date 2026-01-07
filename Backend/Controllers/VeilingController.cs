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

        // ✅ Alle veilingen + veilingmeester + gekoppelde producten
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veiling>>> GetAll()
        {
            return await _context.Veilingen
                .Include(v => v.Veilingmeester)
                .Include(v => v.VeilingProducten)
                    .ThenInclude(vp => vp.Product)
                .ToListAsync();
        }

        // ✅ 1 veiling + veilingmeester + gekoppelde producten
        [HttpGet("{id}")]
        public async Task<ActionResult<Veiling>> GetById(string id)
        {
            var veiling = await _context.Veilingen
                .Include(v => v.Veilingmeester)
                .Include(v => v.VeilingProducten)
                    .ThenInclude(vp => vp.Product)
                .FirstOrDefaultAsync(v => v.Veiling_Id == id);

            if (veiling == null)
                return NotFound();

            return Ok(veiling);
        }

        // ✅ Veiling aanmaken (zonder product)
        [HttpPost]
        public async Task<ActionResult<Veiling>> CreateVeiling([FromBody] VeilingCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Ongeldige invoer");

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

            var completeVeiling = await _context.Veilingen
                .Include(v => v.Veilingmeester)
                .Include(v => v.VeilingProducten)
                    .ThenInclude(vp => vp.Product)
                .FirstOrDefaultAsync(v => v.Veiling_Id == nieuweVeiling.Veiling_Id);

            return CreatedAtAction(nameof(GetById), new { id = nieuweVeiling.Veiling_Id }, completeVeiling);
        }

        // ✅ Wachtlijst per veiling (alleen veilingmeester)
        [HttpGet("veiling/{veilingId}/wachtlijst")]
        [Authorize(Roles = "Veilingmeester")]
        public async Task<IActionResult> GetWachtlijst(string veilingId)
        {
            var lijst = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId && vp.Status == "wachtend")
                .Include(vp => vp.Product)
                .ToListAsync();

            return Ok(lijst);
        }

        // ✅ Actieve producten per veiling (handig voor klok)
        [HttpGet("veiling/{veilingId}/actief")]
        public async Task<IActionResult> GetActieveProducten(string veilingId)
        {
            var lijst = await _context.VeilingProducten
                .Where(vp => vp.Veiling_Id == veilingId && vp.Status == "actief")
                .Include(vp => vp.Product)
                .ToListAsync();

            return Ok(lijst);
        }

        // ✅ Product activeren (alleen veilingmeester)
        [HttpPut("{veilingProductId}/activeer")]
        [Authorize(Roles = "Veilingmeester")]
        public async Task<IActionResult> ActiveerProduct(string veilingProductId)
        {
            var vp = await _context.VeilingProducten
                .FirstOrDefaultAsync(x => x.VeilingProduct_Id == veilingProductId);

            if (vp == null) return NotFound("Koppeling niet gevonden.");

            // (OPTIONEEL) Zorg dat er maar 1 tegelijk actief is binnen dezelfde veiling
            var andereActieve = await _context.VeilingProducten
                .Where(x => x.Veiling_Id == vp.Veiling_Id && x.Status == "actief" && x.VeilingProduct_Id != vp.VeilingProduct_Id)
                .ToListAsync();

            foreach (var item in andereActieve)
                item.Status = "afgerond";

            vp.Status = "actief";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product geactiveerd", veilingProductId });
        }

        // ✅ Product weigeren (alleen veilingmeester)
        [HttpPut("{veilingProductId}/weiger")]
        [Authorize(Roles = "Veilingmeester")]
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
            if (dto == null)
                return BadRequest("Ongeldige invoer");

            var veiling = await _context.Veilingen.FindAsync(veilingId);
            if (veiling == null)
                return NotFound("Veiling niet gevonden.");

            var product = await _context.Producten.FindAsync(dto.ProductId);
            if (product == null)
                return NotFound("Product niet gevonden.");

            if (dto.Hoeveelheid <= 0)
                return BadRequest("Hoeveelheid moet groter zijn dan 0.");

            if (product.Hoeveelheid < dto.Hoeveelheid)
                return BadRequest("Niet genoeg voorraad.");

            // koppeling maken -> wachtend
            var koppeling = new VeilingProduct
            {
                Veiling_Id = veilingId,
                Product_Id = dto.ProductId,
                Hoeveelheid = dto.Hoeveelheid,
                Prijs = dto.Prijs,
                Status = "wachtend"
            };

            _context.VeilingProducten.Add(koppeling);

            // update voorraad product
            product.Hoeveelheid -= dto.Hoeveelheid;

            // prijs aanpassen indien opgegeven
            if (dto.Prijs.HasValue)
                product.StartPrijs = dto.Prijs.Value;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product staat in wachtlijst", veilingProductId = koppeling.VeilingProduct_Id });
        }

        // ✅ Veiling starten
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartVeiling(string id)
        {
            var veiling = await _context.Veilingen.FindAsync(id);
            if (veiling == null) return NotFound();

            var origineleDuur = veiling.EindTijd - veiling.StartTijd;
            veiling.StartTijd = DateTime.UtcNow;
            veiling.EindTijd = veiling.StartTijd + origineleDuur;
            veiling.Status = "actief";

            await _context.SaveChangesAsync();
            return Ok(veiling);
        }

        // ✅ Veiling verwijderen
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiling(string id)
        {
            var veiling = await _context.Veilingen.FindAsync(id);
            if (veiling == null)
                return NotFound(new { message = "Veiling niet gevonden" });

            _context.Veilingen.Remove(veiling);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}