using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.InventoryDetailDTO
{
   
        public class InventoryDetailDTO
        {
            public int InventoryDetailId { get; set; }
            public string ItemName { get; set; } = null!;
            public int InventoryId { get; set; }
            public int Quantity { get; set; }
            public decimal Price { get; set; }
            public DateOnly? ExpirationDate { get; set; }
      
            public decimal? TotalPrice { get; set; }
        public string? Image { get; set; }
        public bool? StatusDelete { get; set; }
        public DateTime? CreateAt { get; set; }




        public string InventoryName { get; set; } = null!;
        }
    public class CreateInventoryDetailDTO
    {
        public string ItemName { get; set; } = null!;
        public int InventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public DateOnly? ExpirationDate { get; set; }
       
        public IFormFile? Image { get; set; }

    }


}
