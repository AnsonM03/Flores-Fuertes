using Xunit;
using Microsoft.AspNetCore.Mvc;
using FloresFuertes.Controllers;
using FloresFuertes.DTOs.Veiling;
using FloresFuertes.Models;
using FloresFuertes.Data;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

public class BiedingTests
{
    // Hulpfunctie: Simuleert een ingelogde gebruiker
    private ControllerContext GetMockedUserContext()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, "user-guid-123"),
            new Claim(ClaimTypes.Email, "klant@test.com"),
        }, "mock"));

        return new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    // TEST 1: Geldig bod (Succes)
    [Fact]
    public async Task PlaatsBod_ReturnsOk_WhenBidIsValid()
    {
        var context = TestDbContextFactory.CreateInMemory();
        
        // Maak een actieve veiling aan
        var veiling = new Veiling 
        { 
            VeilingId = 1, 
            HuidigBod = 100, 
            EindTijd = DateTime.UtcNow.AddHours(1), // Nog open
            IsActief = true
        };
        context.Veilingen.Add(veiling);
        await context.SaveChangesAsync();

        var controller = new BiedingController(context);
        controller.ControllerContext = GetMockedUserContext();

        var bodDto = new BodDto 
        { 
            VeilingId = 1, 
            Bedrag = 110 // Hoger dan 100 -> Geldig
        };

        // Act
        var result = await controller.PlaatsBod(bodDto);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        
        // Check database update
        var updatedVeiling = await context.Veilingen.FindAsync(1);
        Assert.Equal(110, updatedVeiling.HuidigBod);
    }

    // TEST 2: Bod te laag
    [Fact]
    public async Task PlaatsBod_ReturnsBadRequest_WhenBidIsTooLow()
    {
        var context = TestDbContextFactory.CreateInMemory();
        context.Veilingen.Add(new Veiling 
        { 
            VeilingId = 2, 
            HuidigBod = 100, 
            EindTijd = DateTime.UtcNow.AddHours(1),
            IsActief = true 
        });
        await context.SaveChangesAsync();

        var controller = new BiedingController(context);
        controller.ControllerContext = GetMockedUserContext();

        var bodDto = new BodDto 
        { 
            VeilingId = 2, 
            Bedrag = 90 // TE LAAG
        };

        // Act
        var result = await controller.PlaatsBod(bodDto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    // TEST 3: Veiling gesloten
    [Fact]
    public async Task PlaatsBod_ReturnsBadRequest_WhenAuctionIsClosed()
    {
        var context = TestDbContextFactory.CreateInMemory();
        context.Veilingen.Add(new Veiling 
        { 
            VeilingId = 3, 
            HuidigBod = 100, 
            IsActief = false // GESLOTEN
        });
        await context.SaveChangesAsync();

        var controller = new BiedingController(context);
        controller.ControllerContext = GetMockedUserContext();

        var bodDto = new BodDto { VeilingId = 3, Bedrag = 150 };

        // Act
        var result = await controller.PlaatsBod(bodDto);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}