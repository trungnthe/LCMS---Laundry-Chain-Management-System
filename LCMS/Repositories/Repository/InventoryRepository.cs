using BusinessObjects.DTO.InventoryDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly InventoryDao inventoryDao;
        public InventoryRepository(InventoryDao inventoryDao)
        {
            this.inventoryDao = inventoryDao;
        }

        public Task<bool> CreateAsync(CreateInventoryDTO dto)
        {
           return inventoryDao.CreateAsync(dto);
        }

        public Task<bool> DeductInventoryAsync(int itemId, int quantityToDeduct, int employeeId, string note)
        {
            return inventoryDao.DeductInventoryAsync(itemId, quantityToDeduct, employeeId, note);
        }

        public Task<bool> DeleteAsync(int id)
        {
            return inventoryDao.DeleteAsync(id);
        }

        public Task<List<InventoryDTO>> GetAllAsync()
        {
            return inventoryDao.GetAllAsync();
        }

        public Task<List<InventoryDTO2>> GetAllAsync(int branchId)
        {
            return inventoryDao.GetAllAsync(branchId);
        }

        public Task<InventoryDTO1> GetByIdAsync(int id)
        {
            return inventoryDao.GetByIdAsync(id);
        }

        public Task<List<LowStockDTO>> GetLowStockWarningsAsync()
        {
            return inventoryDao.GetLowStockWarningsAsync();
        }

        public Task<bool> UpdateAsync(int id, UpdateInventoryDTO dto)
        {
            return inventoryDao.UpdateAsync(id, dto);
        }
    }
}
