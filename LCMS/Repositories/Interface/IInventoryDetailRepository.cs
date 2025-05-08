using BusinessObjects.DTO.InventoryDetailDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IInventoryDetailRepository
    {
        Task<List<InventoryDetailDTO>> GetAllAsync();
        Task<InventoryDetailDTO> GetByIdAsync(int id);
        Task<bool> CreateAsync(CreateInventoryDetailDTO dto);
        Task<bool> UpdateAsync(int id, CreateInventoryDetailDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<List<InventoryDetailDTO>> FilterByQuantityAsync(int minQuantity, int maxQuantity);
        Task<List<InventoryDetailDTO>> SortByPriceAsync(bool ascending);
    }
}
