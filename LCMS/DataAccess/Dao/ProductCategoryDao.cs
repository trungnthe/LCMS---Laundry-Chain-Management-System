using AutoMapper;
using BusinessObjects.DTO.InventoryDTO;
using BusinessObjects.DTO.ProductCategoryDTO;
using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class ProductCategoryDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        public ProductCategoryDao(LcmsContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<ProductCategoryDTO>> GetAllCategoriesAsync()
        {
            var result = await _context.ProductCategories.ToListAsync();
            var mappedResult=  _mapper.Map<List<ProductCategoryDTO>>(result);
            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }

            return mappedResult;
        }


        public async Task<ProductCategoryDTO?> GetCategoryByIdAsync(int id)
        {
            var category = await _context.ProductCategories.FindAsync(id);
            var item= _mapper.Map<ProductCategoryDTO>(category);
            item.Image = ImageHelper.GetFullImageUrl(item.Image);
            return item;
        }


        public async Task<ProductCategoryDTO> CreateCategoryAsync(CreateProductCategoryDTO dto)
        {
            try
            {
                // Kiểm tra CategoryName đã tồn tại chưa
                var existingCategory = await _context.ProductCategories
                    .AnyAsync(c => c.ProductCategoryName == dto.ProductCategoryName);

                if (existingCategory)
                {
                    throw new Exception("Tên danh mục đã tồn tại.");
                }

                var category = _mapper.Map<ProductCategory>(dto);
                category.CreatedAt = DateTime.UtcNow;

                // Xử lý ảnh nếu có
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    var uploadsFolder = Path.Combine("wwwroot", "uploads", "category");
                    Directory.CreateDirectory(uploadsFolder); // Đảm bảo thư mục tồn tại

                    var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(fileStream);
                    }

                    category.Image = $"/uploads/category/{uniqueFileName}";
                }

                _context.ProductCategories.Add(category);
                await _context.SaveChangesAsync();

                return _mapper.Map<ProductCategoryDTO>(category);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<bool> UpdateCategoryAsync(int id, CreateProductCategoryDTO dto)
        {
            var category = await _context.ProductCategories.FindAsync(id);
            if (category == null) return false;

            // Lưu lại ảnh cũ trước khi ánh xạ DTO
            string oldImage = category.Image;

            // Ánh xạ dữ liệu từ DTO sang entity
            _mapper.Map(dto, category);
            category.UpdatedAt = DateTime.UtcNow;

            // Nếu có ảnh mới, thực hiện cập nhật ảnh
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine("wwwroot", "uploads", "category");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Xóa ảnh cũ nếu có
                if (!string.IsNullOrEmpty(oldImage))
                {
                    var oldImagePath = Path.Combine("wwwroot", oldImage.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                }

                // Lưu ảnh mới
                var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(fileStream);
                }

                category.Image = $"/uploads/category/{uniqueFileName}";
            }
            else
            {
                // Nếu không có ảnh mới, giữ nguyên ảnh cũ
                category.Image = oldImage;
            }

            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.ProductCategories.FindAsync(id);
            if (category == null) return false;

            category.StatusDelete = false;

            var relatedProducts = await _context.Products
                .Where(p => p.ProductCategoryId == id)
                .ToListAsync();

            foreach (var product in relatedProducts)
            {
                product.StatusDelete = false;
            }

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
