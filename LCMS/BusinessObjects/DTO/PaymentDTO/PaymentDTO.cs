using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.PaymentDTO
{
    public class CreatePaymentDTO
    {
        public int BookingId { get; set; }
        public int? Points { get; set; }
        public decimal? Discount { get; set; }
        public string? PaymentType { get; set; }
    }
    public class PaymentDTO
    {
        public int PaymentId { get; set; }

        public int BookingId { get; set; }

        public DateTime PaymentDate { get; set; }

        public decimal AmountPaid { get; set; }

        public string? PaymentStatus { get; set; }

        public string? Qrcode { get; set; }

        public decimal? Discount { get; set; }

        public decimal? TotalPrice { get; set; }

        public string? PaymentType { get; set; }

        public int? Points { get; set; }

        public int? CreateBy { get; set; }
        public string Name { get; set; }

    }


}
