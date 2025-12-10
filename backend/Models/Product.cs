using System.ComponentModel.DataAnnotations;


namespace FloresFuertes.Models
{
    public class Product
    {
        [Key]
        public string Product_Id { get; set; } = Guid.NewGuid().ToString();
        public string Foto { get; set; }
        public string Naam { get; set; }
        public string ArtikelKenmerken { get; set; }
        public int Hoeveelheid { get; set; }
        public decimal StartPrijs { get; set; }

        public string Aanvoerder_Id { get; set; }
    }
}