using BusinessObjects.DTO.InventoryDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IInventoryRepository
    {
        Task<List<InventoryDTO>> GetAllAsync();
        Task<List<LowStockDTO>> GetLowStockWarningsAsync();
        Task<InventoryDTO1> GetByIdAsync(int id);
        Task<bool> CreateAsync(CreateInventoryDTO dto);
        Task<bool> UpdateAsync(int id, UpdateInventoryDTO dto);
        Task<bool> DeleteAsync(int id); 
        Task<bool> DeductInventoryAsync(int itemId, int quantityToDeduct, int employeeId, string note);
        Task<List<InventoryDTO2>> GetAllAsync(int branchId);

    }
}
