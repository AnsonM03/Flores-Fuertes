public class VeilingCreateDto
{
    public DateOnly? VeilingDatum { get; set; }
    public string Kloklocatie { get; set; } = "";
    public string Status { get; set; } = "wachten";
    public string Veilingmeester_Id { get; set; } = "";
}