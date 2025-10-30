using Microsoft.EntityFrameworkCore;
using FloresFuertes.Data;

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

// Add services to the container.
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

app.UseAuthorization();

app.MapControllers();

app.Run();