namespace FloresFuertes.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Gebruiker_Id { get; set; }
        public string Voornaam { get; set; }
        public string Achternaam { get; set; }
        public string Email { get; set; }
        public string Adres { get; set; }
        public string Telefoonnr { get; set; }
        public string Woonplaats { get; set; }
        public string GebruikerType { get; set; }
        public string Token { get; set; } // optioneel voor debug
    }
}