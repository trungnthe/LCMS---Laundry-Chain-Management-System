using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.SupportDTO
{
    public class SupportDTO
    {
        public long SupportId { get; set; }
        public string Category { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? Resolution { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CustomerName { get; set; } = null!;
        public string BranchName { get; set; } = null!; 
        public string? AssignedStaffName { get; set; }
    }

}
