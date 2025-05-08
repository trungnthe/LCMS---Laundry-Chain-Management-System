using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IServiceRepository
    {
        Task<List<ServiceDTO>> GetAllServiceAsync();
        Task<ServiceDTO?> GetServiceByIdAsync(int id);
        Task<List<ServiceDTO>> GetServiceByServiceTypeIdAsync(int serviceTypeID);
        Task<ServiceDTO> CreateServiceAsync(CreateServiceDTO dto);
        Task<bool> UpdateServiceAsync(int id, UpdateServiceDTO dto);
        Task<bool> DeleteServiceAsync(int id);
    }
}
