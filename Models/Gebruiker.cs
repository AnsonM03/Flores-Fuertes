using System.ComponentModel.DataAnnotations;

namespace FloresFuertes.Models
{
    public class Gebruiker
    {
        [Key]
        public string Gebruiker_Id { get; set; } = Guid.NewGuid().ToString();
        public string Voornaam { get; set; } = null!;
        public string Achternaam { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Adres { get; set; } = null!;
        public string Telefoonnr { get; set; } = null!;
        public string Woonplaats { get; set; } = null!;
        public string Wachtwoord { get; set; } = null!;
        
        public int FailedLoginAttempts { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; } = null; // Tijd tot wanneer account geblokkeerd is
    }
}