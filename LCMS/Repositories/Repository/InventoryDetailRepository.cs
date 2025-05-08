using BusinessObjects.DTO.InventoryDetailDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class InventoryDetailRepository : IInventoryDetailRepository
    {
        private readonly InventoryDetailDao _inventoryDetailDao;
        public InventoryDetailRepository(InventoryDetailDao inventoryDetailDao)
        {
            _inventoryDetailDao = inventoryDetailDao;
        }
        public Task<bool> CreateAsync(CreateInventoryDetailDTO dto)
        {
            return _inventoryDetailDao.CreateAsync(dto);
        }

        public Task<bool> DeleteAsync(int id)
        {
          return _inventoryDetailDao.DeleteAsync(id);
        }

        public Task<List<InventoryDetailDTO>> FilterByQuantityAsync(int minQuantity, int maxQuantity)
        {
            return _inventoryDetailDao.FilterByQuantityAsync(minQuantity, maxQuantity);
        }

        public Task<List<InventoryDetailDTO>> GetAllAsync()
        {
            return _inventoryDetailDao.GetAllAsync();
        }

        public Task<InventoryDetailDTO> GetByIdAsync(int id)
        {
          return _inventoryDetailDao.GetByIdAsync(id);
        }

        public Task<List<InventoryDetailDTO>> SortByPriceAsync(bool ascending)
        {
           return _inventoryDetailDao.SortByPriceAsync(ascending);
        }

        public Task<bool> UpdateAsync(int id, CreateInventoryDetailDTO dto)
        {
          return _inventoryDetailDao.UpdateAsync(id, dto);
        }
    }
}
