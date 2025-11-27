using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
        public async Task<ActionResult<ProductDto>> Create(ProductCreateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Aanvoerder_Id))
                return BadRequest("Aanvoerder_Id ontbreekt.");

            var product = new Product
            {
                Foto = dto.Foto,
                Naam = dto.Naam,
                ArtikelKenmerken = dto.ArtikelKenmerken,
                Hoeveelheid = dto.Hoeveelheid,
                StartPrijs = dto.StartPrijs,
                Aanvoerder_Id = dto.Aanvoerder_Id
            };

            _context.Producten.Add(product);
            await _context.SaveChangesAsync();

            var result = new ProductDto
            {
                Product_Id = product.Product_Id,
                Naam = product.Naam,
                ArtikelKenmerken = product.ArtikelKenmerken,
                Hoeveelheid = product.Hoeveelheid,
                StartPrijs = product.StartPrijs,
                Foto = product.Foto
            };

            return CreatedAtAction(nameof(GetAll), new { id = product.Product_Id }, result);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(string id, [FromBody] ProductCreateDto dto)
        {
            var product = await _context.Producten.FindAsync(id);
            if (product == null)
                return NotFound("Product niet gevonden.");

            product.Naam = dto.Naam;
            product.ArtikelKenmerken = dto.ArtikelKenmerken;
            product.Hoeveelheid = dto.Hoeveelheid;
            product.StartPrijs = dto.StartPrijs;
            product.Foto = dto.Foto;

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // Alleen aanvoerders mogen producten aanmaken
        // [HttpPost]
        // // [Authorize(Roles = "aanvoerder")] // Let op hoofdletter!
        // public async Task<ActionResult<ProductDto>> Create(ProductCreateDto dto)
        // {
        //     // var aanvoerderId = "39ded361-af07-4b82-8aca-cf3fb032dce6";

        //     var aanvoerderId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        //     if (aanvoerderId == null)
        //         return Unauthorized("Geen geldige gebruiker gevonden.");

        //     var product = new Product
        //     {
        //         Foto = dto.Foto,
        //         Naam = dto.Naam,
        //         ArtikelKenmerken = dto.ArtikelKenmerken,
        //         Hoeveelheid = dto.Hoeveelheid,
        //         StartPrijs = dto.StartPrijs,
        //         Aanvoerder_Id = aanvoerderId
        //     };

        //     _context.Producten.Add(product);
        //     await _context.SaveChangesAsync();

        //     var result = new ProductDto
        //     {
        //         Product_Id = product.Product_Id,
        //         Naam = product.Naam,
        //         ArtikelKenmerken = product.ArtikelKenmerken,
        //         Hoeveelheid = product.Hoeveelheid,
        //         StartPrijs = product.StartPrijs,
        //         Foto = product.Foto
        //     };

        //     return CreatedAtAction(nameof(GetAll), new { id = product.Product_Id }, result);
        // }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var product = await _context.Producten.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product niet gevonden" });
            }

            _context.Producten.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 betekent: succesvol verwijderd, geen content terug
        }
    }
}