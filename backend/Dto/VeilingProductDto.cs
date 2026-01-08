namespace FloresFuertes.Models
{
    public class VeilingProductDto
    {
        public string VeilingProduct_Id { get; set; } = "";
        public string Veiling_Id { get; set; } = "";

        public string Product_Id { get; set; } = "";

        public string Naam { get; set; } = "";
        public string ArtikelKenmerken { get; set; } = "";

        public int Hoeveelheid { get; set; }
        public float StartPrijs { get; set; }

        public string? Foto { get; set; }

        public string Status { get; set; } = "wachtend";
    }
}