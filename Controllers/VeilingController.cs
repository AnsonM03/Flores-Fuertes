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
                Product_Id = dto.Product_Id,
                Veilingmeester_Id = dto.Veilingmeester_Id
            };

            _context.Veilingen.Add(nieuweVeiling);
            await _context.SaveChangesAsync();

            // ✅ Haal de volledige veiling opnieuw op met relaties
            var completeVeiling = await _context.Veilingen
                .Include(v => v.Product)
                .Include(v => v.Veilingmeester)
                .FirstOrDefaultAsync(v => v.Veiling_Id == nieuweVeiling.Veiling_Id);

            if (completeVeiling == null)
                return NotFound("Veiling niet gevonden na aanmaken");

            return CreatedAtAction(nameof(GetById), new { id = completeVeiling.Veiling_Id }, completeVeiling);
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
        

        // [HttpPost]
        // public async Task<ActionResult<Veiling>> CreateVeiling([FromBody] VeilingCreateDto dto)
        // {
        //     if (dto == null)
        //         return BadRequest("Ongeldige invoer");

        //     var nieuweVeiling = new Veiling
        //     {
        //         Veiling_Id = Guid.NewGuid().ToString(),
        //         VeilingPrijs = dto.VeilingPrijs,
        //         VeilingDatum = dto.VeilingDatum,
        //         StartTijd = dto.StartTijd,
        //         EindTijd = dto.EindTijd,
        //         Kloklocatie = dto.Kloklocatie,
        //         Status = dto.Status,
        //         Product_Id = dto.Product_Id,
        //         Veilingmeester_Id = dto.Veilingmeester_Id
        //     };

        //     _context.Veilingen.Add(nieuweVeiling);
        //     await _context.SaveChangesAsync();

        //     // 201 Created met het nieuwe object als response
        //     return CreatedAtAction(nameof(GetById), new { id = nieuweVeiling.Veiling_Id }, nieuweVeiling);
        // }

        // [HttpPost]
        // public async Task<ActionResult<Veiling>> Create(VeilingCreateDto dto)
        // {
        //     var veiling = new Veiling
        //     {
        //         VeilingPrijs = dto.VeilingPrijs,
        //         VeilingDatum = dto.VeilingDatum,
        //         StartTijd = dto.StartTijd,
        //         EindTijd = dto.EindTijd,
        //         Kloklocatie = dto.Kloklocatie,
        //         Status = dto.Status,
        //         Product_Id = dto.Product_Id,
        //         Veilingmeester_Id = dto.Veilingmeester_Id
        //     };

        //     _context.Veilingen.Add(veiling);
        //     await _context.SaveChangesAsync();

        //     return CreatedAtAction(nameof(GetAll),
        //         new { id = veiling.Veiling_Id },
        //         veiling);
        // }
    }
}