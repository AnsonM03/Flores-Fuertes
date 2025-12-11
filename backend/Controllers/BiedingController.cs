using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;
using Microsoft.AspNetCore.SignalR;
using FloresFuertes.Hubs;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BiedingenController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<AuctionHub> _hub;

        public BiedingenController(AppDbContext context, IHubContext<AuctionHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        // ---------------------------------------
        // NORMALE BIEDING
        // ---------------------------------------
        [HttpPost]
        public async Task<ActionResult<BiedingDto>> Create(BiedingCreateDto dto)
        {
            var klant = await _context.Klanten.FindAsync(dto.Klant_Id);
            if (klant == null) return BadRequest("Klant bestaat niet.");

            var product = await _context.Producten.FindAsync(dto.Product_Id);
            if (product == null) return BadRequest("Product bestaat niet.");

            var hoogsteBod = await _context.Biedingen
                .Where(x => x.Product_Id == dto.Product_Id)
                .OrderByDescending(x => x.Bedrag)
                .FirstOrDefaultAsync();

            if (hoogsteBod != null && dto.Bedrag <= hoogsteBod.Bedrag)
                return BadRequest("Bod moet hoger zijn dan het huidige hoogste bod.");

            var bieding = new Bieding
            {
                Bedrag = dto.Bedrag,
                Klant_Id = dto.Klant_Id,
                Product_Id = dto.Product_Id,
                Tijdstip = DateTime.UtcNow
            };

            _context.Biedingen.Add(bieding);
            await _context.SaveChangesAsync();

            return Ok(new BiedingDto
            {
                Bieding_Id = bieding.Bieding_Id,
                Bedrag = bieding.Bedrag,
                Tijdstip = bieding.Tijdstip,
                Klant_Id = bieding.Klant_Id,
                Product_Id = bieding.Product_Id
            });
        }


        // ---------------------------------------
        // DUTCH AUCTION KOOP
        // ---------------------------------------
        [HttpPost("koop")]
        public async Task<IActionResult> Koop(KoopDto dto)
        {
            // Bestaat klant?
            var klant = await _context.Klanten.FindAsync(dto.Klant_Id);
            if (klant == null)
                return BadRequest("Klant bestaat niet.");

            // Bestaat product?
            var product = await _context.Producten.FindAsync(dto.Product_Id);
            if (product == null)
                return BadRequest("Product bestaat niet.");

            // Genoeg voorraad?
            if (dto.Aantal > product.Hoeveelheid)
                return BadRequest("Niet genoeg voorraad.");

            // Totaalprijs
            var totaal = dto.PrijsPerStuk * dto.Aantal;

            // Maak aankoop (bieding)
            var aankoop = new Bieding
            {
                Klant_Id = dto.Klant_Id,
                Product_Id = dto.Product_Id,
                Bedrag = totaal,         // totaalprijs
                Tijdstip = DateTime.UtcNow
            };

            _context.Biedingen.Add(aankoop);

            // ❗ VOORRAAD AANPASSEN
            product.Hoeveelheid -= dto.Aantal;

            await _context.SaveChangesAsync();

            // ❗ REALTIME UPDATE versturen naar alle clients
            await _hub.Clients.All.SendAsync(
                "ProductGekocht",
                dto.Veiling_Id,
                dto.Product_Id,
                product.Hoeveelheid
            );

            return Ok(new
            {
                message = "Aankoop succesvol",
                nieuweVoorraad = product.Hoeveelheid
            });
        }

        // ---------------------------------------
        // OVERIGE ENDPOINTS
        // ---------------------------------------
        
        [HttpGet("hoogste/{productId}")]
        public async Task<ActionResult<float>> GetHoogsteBod(string productId)
        {
            var bod = await _context.Biedingen
                .Where(b => b.Product_Id == productId)
                .OrderByDescending(b => b.Bedrag)
                .FirstOrDefaultAsync();

            return Ok(bod?.Bedrag ?? 0);
        }
    }
}