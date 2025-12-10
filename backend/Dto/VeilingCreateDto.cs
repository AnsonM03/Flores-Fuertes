public class VeilingCreateDto
{
    public decimal VeilingPrijs { get; set; }
    public DateOnly VeilingDatum { get; set; }
    public DateTime StartTijd { get; set; }
    public DateTime EindTijd { get; set; }
    public string Kloklocatie { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Veilingmeester_Id { get; set; } = null!;
}