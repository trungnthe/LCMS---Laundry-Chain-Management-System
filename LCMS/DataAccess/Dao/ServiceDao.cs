using AutoMapper;
using BusinessObjects.DTO.ServiceDTO;
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
    public class ServiceDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;

        public ServiceDao(LcmsContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // Lấy danh sách tất cả dịch vụ (kèm ServiceType)
        public async Task<List<ServiceDTO>> GetAllServiceAsync()
        {
            var services = await _context.Services.Include(x => x.ServiceType).ToListAsync();
            var mappedResult = _mapper.Map<List<ServiceDTO>>(services);
            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }

            return mappedResult;
          
        }

        // Lấy thông tin dịch vụ theo ID
        public async Task<ServiceDTO?> GetServiceByIdAsync(int id)
        {
            var service = await _context.Services.Include(x => x.ServiceType).FirstOrDefaultAsync(s => s.ServiceId == id);
            var item = _mapper.Map<ServiceDTO>(service);
            item.Image = ImageHelper.GetFullImageUrl(item.Image);
            return item;
        }

        // Lấy danh sách dịch vụ theo loại dịch vụ
        public async Task<List<ServiceDTO>> GetServiceByServiceTypeIdAsync(int serviceTypeID)
        {
            var services = await _context.Services.Include(x => x.ServiceType)
                                                  .Where(s => s.ServiceTypeId == serviceTypeID)
                                                  .ToListAsync();
            var mappedResult = _mapper.Map<List<ServiceDTO>>(services);
            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }

            return mappedResult;

        }

        // Tạo mới dịch vụ
        public async Task<ServiceDTO> CreateServiceAsync(CreateServiceDTO dto)
        {
            try
            {
                // Kiểm tra ServiceName đã tồn tại chưa
                var existingService = await _context.Services
                    .AnyAsync(s => s.ServiceName == dto.ServiceName);

                

                var service = _mapper.Map<Service>(dto);

                // Xử lý ảnh nếu có
                if (dto.Image != null && dto.Image.Length > 0)
                {
                    var imagePath = await SaveImageAsync(dto.Image, "service");
                    service.Image = imagePath;
                }

                _context.Services.Add(service);
                await _context.SaveChangesAsync();

                return _mapper.Map<ServiceDTO>(service);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        // Cập nhật dịch vụ
        public async Task<bool> UpdateServiceAsync(int id, UpdateServiceDTO dto)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;
            string oldImage= service.Image;

            _mapper.Map(dto, service);


            if (dto.Image != null && dto.Image.Length > 0)
            {

                if (!string.IsNullOrEmpty(oldImage))
                {
                    var oldImagePath = Path.Combine("wwwroot", service.Image.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                }

                var imagePath = await SaveImageAsync(dto.Image, "service");
                service.Image = imagePath;
            }
            else
            {
                service.Image = oldImage;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Xóa dịch vụ
        public async Task<bool> DeleteServiceAsync(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null) return false;

            if (!string.IsNullOrEmpty(service.Image))
            {
                var oldImagePath = Path.Combine("wwwroot", service.Image.TrimStart('/'));
                if (File.Exists(oldImagePath))
                {
                    File.Delete(oldImagePath);
                }
            }

            service.StatusDelete = false;
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
