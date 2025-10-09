using Microsoft.EntityFrameworkCore;
using FloresFuertes.Models; // pas aan naar jouw namespace

namespace FloresFuertes.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Gebruiker> Gebruikers { get; set; }
        public DbSet<Aanvoerder> Aanvoerders { get; set; }
        public DbSet<Klant> Klanten { get; set; }
        public DbSet<Veilingmeester> Veilingmeesters { get; set; }
        public DbSet<Bieding> Biedingen { get; set; }
        public DbSet<Product> Producten { get; set; }
        public DbSet<Veiling> Veilingen { get; set; }
        // Voeg hier andere tabellen toe, zoals Klant, Product, etc.

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuratie voor Gebruiker en afgeleide klassen
            modelBuilder.Entity<Gebruiker>()
                .HasDiscriminator<string>("GebruikerType")
                .HasValue<Gebruiker>("Gebruiker")
                .HasValue<Aanvoerder>("Aanvoerder")
                .HasValue<Klant>("Klant")
                .HasValue<Veilingmeester>("Veilingmeester");

            // Configuratie voor relaties
            modelBuilder.Entity<Veiling>()
                .HasOne(v => v.Product)
                .WithMany()
                .HasForeignKey(v => v.Product_Id);

            modelBuilder.Entity<Veiling>()
                .HasOne(v => v.Veilingmeester)
                .WithMany()
                .HasForeignKey(v => v.Veilingmeester_Id);

            modelBuilder.Entity<Bieding>()
                .HasKey(b => b.Bieding_Id);

            modelBuilder.Entity<Bieding>()
                .HasOne(b => b.Klant)
                .WithMany()
                .HasForeignKey(b => b.Klant_Id);

            modelBuilder.Entity<Bieding>()
                .HasOne(b => b.Product)
                .WithMany()
                .HasForeignKey(b => b.Product_Id);
        }
    }
}