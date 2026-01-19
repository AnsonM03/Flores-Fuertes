using System.ComponentModel.DataAnnotations;

namespace FloresFuertes.Models
{
    public class Veiling
    {
        [Key]
        public string Veiling_Id { get; set; } = Guid.NewGuid().ToString();

        // Dutch auction: prijs hoort bij actief product, niet bij veiling
        // -> je kunt deze verwijderen, OF laten staan maar niet meer gebruiken.
        public float? VeilingPrijs { get; set; }   // nullable (of verwijderen)

        // Datum is ok, maar als je hem optioneel wil: maak nullable
        public DateOnly? VeilingDatum { get; set; }

        // ✅ pas invullen wanneer veiling gestart wordt
        public DateTime? StartTijd { get; set; }
        public DateTime? EindTijd { get; set; }

        [Required]
        public string Kloklocatie { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "wachtend"; // wachtend | actief | afgelopen

        [Required]
        public string Veilingmeester_Id { get; set; } = null!;

        public Veilingmeester Veilingmeester { get; set; } = null!;

        public ICollection<VeilingProduct> VeilingProducten { get; set; }
            = new List<VeilingProduct>();

        // (optioneel maar handig) sla minimum prijs op als je wilt:
        public decimal? MinimumPrijs { get; set; }
    }
}