using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.ServiceTypeDTO
{
    public class ServiceTypeDTO
    {
        public int ServiceTypeId { get; set; }
        public string ServiceTypeName { get; set; }
        public string Description { get; set; }
        public string? Image { get; set; }
        public bool? StatusDelete { get; set; }
    }

    public class CreateServiceTypeDTO
    {
        public string ServiceTypeName { get; set; }
        public string Description { get; set; }
        public IFormFile? Image { get; set; }
    }

    public class UpdateServiceTypeDTO
    {
        public string ServiceTypeName { get; set; }
        public string Description { get; set; }
        public IFormFile? Image { get; set; }
    }
}
