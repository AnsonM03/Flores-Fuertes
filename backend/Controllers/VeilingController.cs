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
            try
            {
                var data = await _context.Veilingen
                .Include(v => v.Product)
                .Include(v => v.Veilingmeester)
                .ToListAsync();

            return Ok(data);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Veiling>> GetById(string id)
        {
            var veiling = await _context.Veilingen
                .Include(v => v.Product)
                .Include(v => v.Veilingmeester)
                .FirstOrDefaultAsync(v => v.Veiling_Id == id);

            if (veiling == null)
            {
                return NotFound();
            }

            return Ok(veiling);
        }

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
                Veilingmeester_Id = dto.Veilingmeester_Id,

                // ❌ geen product koppelen in deze stap
                Product_Id = null!
            };

            _context.Veilingen.Add(nieuweVeiling);
            await _context.SaveChangesAsync();

            // Relaat opnieuw ophalen met includes
            var completeVeiling = await _context.Veilingen
                .Include(v => v.Product)
                .Include(v => v.Veilingmeester)
                .FirstOrDefaultAsync(v => v.Veiling_Id == nieuweVeiling.Veiling_Id);

            return CreatedAtAction(nameof(GetById), new { id = nieuweVeiling.Veiling_Id }, completeVeiling);
        }

        [HttpPost("{veilingId}/koppel")]
public async Task<IActionResult> KoppelProduct(string veilingId, [FromBody] KoppelProductDto dto)
{
    var veiling = await _context.Veilingen.FindAsync(veilingId);
    if (veiling == null)
        return NotFound("Veiling niet gevonden.");

    var product = await _context.Producten.FindAsync(dto.ProductId);
    if (product == null)
        return NotFound("Product niet gevonden.");

    // check hoeveelheid
    if (dto.Hoeveelheid <= 0)
        return BadRequest("Hoeveelheid moet groter zijn dan 0.");

    if (product.Hoeveelheid < dto.Hoeveelheid)
        return BadRequest("Niet genoeg voorraad.");

    // koppeling maken
    var koppeling = new VeilingProduct
    {
        Veiling_Id = veilingId,
        Product_Id = dto.ProductId,
        Hoeveelheid = dto.Hoeveelheid,
        Prijs = dto.Prijs // mag null zijn
    };

    _context.VeilingProducten.Add(koppeling);

    // update voorraad product
    product.Hoeveelheid -= dto.Hoeveelheid;

    // prijs aanpassen indien opgegeven
    if (dto.Prijs.HasValue)
        product.StartPrijs = dto.Prijs.Value;

    await _context.SaveChangesAsync();

    return Ok(new { message = "Product gekoppeld!" });
}

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiling(string id)
        {
            var veiling = await _context.Veilingen.FindAsync(id);
            if (veiling == null)
            {
                return NotFound(new { message = "Veiling niet gevonden" });
            }

            _context.Veilingen.Remove(veiling);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 betekent: succesvol verwijderd, geen content terug
        }
    }
}