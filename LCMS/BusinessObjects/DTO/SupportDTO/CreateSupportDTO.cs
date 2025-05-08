using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.SupportDTO
{
    public class CreateSupportDTO
    {

        [Required]
        public long BookingId { get; set; }  // Thêm trường BookingId

        [Required]
        public string Category { get; set; }

        [Required]
        public string Message { get; set; }

    }
}
