using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.WeatherSuggestionDTO
{
    public class WeatherSuggestionUpdateDto
    {
        public string? WeatherKeyword { get; set; }
        public int? ProductId { get; set; }
        public int? ServiceId { get; set; }
    }
}
