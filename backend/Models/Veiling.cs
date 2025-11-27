using System.ComponentModel.DataAnnotations;

namespace FloresFuertes.Models
{
    public class Veiling
    {
        [Key]
        public string Veiling_Id { get; set; } = Guid.NewGuid().ToString();
        public float VeilingPrijs { get; set; }
        public DateOnly VeilingDatum { get; set; }
        public DateTime StartTijd { get; set; }
        public DateTime EindTijd { get; set; }
        public string Kloklocatie { get; set; }
        public string Status { get; set; }

        public string? Product_Id { get; set; }
        public Product? Product { get; set; }

        public string Veilingmeester_Id { get; set; }
        public Veilingmeester Veilingmeester { get; set; }

        public ICollection<VeilingProduct>? VeilingProducten { get; set; }
    }
}