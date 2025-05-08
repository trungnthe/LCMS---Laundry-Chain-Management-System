using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.SupportDTO
{
    public class UpdateSupportDTO
    {
        [Required(ErrorMessage = "Trạng thái không được để trống.")]
        public string Status { get; set; } = null!;

        public string? Resolution { get; set; } // Kết quả xử lý của yêu cầu (cho Staff)

        public int? AssignedStaffId { get; set; } // Nhân viên được gán xử lý (cho Admin & Manager)
    }

}
