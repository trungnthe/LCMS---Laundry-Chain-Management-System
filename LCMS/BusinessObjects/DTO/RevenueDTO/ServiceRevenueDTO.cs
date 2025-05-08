using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.RevenueDTO
{
    public class ServiceRevenueDTO
    {
        public string ServiceName { get; set; }

        public string ServiceType { get; set; }
        public int Year { get; set; }

        public int Month { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
