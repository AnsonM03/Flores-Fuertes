namespace FloresFuertes.DTOs.Auth
{
    public class RegisterDto
    {
        public required string Email { get; set; }
        public required string Wachtwoord { get; set; }
        public required string Voornaam { get; set; }
        public required string Achternaam { get; set; }
        public required string Adres { get; set; }
        public required string Woonplaats { get; set; }
        public required string Telefoonnr { get; set; }
    }
}