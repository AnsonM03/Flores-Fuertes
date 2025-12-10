public class ProductCreateDto
{
    public string Foto { get; set; } = null!;
    public string Naam { get; set; } = null!;
    public string ArtikelKenmerken { get; set; } = null!;
    public int Hoeveelheid { get; set; }
    public decimal StartPrijs { get; set; }
    public string Aanvoerder_Id { get; set; } = null!;
}