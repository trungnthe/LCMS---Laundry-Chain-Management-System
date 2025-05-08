using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly ServiceDao _serviceDao;

        public ServiceRepository(ServiceDao serviceDao)
        {
            _serviceDao = serviceDao;
        }

        public Task<ServiceDTO> CreateServiceAsync(CreateServiceDTO dto)
        {
            return _serviceDao.CreateServiceAsync(dto);
        }

        public Task<bool> DeleteServiceAsync(int id)
        {
           return _serviceDao.DeleteServiceAsync(id);
        }

        public Task<List<ServiceDTO>> GetAllServiceAsync()
        {
           return _serviceDao.GetAllServiceAsync();
        }

        public Task<ServiceDTO?> GetServiceByIdAsync(int id)
        {
            return _serviceDao.GetServiceByIdAsync(id);
        }

        public Task<List<ServiceDTO>> GetServiceByServiceTypeIdAsync(int serviceTypeID)
        {
            return _serviceDao.GetServiceByServiceTypeIdAsync(serviceTypeID);
        }

        public Task<bool> UpdateServiceAsync(int id, UpdateServiceDTO dto)
        {
            return _serviceDao.UpdateServiceAsync(id, dto);
        }
    }
}
