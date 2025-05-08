using AutoMapper;
using BusinessObjects.DTO.BranchDTO;
using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DataAccess.Dao
{
    public class BranchDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;

        public BranchDao(LcmsContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public static readonly List<string> Statuses = new List<string>
    {
        "Mở Cửa",
        "Không hoạt động",
        "Quá tải"
    };
        public List<string> GetAllStatuses()
        {
            return Statuses;
        }
        public async Task<List<BranchDto>> GetBranchesByRoleIdAsync()
        {
            try
            {
                var branches = await _context.Employees.Include(account => account.Account)
                    .Where(account => account.Account.RoleId == 2)
                    .Include(account => account.Branch) 
                    .Select(account => account.Branch)
                    .Distinct()
                    .ToListAsync();
                var result = _mapper.Map<List<BranchDto>>(branches);

                return result;
            }
            catch (Exception ex)
            {
               
                throw new Exception("Error retrieving branches", ex);
            }
        }



        public async Task<List<BranchDto>> GetAllBranchesAsync()
        {
            var branches = await _context.Branches.AsNoTracking().ToListAsync();
            return _mapper.Map<List<BranchDto>>(branches)
                .Select(branch =>
                {
                    branch.Image = ImageHelper.GetFullImageUrl(branch.Image);
                    return branch;
                }).ToList();
        }

        public async Task<BranchDto?> GetBranchByIdAsync(int id)
        {
            var branch = await _context.Branches.AsNoTracking().FirstOrDefaultAsync(b => b.BranchId == id);
            if (branch == null) return null;

            var result = _mapper.Map<BranchDto>(branch);
            result.Image = ImageHelper.GetFullImageUrl(result.Image);
            return result;
        }

        public async Task<BranchDto> CreateBranchAsync([FromForm] UpdateBranchDto dto)
        {
            var branch = _mapper.Map<Branch>(dto);
            branch.CreatedDate = DateTime.Now;
            branch.LastUpdated = DateTime.Now;

            if (dto.Image != null && dto.Image.Length > 0)
            {
                branch.Image = await SaveImageAsync(dto.Image, null);
            }

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            var result = _mapper.Map<BranchDto>(branch);
            result.Image = ImageHelper.GetFullImageUrl(result.Image);
            return result;
        }

        public async Task<bool> UpdateBranchAsync(int id, [FromForm] UpdateBranchDto dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto), "UpdateBranchDto cannot be null");
            }

            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return false;

            string oldImage = branch.Image;

            _mapper.Map(dto, branch);
            branch.LastUpdated = DateTime.Now;

            if (dto.Image != null && dto.Image.Length > 0)
            {
              
                if (!string.IsNullOrEmpty(oldImage))
                {
                    var oldImagePath = Path.Combine("wwwroot", oldImage.TrimStart('/'));
                    if (File.Exists(oldImagePath))
                    {
                        File.Delete(oldImagePath);
                    }
                }

           
                var imagePath = await SaveImageAsync(dto.Image, "branch");
                branch.Image = imagePath;
            }
            else
            {
               
                branch.Image = oldImage;
            }

            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<bool> DeleteBranchAsync(int id)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return false;

            var bookings = await _context.Bookings
                .Where(b => b.BranchId == id)
                .ToListAsync();

            var hasUnfinishedBookings = bookings
                .Any(b => !b.Status.Equals("Done", StringComparison.OrdinalIgnoreCase));

            if (hasUnfinishedBookings)
            {
                throw new Exception("Không thể vô hiệu hóa chi nhánh khi còn booking chưa hoàn tất.");
            }

            branch.StatusDelete = false;

            var employees = await _context.Employees
                .Where(e => e.BranchId == id)
                .Include(e => e.Account)
                .ToListAsync();

            foreach (var employee in employees)
            {
                employee.Account.Status = "Blocked";
            }

            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<List<BranchDto>> SearchBranchesAsync(string keyword)
        {
            var branches = await _context.Branches
                .Where(x => x.BranchName.Contains(keyword) || x.Address.Contains(keyword) || x.PhoneNumber.Contains(keyword))
                .AsNoTracking()
                .ToListAsync();

            return _mapper.Map<List<BranchDto>>(branches)
                .Select(branch =>
                {
                    branch.Image = ImageHelper.GetFullImageUrl(branch.Image);
                    return branch;
                }).ToList();
        }

        public async Task<int> GetBranchIdByAccountId(int accountId)
        {
            return await _context.Employees
                .Where(e => e.AccountId == accountId)
                .Select(e => e.BranchId)
                .FirstOrDefaultAsync();
        }

        private async Task<string> SaveImageAsync(IFormFile imageFile, string? oldImagePath)
        {
            var uploadsFolder = Path.Combine("wwwroot", "uploads", "branch");
            Directory.CreateDirectory(uploadsFolder);

            if (!string.IsNullOrEmpty(oldImagePath))
            {
                DeleteImage(oldImagePath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            return $"/uploads/branch/{uniqueFileName}";
        }

        private void DeleteImage(string imagePath)
        {
            var fullPath = Path.Combine("wwwroot", imagePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}
