using Xunit;
using Microsoft.AspNetCore.Mvc;
using FloresFuertes.Controllers;
using FloresFuertes.Models;
using FloresFuertes.Data;
using FloresFuertes.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

public class LoginTests
{
    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenEmailNotFound()
    {
        var context = TestDbContextFactory.CreateInMemory();
        var controller = new AuthController(context);

        var model = new LoginDto
        {
            Email = "bestaatniet@example.com",
            Wachtwoord = "123"
        };

        // Act
        var result = await controller.Login(model);

        // Assert
        // AANGEPAST: We checken result.Result omdat de return type ActionResult<T> is
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordIncorrect()
    {
        var context = TestDbContextFactory.CreateInMemory();

        var gebruiker = new Gebruiker
        {
            Gebruiker_Id = Guid.NewGuid().ToString(),
            Email = "test@test.com",
            
            // AANGEPAST: Dummy data voor verplichte velden
            Voornaam = "Test",
            Achternaam = "User",
            Adres = "Teststraat 1",
            Woonplaats = "Testdam",
            Telefoonnr = "0612345678",
            
            Wachtwoord = new PasswordHasher<Gebruiker>()
                .HashPassword(null!, "goedwachtwoord")
        };

        context.Gebruikers.Add(gebruiker);
        await context.SaveChangesAsync();

        var controller = new AuthController(context);

        var model = new LoginDto
        {
            Email = "test@test.com",
            Wachtwoord = "fout"
        };

        // Act
        var result = await controller.Login(model);

        // Assert
        // AANGEPAST: Check result.Result
        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
public async Task Login_ReturnsOk_WithValidCredentials()
{
    var context = TestDbContextFactory.CreateInMemory();

    // 1. Maak de gebruiker aan
    var gebruiker = new Gebruiker
    {
        Gebruiker_Id = Guid.NewGuid().ToString(),
        Email = "test@test.com",
        GebruikerType = "aanvoerder",
        
        // Verplichte velden invullen
        Voornaam = "Test",
        Achternaam = "User",
        Adres = "Teststraat 1",
        Woonplaats = "Testdam",
        Telefoonnr = "0612345678",

        Wachtwoord = new PasswordHasher<Gebruiker>()
            .HashPassword(null!, "123")
    };

    context.Gebruikers.Add(gebruiker);
    await context.SaveChangesAsync();

    // 2. Initialiseer de controller
    var controller = new AuthController(context);

    // 3. HIER ZIT DE FIX: Geef de controller een Mock HttpContext
    // Hierdoor crasht 'Response.Cookies.Append' niet meer.
    controller.ControllerContext = new ControllerContext
    {
        HttpContext = new DefaultHttpContext()
    };

    var model = new LoginDto
    {
        Email = "test@test.com",
        Wachtwoord = "123"
    };

    // Act
    var result = await controller.Login(model);

    // Assert
    // Omdat je 'ActionResult<AuthResponseDto>' teruggeeft, zit het resultaat in .Result
    Assert.IsType<OkObjectResult>(result.Result);
}
}