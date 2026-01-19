using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FloresFuertes.Hubs;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------
// CORS
// ----------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMyFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://frontend:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ----------------------------
// JWT
// ----------------------------
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // JWT via cookies voor normale API calls
            if (context.Request.Cookies.ContainsKey("token"))
            {
                context.Token = context.Request.Cookies["token"];
            }

            // JWT voor SignalR WebSockets
            var accessToken = context.Request.Query["access_token"];
            var path = context.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs/auction"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

// ----------------------------
// SERVICES
// ----------------------------
builder.Services.AddAuthorization();
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// ----------------------------
// PIPELINE
// ----------------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseCors("AllowMyFrontend");

// ----------------------------
// STATIC FILES (fotos uit /uploads werken nu altijd)
// ----------------------------
app.UseStaticFiles();

// ----------------------------
// AUTH
// ----------------------------
app.UseAuthentication();
app.UseAuthorization();

// ----------------------------
// ROUTING
// ----------------------------
app.MapControllers();
app.MapHub<AuctionHub>("/hubs/auction");

app.Run();