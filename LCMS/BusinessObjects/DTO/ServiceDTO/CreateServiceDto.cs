using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.ServiceDTO
{
    public class CreateServiceDTO
    {
     
            public string ServiceName { get; set; }
            public string Description { get; set; }
            public decimal? Price { get; set; }
            public int ServiceTypeId { get; set; }
            public IFormFile? Image { get; set; }
            public TimeOnly? EstimatedTime { get; set; }

    }
}
