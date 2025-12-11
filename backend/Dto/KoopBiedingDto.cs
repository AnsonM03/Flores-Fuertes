namespace FloresFuertes.Models
{
    public class KoopBiedingDto
    {
        public float PrijsPerStuk { get; set; }
        public int Aantal { get; set; }
        public float Totaal { get; set; }
        public string Klant_Id { get; set; }
        public string Product_Id { get; set; }
        public string Veiling_Id { get; set; }
    }
}