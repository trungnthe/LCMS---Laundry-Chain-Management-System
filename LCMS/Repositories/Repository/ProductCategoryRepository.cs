using BusinessObjects.DTO.ProductCategoryDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class ProductCategoryRepository : IProductCategoryRepository
    {
        private readonly ProductCategoryDao _repository;
        public ProductCategoryRepository(ProductCategoryDao repository)
        {
            _repository = repository;
        }

        public Task<ProductCategoryDTO> CreateCategoryAsync(CreateProductCategoryDTO dto)
        {
            return _repository.CreateCategoryAsync(dto);
        }

        public Task<bool> DeleteCategoryAsync(int id)
        {
            return _repository.DeleteCategoryAsync(id);
        }

        public Task<List<ProductCategoryDTO>> GetAllCategoriesAsync()
        {
            return _repository.GetAllCategoriesAsync();
        }

        public Task<ProductCategoryDTO?> GetCategoryByIdAsync(int id)
        {
            return _repository.GetCategoryByIdAsync(id);
        }

        public Task<bool> UpdateCategoryAsync(int id, CreateProductCategoryDTO dto)
        {
            return _repository.UpdateCategoryAsync(id, dto);
        }
    }
}
