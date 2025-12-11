public class KoopDto
    {
        public float PrijsPerStuk { get; set; }
        public int Aantal { get; set; }
        public float Totaal { get; set; }

        public string Klant_Id { get; set; } = default!;
        public string Product_Id { get; set; } = default!;
        public string Veiling_Id { get; set; } = default!;
    }