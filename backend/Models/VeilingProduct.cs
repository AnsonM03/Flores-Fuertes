using System.ComponentModel.DataAnnotations;
namespace FloresFuertes.Models
{

public class VeilingProduct
{
    [Key]
    public string VeilingProduct_Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string Veiling_Id { get; set; }
    public Veiling? Veiling { get; set; } = null!;

    [Required]
    public string Product_Id { get; set; }
    public Product? Product { get; set; } = null!;

    public int Hoeveelheid { get; set; }

    public float? Prijs { get; set; }
}
}