using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.CustomerDTO
{
    public class UpdateStatusRequest
    {
        public int CustomerId { get; set; }
        public string NewStatus { get; set; } = null!;
    }

}
