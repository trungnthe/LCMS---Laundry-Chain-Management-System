using BusinessObjects.DTO.ServiceTypeDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class ServiceTypeRepository : IServiceTypeRepository
    {
        private readonly ServiceTypeDao _serviceTypeDao;
        public ServiceTypeRepository(ServiceTypeDao serviceTypeDao)
        {
            _serviceTypeDao = serviceTypeDao;
        }

        public Task<ServiceTypeDTO> CreateServiceTypeAsync(CreateServiceTypeDTO dto)
        {
           return _serviceTypeDao.CreateServiceTypeAsync(dto);
        }

        public Task<bool> DeleteServiceTypeAsync(int id)
        {
           return _serviceTypeDao.DeleteServiceTypeAsync(id);
        }

        public Task<List<ServiceTypeDTO>> GetAllServiceTypesAsync()
        {
            return _serviceTypeDao.GetAllServiceTypesAsync();
        }

        public Task<ServiceTypeDTO?> GetServiceTypeByIdAsync(int id)
        {
            return _serviceTypeDao.GetServiceTypeByIdAsync(id);
        }

        public Task<bool> UpdateServiceTypeAsync(int id, UpdateServiceTypeDTO dto)
        {
            return _serviceTypeDao.UpdateServiceTypeAsync(id, dto);
        }
    }
}
