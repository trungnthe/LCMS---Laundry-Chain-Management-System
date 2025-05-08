using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.NotificationDTO
{
    public class NotificationDTO
    {
        public int NotificationId { get; set; }

        public string Title { get; set; } = null!;

        public string Content { get; set; } = null!;

        public int? AccountId { get; set; }

        public int CreatedById { get; set; }
        public string? Image { get; set; }
        public string Type { get; set; }

        public DateTime? CreatedAt { get; set; }

        public bool? IsRead { get; set; }

        public int? BookingId { get; set; }
        public long SupportId {  get; set; }

    }

    public class NotificationDirectDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public int AccountId { get; set; }
        public int CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public int BookingId { get; set; }
        public string Type { get; set; }
        public bool IsRead { get; set; }
    }



    public class NotificationCreateDTO
    {
        public int CreatedById { get; set; }  
        public string Title { get; set; }
        public string Content { get; set; }
        public int? AccountId { get; set; } 
        public string Type { get; set; }
        public bool SendToAllRole4 { get; set; } 
        public bool SendToAllRole23 { get; set; } 
        
    }
    public class NotificationBranchDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string? Type { get; set; }
        public int BranchId { get; set; } // Gửi theo chi nhánh
    }




}
