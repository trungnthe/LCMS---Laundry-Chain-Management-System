using BusinessObjects.DTO.ProductDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ProductDao _productDao;
        public ProductRepository(ProductDao productDao)
        {
            _productDao = productDao;
        }
        public Task<ProductDTO> CreateProductAsync(CreateProductDTO dto)
        {
            return _productDao.CreateProductAsync(dto);
        }

        public Task<bool> DeleteProductAsync(int id)
        {
           return _productDao.DeleteProductAsync(id);
        }

        public Task<List<ProductDTO>> GetAllProductsAsync()
        {
            return _productDao.GetAllProductsAsync();
        }

        public Task<List<ProductDTO>> GetProductByCategoryById(int id)
        {
            return _productDao.GetProductByCategoryById(id);
        }

        public Task<ProductDTO?> GetProductByIdAsync(int id)
        {
            return _productDao.GetProductByIdAsync(id);
        }

        public Task<bool> UpdateProductAsync(int id, CreateProductDTO dto)
        {
            return _productDao.UpdateProductAsync(id, dto);
        }
    }
}
