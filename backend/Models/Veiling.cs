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

        [Required]
        public string Kloklocatie { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "wachtend";
        // wachtend | actief | afgelopen

        [Required]
        public string Veilingmeester_Id { get; set; } = null!;

        public Veilingmeester Veilingmeester { get; set; } = null!;

        public ICollection<VeilingProduct> VeilingProducten { get; set; }
            = new List<VeilingProduct>();
    }
}