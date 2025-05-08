using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.LaundrySubscriptionDTO
{
    public class LaundrySubscriotionDTO
    {

        public int? SubscriptionId { get; set; }

        public int? CustomerId { get; set; }

        public string? PackageName { get; set; } = null!;

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public int? MaxItems { get; set; }

        public decimal? MaxWeight { get; set; }

        public int? RemainingItems { get; set; }

        public decimal? RemainingWeight { get; set; }

        public string? Status { get; set; } = null!;

        public decimal Price { get; set; }
        public string? CustomerName { get; set; }

        public string? MembershipLevel { get; set; }

        public int? LoyaltyPoints { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? StatusAccount { get; set; }


    }
    public class LaundryDTO
    {
        public int SubscriptionId { get; set; }
        public string CustomerName { get; set; }
        public string PackageName { get; set; }
        public string Status { get; set; } = null!;


    }
}
