using BusinessObjects.DTO.ProductCategoryDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IProductCategoryRepository
    {
        Task<List<ProductCategoryDTO>> GetAllCategoriesAsync();
        Task<ProductCategoryDTO?> GetCategoryByIdAsync(int id);
        Task<ProductCategoryDTO> CreateCategoryAsync(CreateProductCategoryDTO dto);
        Task<bool> UpdateCategoryAsync(int id, CreateProductCategoryDTO dto);
        Task<bool> DeleteCategoryAsync(int id);
    }
}
