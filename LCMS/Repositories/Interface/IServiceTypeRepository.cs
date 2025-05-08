using BusinessObjects.DTO.ServiceTypeDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{

        public interface IServiceTypeRepository
        {
        Task<List<ServiceTypeDTO>> GetAllServiceTypesAsync();
        Task<ServiceTypeDTO?> GetServiceTypeByIdAsync(int id);
        Task<ServiceTypeDTO> CreateServiceTypeAsync(CreateServiceTypeDTO dto);
        Task<bool> UpdateServiceTypeAsync(int id, UpdateServiceTypeDTO dto);
        Task<bool> DeleteServiceTypeAsync(int id);


    }
}
