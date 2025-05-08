using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.SuggesstionDTO
{
    public class SuggestionDTO
    {
        public class CartSuggestionDto
        {
            public int? ProductId { get; set; }
            public string? ProductName { get; set; }
            public string? ProductImage { get; set; }
            public decimal? ProductPrice { get; set; }

            public int ServiceId { get; set; }
            public string ServiceName { get; set; } = null!;
            public string? ServiceImage { get; set; }
            public decimal? ServicePrice { get; set; }

            public int Quantity { get; set; } = 1;


        }

        public class WeatherSuggestionDto
        {
            public int ProductId { get; set; }
            public decimal? ProductPrice { get; set; }
            public decimal? ServicePrice { get; set; }
            public string ProductName { get; set; }

            public string ProductImage { get; set; }

            public string ServiceImage { get; set; }
            public int? Quantity { get; set; }
            public int ServiceId { get; set; }
            public string ServiceName { get; set; }
        }

        public class BookingSuggestionDto
        {
            public string? Note { get; set; }
            public string? DeliveryAddress { get; set; }

            public string? PickupAddress { get; set; }

        }
        public class ProductDto
        {
            public int ProductId { get; set; }
            public string ProductName { get; set; } = null!;
            public string? ProductImage { get; set; }
            public decimal? ProductPrice { get; set; }

            public int ServiceId { get; set; }
            public string ServiceName { get; set; } = null!;
            public string? ServiceImage { get; set; }
            public decimal? ServicePrice { get; set; }
        }


    }
}
