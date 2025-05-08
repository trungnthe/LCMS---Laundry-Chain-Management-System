using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.ProductDTO
{
    public class ProductDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public decimal Price { get; set; }
        public int ProductCategoryId { get; set; }
        public string ProductCategoryName{ get; set; }
        public string? Image { get; set; }

        public string? ServiceList { get; set; }
        public bool? StatusDelete { get; set; }

        public List<string> ServiceNames { get; set; } = new List<string>();
      

    }
    public class CreateProductDTO
    {
        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
        public string ProductName { get; set; } = null!;

        [Range(0.01, double.MaxValue, ErrorMessage = "Giá phải lớn hơn 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Danh mục sản phẩm là bắt buộc")]
        public int ProductCategoryId { get; set; }

        public IFormFile? Image { get; set; }

        [RegularExpression(@"^(\d+,?)*$", ErrorMessage = "ServiceList phải là chuỗi số cách nhau bởi dấu phẩy")]
        public string? ServiceList { get; set; }
    }


}
