using Xunit;
using Microsoft.AspNetCore.Mvc;
using FloresFuertes.Controllers;
using FloresFuertes.Models;
using FloresFuertes.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

public class LoginTests
{
    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenEmailNotFound()
    {
        var context = TestDbContextFactory.CreateInMemory();
        var controller = new AuthController(context);

        var model = new LoginModel
        {
            Email = "bestaatniet@example.com",
            Wachtwoord = "123"
        };

        var result = await controller.Login(model);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordIncorrect()
    {
        var context = TestDbContextFactory.CreateInMemory();

        var gebruiker = new Gebruiker
        {
            Gebruiker_Id = Guid.NewGuid().ToString(),
            Email = "test@test.com",
            Wachtwoord = new PasswordHasher<Gebruiker>()
                .HashPassword(null!, "goedwachtwoord")
        };

        context.Gebruikers.Add(gebruiker);
        await context.SaveChangesAsync();

        var controller = new AuthController(context);

        var model = new LoginModel
        {
            Email = "test@test.com",
            Wachtwoord = "fout"
        };

        var result = await controller.Login(model);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_ReturnsOk_WithValidCredentials()
    {
        var context = TestDbContextFactory.CreateInMemory();

        var gebruiker = new Gebruiker
        {
            Gebruiker_Id = Guid.NewGuid().ToString(),
            Email = "test@test.com",
            GebruikerType = "aanvoerder",
            Wachtwoord = new PasswordHasher<Gebruiker>()
                .HashPassword(null!, "123")
        };

        context.Gebruikers.Add(gebruiker);
        await context.SaveChangesAsync();

        var controller = new AuthController(context);

        var model = new LoginModel
        {
            Email = "test@test.com",
            Wachtwoord = "123"
        };

        var result = await controller.Login(model);

        Assert.IsType<OkObjectResult>(result);
    }
}