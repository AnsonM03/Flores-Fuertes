public class ProductDto
{
    public string Product_Id { get; set; } = null!;
    public string Foto { get; set; } = null!;
    public string Naam { get; set; } = null!;
    public string ArtikelKenmerken { get; set; } = null!;
    public int Hoeveelheid { get; set; }
    public float StartPrijs { get; set; }
}