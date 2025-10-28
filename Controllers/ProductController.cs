using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using FloresFuertes.Models;

namespace FloresFuertes.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductenController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll()
        {
            return await _context.Producten.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Product>> Create(ProductCreateDto dto)
        {
            var product = new Product
            {
                Foto = dto.Foto,
                Naam = dto.Naam,
                ArtikelKenmerken = dto.ArtikelKenmerken,
                Hoeveelheid = dto.Hoeveelheid,
                StartPrijs = dto.StartPrijs,
                Aanvoerder_Id = dto.Aanvoerder_Id,
            };  
            
            _context.Producten.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = product.Product_Id }, product);
        }
    }
}