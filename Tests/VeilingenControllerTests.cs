using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using FloresFuertes.Controllers;
using FloresFuertes.Data;
using FloresFuertes.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace FloresFuertes.Tests
{
    public class VeilingenControllerTests
    {
        // Hulpmethode om een schone In-Memory database te krijgen voor elke test
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unieke naam per test
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public async Task GetAll_ReturnsAllVeilingen()
        {
            // Arrange
            using var context = GetDatabaseContext();
            
            // LET OP: Hier gebruiken we Gebruiker_Id voor de Veilingmeester zelf
            var meester = new Veilingmeester 
            { 
                Gebruiker_Id = "vm1", // AANGEPAST
                Voornaam = "Hans", 
                Achternaam = "Klok", 
                Email = "h@k.nl", 
                Adres = "Laan 1", 
                Telefoonnr = "06", 
                Woonplaats = "Delft", 
                Wachtwoord = "geheim" 
            };
            context.Veilingmeesters.Add(meester);

            // Hier koppelen we via de FK 'Veilingmeester_Id' die in Veiling.cs staat
            context.Veilingen.AddRange(
                new Veiling { Veiling_Id = "v1", Veilingmeester_Id = "vm1", Status = "wachtend", Kloklocatie = "A1", VeilingPrijs = 100 },
                new Veiling { Veiling_Id = "v2", Veilingmeester_Id = "vm1", Status = "actief", Kloklocatie = "A2", VeilingPrijs = 200 }
            );
            await context.SaveChangesAsync();

            var controller = new VeilingenController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var veilingen = Assert.IsType<List<VeilingListDto>>(actionResult.Value);
            
            Assert.Equal(2, veilingen.Count);
            Assert.Equal("Hans Klok", veilingen[0].VeilingmeesterNaam);
        }

        [Fact]
        public async Task GetById_ReturnsVeiling_WhenExists()
        {
            // Arrange
            using var context = GetDatabaseContext();
            
            // AANGEPAST: Gebruiker_Id
            var meester = new Veilingmeester 
            { 
                Gebruiker_Id = "vm1", 
                Voornaam = "Piet", 
                Achternaam = "P", 
                Email = "p@p.nl", 
                Adres = "Straat 1", 
                Telefoonnr = "01", 
                Woonplaats = "Adam", 
                Wachtwoord = "ww" 
            };

            var veiling = new Veiling 
            { 
                Veiling_Id = "test-id", 
                Veilingmeester_Id = "vm1", 
                Status = "wachtend", 
                Kloklocatie = "B2" 
            };
            
            context.Veilingmeesters.Add(meester);
            context.Veilingen.Add(veiling);
            await context.SaveChangesAsync();

            var controller = new VeilingenController(context);

            // Act
            var result = await controller.GetById("test-id");

            // Assert
            var actionResult = Assert.IsType<OkObjectResult>(result.Result);
            var dto = Assert.IsType<VeilingDetailDto>(actionResult.Value);
            Assert.Equal("test-id", dto.Veiling_Id);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenVeilingDoesNotExist()
        {
            // Arrange
            using var context = GetDatabaseContext();
            var controller = new VeilingenController(context);

            // Act
            var result = await controller.GetById("niet-bestaand-id");

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateVeiling_AddsVeilingToDatabase()
        {
            // Arrange
            using var context = GetDatabaseContext();
            var controller = new VeilingenController(context);

            // We hoeven voor CreateVeiling geen meester in de DB te hebben 
            // omdat de controller niet checkt of de ID bestaat (geen FK constraint in basic InMemory zonder strict mode),
            // maar voor de netheid verwijzen we naar een ID.
            var createDto = new VeilingCreateDto
            {
                VeilingPrijs = 500,
                Kloklocatie = "C3",
                Status = "wachtend",
                Veilingmeester_Id = "vm1",
                VeilingDatum = DateOnly.FromDateTime(DateTime.Now),
                StartTijd = DateTime.Now,
                EindTijd = DateTime.Now.AddHours(1)
            };

            // Act
            var result = await controller.CreateVeiling(createDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            
            var veilingInDb = await context.Veilingen.FirstOrDefaultAsync(v => v.Kloklocatie == "C3");
            Assert.NotNull(veilingInDb);
            Assert.Equal(500, veilingInDb.VeilingPrijs);
        }

        [Fact]
        public async Task DeleteVeiling_RemovesVeiling_WhenExists()
        {
            // Arrange
            using var context = GetDatabaseContext();
            
            var veiling = new Veiling 
            { 
                Veiling_Id = "delete-me", 
                Veilingmeester_Id = "vm1", 
                Status = "wachtend", 
                Kloklocatie = "D4",
                // AANGEPAST: Gebruiker_Id
                Veilingmeester = new Veilingmeester 
                { 
                    Gebruiker_Id = "vm1", 
                    Voornaam="A", 
                    Achternaam="B", 
                    Email="e", 
                    Adres="a", 
                    Telefoonnr="t", 
                    Woonplaats="w", 
                    Wachtwoord="ww"
                } 
            };
            
            context.Veilingen.Add(veiling);
            await context.SaveChangesAsync();

            var controller = new VeilingenController(context);

            // Act
            var result = await controller.DeleteVeiling("delete-me");

            // Assert
            Assert.IsType<NoContentResult>(result); 
            
            var deletedVeiling = await context.Veilingen.FindAsync("delete-me");
            Assert.Null(deletedVeiling);
        }
    }
}