using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.FeedbackDTO
{
    public class FeedbackDTO
    {
        public int FeedbackId { get; set; }

        public int BookingDetailId { get; set; }

        public int? Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime? FeedbackDate { get; set; }

        public int? AccountId { get; set; }
        public string? AccountName { get; set; }

        public DateTime? ReplyDate { get; set; }

        public int? ParentFeedbackId { get; set; }
    }

    public class FeedbackGetAllDTO
    {
        public int FeedbackId { get; set; }
        public int BookingDetailId { get; set; }
        public string? ServiceName { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? FeedbackDate { get; set; }
        public DateTime? ReplyDate { get; set; }
        public string? CustomerName { get; set; }
    }
    public class CreateFeedbackDTO
    {
      

        public int BookingDetailId { get; set; }

        public int? Rating { get; set; }

        public string? Comment { get; set; }

        

        public int? AccountId { get; set; }

    }
    public class ReplyFeedbackDTO
    {


        public int BookingDetailId { get; set; }

       

        public string? Comment { get; set; }



        public int? AccountId { get; set; }





    }
    public class UpdateFeedbackDTO
    {
        public int Rating { get; set; }
        public string Comment { get; set; }
    }

}
