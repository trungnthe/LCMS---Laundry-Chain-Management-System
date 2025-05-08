using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.InventoryDTO
{
    public class InventoryDTO
    {
        public int InventoryId { get; set; }
        public string InventoryName { get; set; } = null!;
        public string BranchName { get; set; }
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string? Image { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool? StatusDelete { get; set; }


        public int BranchId { get; set; }


        // Danh sách các chi tiết kho
        public List<InventoryDetailGetAllDTO> InventoryDetails { get; set; } = new();
    }
    public class InventoryDTO2
    {
        public int InventoryId { get; set; }
        public string InventoryName { get; set; } = null!;
        public string BranchName { get; set; }
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string? Image { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool? StatusDelete { get; set; }


        public int BranchId { get; set; }


      
    }


    public class InventoryDetailGetAllDTO
    {
        public int InventoryDetailId { get; set; }
        public string ItemName { get; set; } = null!;
        public int InventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public DateOnly? ExpirationDate { get; set; }
        public string? Image { get; set; }
        public decimal? TotalPrice { get; set; }
        public bool? StatusDelete { get; set; }
    }

    public class InventoryDTO1
    {
        public int InventoryId { get; set; }
        public string InventoryName { get; set; } = null!;
        public string BranchName { get; set; }
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string? Image { get; set; }
        public List<InventoryDetailDTO1> InventoryDetails { get; set; } = new List<InventoryDetailDTO1>();

    }
    public class InventoryDetailDTO1
    {
        public int InventoryDetailId { get; set; }
        public string ItemName { get; set; } = null!;
        public int InventoryId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public DateOnly? ExpirationDate { get; set; }

        public decimal? TotalPrice { get; set; }
        public string? Image { get; set; }



    }

    public class CreateInventoryDTO
    {
        public string InventoryName { get; set; } = null!;
        public int? BranchId { get; set; }
      
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public IFormFile? ImageFile { get; set; }
    }

    public class UpdateInventoryDTO
    {
        public string InventoryName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public IFormFile? Image { get; set; }
    }

    public class LowStockDTO
    {
        public int InventoryID { get; set; }
        public int BranchID { get; set; }
        public string InventoryName { get; set; }
        public string BranchName { get; set; }

        public string ItemName { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; } = null!;
        public string WarningLevel { get; set; }
        public string WarningMessage { get; set; }
    }


}
