using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.CartDTO
{
    public class CartItemDto
    {
        public int ItemId {  get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal? Weight { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
        public string? Image { get; set; }
    }
    public class CartAddItemDto
    {

        public int ServiceId { get; set; }
        public int? ProductId { get; set; }
    
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }

    }

    public class CartDto
    {
      
        public List<CartItemDto> Items { get; set; } = new();
    }


}
