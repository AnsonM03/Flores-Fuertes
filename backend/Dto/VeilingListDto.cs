public class VeilingListDto
{
    public string Veiling_Id { get; set; } = "";

    // veilingprijs gebruik je niet meer, maar als je 'm nog terugstuurt:
    public float? VeilingPrijs { get; set; }

    public DateOnly? VeilingDatum { get; set; }

    // pas beschikbaar na start
    public DateTime? StartTijd { get; set; }
    public DateTime? EindTijd { get; set; }

    public string Kloklocatie { get; set; } = "";
    public string Status { get; set; } = "";

    public string Veilingmeester_Id { get; set; } = "";
    public string VeilingmeesterNaam { get; set; } = "";

    // optioneel (als je dit toont)
    public decimal? MinimumPrijs { get; set; }
}