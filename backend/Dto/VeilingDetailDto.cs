namespace FloresFuertes.Models
{
    public class VeilingDetailDto : VeilingListDto
    {
        public List<VeilingProductDto> VeilingProducten { get; set; } = new();
    }
}