using AutoMapper;
using BusinessObjects.DTO.ProductDTO;
using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class ProductDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        public ProductDao(LcmsContext context,IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<ProductDTO>> GetAllProductsAsync()
        {
            var products = await _context.Products
                .Include(x => x.ProductCategory)
                .ToListAsync();

            var mappedResult = _mapper.Map<List<ProductDTO>>(products);

            var allServiceIds = products
                .Where(p => !string.IsNullOrEmpty(p.ServiceList))
                .SelectMany(p => p.ServiceList!.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                               .Select(int.Parse))
                .Distinct()
                .ToList();

            var services = await _context.Services
                .Where(s => allServiceIds.Contains(s.ServiceId))
                .ToDictionaryAsync(s => s.ServiceId, s => s.ServiceName);

            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);

                if (!string.IsNullOrEmpty(item.ServiceList))
                {
                    var ids = item.ServiceList.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(int.Parse)
                                .ToList();

                    item.ServiceNames = ids
                        .Where(id => services.ContainsKey(id))
                       .SelectMany(id => new[] { id.ToString(), services[id] })
                        .ToList();

                   
                        
                }
            }

            return mappedResult;
        }




        public async Task<ProductDTO?> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductCategory)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return null;

            var item = _mapper.Map<ProductDTO>(product);
            item.Image = ImageHelper.GetFullImageUrl(item.Image);

            if (!string.IsNullOrEmpty(product.ServiceList))
            {
                var serviceIds = product.ServiceList.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                    .Select(int.Parse)
                                    .ToList();

                var servicesDict = await _context.Services
                    .Where(s => serviceIds.Contains(s.ServiceId))
                    .ToDictionaryAsync(s => s.ServiceId, s => s.ServiceName);

                item.ServiceNames = serviceIds
                    .Where(id => servicesDict.ContainsKey(id))
                    .SelectMany(id => new[] { id.ToString(), servicesDict[id] })
                    .ToList();

                
            }

            return item;
        }


        public async Task<ProductDTO> CreateProductAsync(CreateProductDTO dto)
        {
            try
            {
                // Kiểm tra ProductName đã tồn tại chưa
                var existingProduct = await _context.Products
                    .AnyAsync(p => p.ProductName == dto.ProductName);

                if (existingProduct)
                {
                    throw new Exception("Tên sản phẩm đã tồn tại.");
                }

                // Kiểm tra ServiceList hợp lệ
                if (!string.IsNullOrEmpty(dto.ServiceList))
                {
                    var serviceIds = dto.ServiceList.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                      .Select(int.Parse)
                                      .ToList();

                    // Kiểm tra các service có tồn tại không
                    var existingServicesCount = await _context.Services
                        .Where(s => serviceIds.Contains(s.ServiceId))
                        .CountAsync();

                    if (existingServicesCount != serviceIds.Count)
                    {
                        throw new Exception("Một hoặc nhiều ServiceID không tồn tại trong hệ thống");
                    }
                }

                var product = _mapper.Map<Product>(dto);
                product.CreatedAt = DateTime.Now;
                product.UpdatedAt = DateTime.Now;

                // Xử lý ảnh
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    var uploadsFolder = Path.Combine("wwwroot", "uploads", "product");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(fileStream);
                    }

                    product.Image = $"/uploads/product/{uniqueFileName}";
                }

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                // Lấy thông tin đầy đủ để trả về
                var createdProduct = await _context.Products
                    .Include(p => p.ProductCategory)
                    .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);

                var result = _mapper.Map<ProductDTO>(createdProduct);
                result.Image = ImageHelper.GetFullImageUrl(result.Image);

                // Thêm ServiceNames nếu có
                if (!string.IsNullOrEmpty(createdProduct.ServiceList))
                {
                    var serviceIds = createdProduct.ServiceList.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Select(int.Parse);

                    result.ServiceNames = await _context.Services
                        .Where(s => serviceIds.Contains(s.ServiceId))
                        .Select(s => s.ServiceName)
                        .ToListAsync();
                }

                return result;
            }
            catch (FormatException)
            {
                throw new Exception("ServiceList không đúng định dạng (phải là các số cách nhau bởi dấu phẩy)");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo sản phẩm: {ex.Message}");
            }
        }



        public async Task<bool> UpdateProductAsync(int id, CreateProductDTO dto)
        {
            try
            {
                // Lấy sản phẩm bao gồm cả danh mục
                var product = await _context.Products
                    .Include(p => p.ProductCategory)
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (product == null) return false;

                // Kiểm tra trùng tên sản phẩm (trừ sản phẩm hiện tại)
                var duplicateName = await _context.Products
                    .AnyAsync(p => p.ProductName == dto.ProductName && p.ProductId != id);

                if (duplicateName)
                {
                    throw new Exception("Tên sản phẩm đã tồn tại cho sản phẩm khác");
                }

                // Kiểm tra ServiceList hợp lệ
                if (!string.IsNullOrEmpty(dto.ServiceList))
                {
                    var serviceIds = dto.ServiceList.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                      .Select(int.Parse)
                                      .Distinct()
                                      .ToList();

                    var existingServicesCount = await _context.Services
                        .Where(s => serviceIds.Contains(s.ServiceId))
                        .CountAsync();

                    if (existingServicesCount != serviceIds.Count)
                    {
                        throw new Exception("Một hoặc nhiều ServiceID không tồn tại");
                    }
                }

                // Lưu lại ảnh cũ trước khi cập nhật
                string oldImage = product.Image;

                // Cập nhật các trường cơ bản
                product.ProductName = dto.ProductName;
                product.Price = dto.Price;
                product.ProductCategoryId = dto.ProductCategoryId;
                product.ServiceList = dto.ServiceList;
                product.UpdatedAt = DateTime.UtcNow;

                // Xử lý ảnh
                if (dto.Image != null && dto.Image.Length > 0)
                {
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
                    var uploadsFolder = Path.Combine("wwwroot", "uploads", "product");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(fileStream);
                    }

                    product.Image = $"/uploads/product/{uniqueFileName}";
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (FormatException)
            {
                throw new Exception("ServiceList không đúng định dạng (phải là các số cách nhau bởi dấu phẩy)");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật sản phẩm: {ex.Message}");
            }
        }


        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.StatusDelete = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ProductDTO>> GetProductByCategoryById(int categoryId)
        {
            var products = await _context.Products
                .Include(p => p.ProductCategory)
                .Where(p => p.ProductCategoryId == categoryId)
                .ToListAsync();

            if (!products.Any())
                return new List<ProductDTO>();

            var productDTOs = _mapper.Map<List<ProductDTO>>(products);

            // Tối ưu hóa việc lấy ServiceNames bằng cách sử dụng Dictionary
            var productIdsWithServices = products
                .Where(p => !string.IsNullOrEmpty(p.ServiceList))
                .Select(p => new { p.ProductId, ServiceIds = p.ServiceList.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse) })
                .ToList();

            var allServiceIds = productIdsWithServices.SelectMany(x => x.ServiceIds).Distinct().ToList();

            if (allServiceIds.Any())
            {
                var servicesDict = await _context.Services
                    .Where(s => allServiceIds.Contains(s.ServiceId))
                    .ToDictionaryAsync(s => s.ServiceId, s => s.ServiceName);

                foreach (var productDto in productDTOs)
                {
                    productDto.Image = ImageHelper.GetFullImageUrl(productDto.Image);

                    var productWithServices = productIdsWithServices.FirstOrDefault(p => p.ProductId == productDto.ProductId);
                    if (productWithServices != null)
                    {
                        productDto.ServiceNames = productWithServices.ServiceIds
                            .Where(id => servicesDict.ContainsKey(id))
                            .Select(id => servicesDict[id])
                            .ToList();
                    }
                }
            }
            else
            {
                foreach (var productDto in productDTOs)
                {
                    productDto.Image = ImageHelper.GetFullImageUrl(productDto.Image);
                }
            }

            return productDTOs;
        }

    }
}
