using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.BranchDTO
{
    public class UpdateBranchDto
    {
        public string BranchName { get; set; } = null!;

        public string? Address { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Email { get; set; }

        public string? OpeningHours { get; set; }

        public string Status { get; set; } = null!;
        public DateTime? LastUpdated { get; set; }

        public string? Notes { get; set; }
        public string? MapLink { get; set; }

        public string? IPAddress { get; set; }
        public IFormFile? Image { get; set; }


    }
}
