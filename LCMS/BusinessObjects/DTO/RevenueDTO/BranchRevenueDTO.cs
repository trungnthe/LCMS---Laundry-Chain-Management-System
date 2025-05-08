using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.RevenueDTO
{
    public class BranchRevenueDTO
    {
        public int BranchID { get; set; }

        public string BranchName { get; set; }

        public int Year { get; set; }

        public int Month { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}
