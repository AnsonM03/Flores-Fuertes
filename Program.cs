using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// --- VOEG DIT TOE (DEEL 1) ---
// Definieer een CORS-beleid
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMyFrontend",
        policy =>
        {
            // Sta de oorsprong van je VS Code Live Server toe
            policy.WithOrigins(
                "http://localhost:3000",
                "http://127.0.0.1:5500") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
// ------------------------------

// JwtConstants AUTHENTICATION
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Key"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(key),
    };
});

// Add services to the container.
builder.Services.AddAuthorization();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// --- VOEG DIT TOE (DEEL 2) ---
// Gebruik het CORS-beleid dat je hierboven hebt gedefinieerd
// DIT MOET VÓÓR UseAuthorization()
app.UseCors("AllowMyFrontend");
// ------------------------------
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();