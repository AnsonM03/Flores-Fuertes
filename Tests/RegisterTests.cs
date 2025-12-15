using Xunit;
using Microsoft.AspNetCore.Mvc;
using FloresFuertes.Controllers;
using FloresFuertes.DTOs.Auth;
using FloresFuertes.Data;
using Microsoft.AspNetCore.Http;
using System.Linq; // Nodig voor First() en FirstOrDefault()

public class RegisterTests
{
    // TEST 1: Succesvolle registratie
    [Fact]
    public async Task Register_ReturnsOk_WhenDataIsValid()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemory();
        var controller = new AuthController(context);
        
        // Mock de HTTP context
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var registerModel = new RegisterDto
        {
            Email = "nieuw@test.com",
            Wachtwoord = "SterkWachtwoord1!",
            // AL DEZE VELDEN ZIJN VERPLICHT (required):
            Voornaam = "Piet",
            Achternaam = "Jansen",
            Adres = "Teststraat 1",
            Woonplaats = "Testdam",
            Telefoonnr = "0612345678"
        };

        // Act
        var result = await controller.Register(registerModel);

        // Assert
        // AANGEPAST: Geen .Result meer gebruiken, want result is al het object zelf bij IActionResult
        Assert.IsType<OkObjectResult>(result);
        
        // Check database
        var userInDb = context.Gebruikers.FirstOrDefault(u => u.Email == "nieuw@test.com");
        Assert.NotNull(userInDb);
    }

    // TEST 2: Ongeldig wachtwoord
    [Fact]
    public async Task Register_ReturnsBadRequest_WhenPasswordIsWeak()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemory();
        var controller = new AuthController(context);

        var registerModel = new RegisterDto
        {
            Email = "fout@test.com",
            Wachtwoord = "zwak", // Te kort
            // OOK HIER MOET JE ALLES INVULLEN (anders mag C# het object niet maken):
            Voornaam = "Piet",
            Achternaam = "Jansen",
            Adres = "Teststraat 1",
            Woonplaats = "Testdam",
            Telefoonnr = "0612345678"
        };

        // Act
        // We simuleren validatie niet via ModelState hier, 
        // omdat jouw controller handmatig checkt: if (dto.Wachtwoord.Length < 8)
        var result = await controller.Register(registerModel);

        // Assert
        // AANGEPAST: Geen .Result meer gebruiken
        Assert.IsType<BadRequestObjectResult>(result);
        
        // Check database (mag niet bestaan)
        var userInDb = context.Gebruikers.FirstOrDefault(u => u.Email == "fout@test.com");
        Assert.Null(userInDb);
    }

    // TEST 9: Check Hashing
    [Fact]
    public async Task Register_HashesPassword_InDatabase()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemory();
        var controller = new AuthController(context);
        
        var wachtwoordPlain = "Geheim123!";
        var registerModel = new RegisterDto
        {
            Email = "hashcheck@test.com",
            Wachtwoord = wachtwoordPlain,
            // ALLES INVULLEN:
            Voornaam = "Test", 
            Achternaam = "Hash",
            Adres = "X", 
            Woonplaats = "Y", 
            Telefoonnr = "06"
        };

        // Act
        await controller.Register(registerModel);

        // Assert
        var user = context.Gebruikers.First(u => u.Email == "hashcheck@test.com");
        
        Assert.NotEqual(wachtwoordPlain, user.Wachtwoord); // Mag niet leesbaar zijn
        Assert.True(user.Wachtwoord.Length > 20); // Hash is lang
    }
}