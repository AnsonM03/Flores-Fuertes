public class KoppelProductDto
{
    public string VeilingId { get; set; } = null!;
    public string ProductId { get; set; } = null!;
    public int Hoeveelheid { get; set; }
    public decimal? Prijs { get; set; }
}