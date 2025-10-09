using System;
using System.ComponentModel.DataAnnotations;

namespace FloresFuertes.Models
{
    public class Bieding
    {
        [Key]
        public string Bieding_Id { get; set; }
        public float Bedrag { get; set; }
        public DateTime Tijdstip { get; set; } = DateTime.Now;

        public string Klant_Id { get; set; }
        public Klant? Klant { get; set; }

        public string Product_Id { get; set; }
        public Product? Product { get; set; }
    }
}