using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.WeatherSuggestionDTO
{
    public class WeatherSuggestionAdminDto
    {
        public int Id { get; set; }
        public string WeatherKeyword { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public int? ServiceId { get; set; }
        public string ServiceName { get; set; }
    }

}
