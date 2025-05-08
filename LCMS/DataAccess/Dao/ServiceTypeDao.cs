using AutoMapper;
using BusinessObjects.DTO.ServiceTypeDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class ServiceTypeDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;

        public ServiceTypeDao(LcmsContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // Lấy danh sách tất cả loại dịch vụ
        public async Task<List<ServiceTypeDTO>> GetAllServiceTypesAsync()
        {
            var serviceTypes = await _context.ServiceTypes.ToListAsync();
            var mappedResult = _mapper.Map<List<ServiceTypeDTO>>(serviceTypes);

            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }

            return mappedResult;
        }

        // Lấy thông tin loại dịch vụ theo ID
        public async Task<ServiceTypeDTO?> GetServiceTypeByIdAsync(int id)
        {
            var serviceType = await _context.ServiceTypes.FindAsync(id);
            if (serviceType == null) return null;

            var result = _mapper.Map<ServiceTypeDTO>(serviceType);
            result.Image = ImageHelper.GetFullImageUrl(result.Image);
            return result;
        }

        // Tạo mới loại dịch vụ
        public async Task<ServiceTypeDTO> CreateServiceTypeAsync(CreateServiceTypeDTO dto)
        {
            try
            {
                // Kiểm tra ServiceTypeName đã tồn tại chưa
                var existingServiceType = await _context.ServiceTypes
                    .AnyAsync(st => st.ServiceTypeName == dto.ServiceTypeName);

                if (existingServiceType)
                {
                    throw new Exception("Loại dịch vụ đã tồn tại.");
                }

                var serviceType = _mapper.Map<ServiceType>(dto);

                // Xử lý ảnh nếu có
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    var imagePath = await SaveImageAsync(dto.Image, "servicetype");
                    serviceType.Image = imagePath;
                }

                _context.ServiceTypes.Add(serviceType);
                await _context.SaveChangesAsync();

                return _mapper.Map<ServiceTypeDTO>(serviceType);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        // Cập nhật loại dịch vụ
        public async Task<bool> UpdateServiceTypeAsync(int id, UpdateServiceTypeDTO dto)
        {
            var serviceType = await _context.ServiceTypes.FindAsync(id);
            if (serviceType == null) return false;

            // Lưu lại ảnh cũ trước khi ánh xạ DTO
            string oldImage = serviceType.Image;

            // Ánh xạ dữ liệu từ DTO sang entity
            _mapper.Map(dto, serviceType);

            // Nếu có ảnh mới, cập nhật ảnh
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
                var imagePath = await SaveImageAsync(dto.Image, "servicetype");
                serviceType.Image = imagePath;
            }
            else
            {
                // Nếu không có ảnh mới, giữ nguyên ảnh cũ
                serviceType.Image = oldImage;
            }

            await _context.SaveChangesAsync();
            return true;
        }


        // Xóa loại dịch vụ
        public async Task<bool> DeleteServiceTypeAsync(int id)
        {
            var serviceType = await _context.ServiceTypes.FindAsync(id);
            if (serviceType == null) return false;

          

            serviceType.StatusDelete = false;
            var relatedProducts = await _context.Services
               .Where(p => p.ServiceTypeId == id)
               .ToListAsync();

            foreach (var product in relatedProducts)
            {
                product.StatusDelete = false;
            }
            await _context.SaveChangesAsync();
            return true;
        }

        // Hàm lưu ảnh vào thư mục
        private async Task<string> SaveImageAsync(IFormFile imageFile, string folderName)
        {
            var uploadsFolder = Path.Combine("wwwroot", "uploads", folderName);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            return $"/uploads/{folderName}/{uniqueFileName}";
        }
    }
}
