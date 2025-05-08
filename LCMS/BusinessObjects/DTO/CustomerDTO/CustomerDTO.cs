using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.EmployeeDTO
{
    public class CustomerDTO
    {
        public int AccountId { get; set; }
        public string CustomerName { get; set; }
        public string MembershipLevel { get; set; }
        public int LoyaltyPoints { get; set; }
        public string Email { get; set; }     
        public string PhoneNumber { get; set; }
        public decimal TotalSpent { get; set; }
        public string Status {  get; set; }
        public DateTime CreatedAt { get; set; }
        public string PackMonth { get; set; }


    }



}
