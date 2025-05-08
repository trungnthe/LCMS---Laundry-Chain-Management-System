using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.BookingHistoryDTO
{
    public class BookingDetaiHistoryDTO
    {
        public int Id { get; set; }

        public int BookingDetailId { get; set; }

        public int BookingId { get; set; }

        public string? OldStatusLaundry { get; set; }

        public string NewStatusLaundry { get; set; } = null!;

        public DateTime UpdatedAt { get; set; }

        public int UpdatedBy { get; set; }
    }
    public class UpdateBookingDetailHistory
    {
        public int Id { get; set; }
        public string NewStatus { get; set; }
    }
    public class UpdateBookingDetailWeight
    {
        public int Id { get; set; }
        public decimal? Weight { get; set; }
    }
    public class UpdateShippingFee
    {
        public int Id { get; set; }
        public decimal? ShippingFee { get; set; }
    }
}
