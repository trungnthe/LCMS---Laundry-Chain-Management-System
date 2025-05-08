using BusinessObjects.DTO.ProductDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IProductRepository
    {

        Task<List<ProductDTO>> GetAllProductsAsync();
        Task<ProductDTO> CreateProductAsync(CreateProductDTO dto);
        Task<ProductDTO?> GetProductByIdAsync(int id); 
        Task<List<ProductDTO>> GetProductByCategoryById(int id);

        Task<bool> UpdateProductAsync(int id, CreateProductDTO dto);
        Task<bool> DeleteProductAsync(int id);
    }
}
