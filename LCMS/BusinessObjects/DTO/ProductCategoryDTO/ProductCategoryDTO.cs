using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.ProductCategoryDTO
{
    public class ProductCategoryDTO
    {
        public int ProductCategoryId { get; set; }

        public string ProductCategoryName { get; set; } = null!;

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public string? Image { get; set; }
        public bool? StatusDelete { get; set; }
    }
    public class CreateProductCategoryDTO
    {
        public string ProductCategoryName { get; set; } = null!;
        public IFormFile? Image { get; set; }
    }


}
