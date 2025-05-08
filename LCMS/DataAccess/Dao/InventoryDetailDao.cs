using AutoMapper;
using BusinessObjects.DTO.InventoryDetailDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class InventoryDetailDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InventoryDetailDao(LcmsContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }


        public async Task<List<InventoryDetailDTO>> GetAllAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<InventoryDetailDTO>();

            IQueryable<InventoryDetail> query = _context.InventoryDetails.Include(i => i.Inventory);

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDetailDTO>();

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDetailDTO>();

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }

            var result = await query.ToListAsync();
            var re = _mapper.Map<List<InventoryDetailDTO>>(result);
            foreach (var item in re)
            {
              
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
                item.TotalPrice = item.Quantity * item.Price;
            }
            return re;
        }

        public async Task<InventoryDetailDTO> GetByIdAsync(int id)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return null;

            var query = _context.InventoryDetails
                .Include(i => i.Inventory)
                .AsQueryable();

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return null;

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return null;

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }



            var result = await query.FirstOrDefaultAsync(i => i.InventoryDetailId == id);
            var a = _mapper.Map<InventoryDetailDTO>(result);
            a.Image = ImageHelper.GetFullImageUrl(a.Image);

            return a;

        }

        public async Task<bool> CreateAsync(CreateInventoryDetailDTO dto)
        {
            try
            {
                var (accountId, role) = GetCurrentUserClaims();
                if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                    throw new Exception("Không thể xác định tài khoản của bạn.");

                // Kiểm tra quyền truy cập kho
                if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                    role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
                {
                    var managerBranchId = await GetManagerBranchIdAsync(accountId);
                    var inventory = await _context.Inventories.FindAsync(dto.InventoryId);
                    if (inventory == null || !managerBranchId.HasValue || inventory.BranchId != managerBranchId.Value)
                        throw new Exception("Bạn không có quyền thêm vào kho này.");
                }

                // Kiểm tra InventoryDetailName đã tồn tại chưa
                var existingDetail = await _context.InventoryDetails
                    .FirstOrDefaultAsync(d => d.InventoryId == dto.InventoryId && d.ItemName == dto.ItemName);

                if (existingDetail != null)
                {
                    // Nếu đã tồn tại, cập nhật số lượng
                    existingDetail.Quantity += dto.Quantity;
                }
                else
                {
                   
                    var inventoryDetail = _mapper.Map<InventoryDetail>(dto);
                    inventoryDetail.CreateAt=DateTime.Now;

                   
                    if (dto.Image != null && dto.Image.Length > 0)
                    {
                        var uploadsFolder = Path.Combine("wwwroot", "uploads", "inventoryDetail");
                        Directory.CreateDirectory(uploadsFolder); // Đảm bảo thư mục tồn tại

                        var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await dto.Image.CopyToAsync(fileStream);
                        }

                        inventoryDetail.Image = $"/uploads/inventoryDetail/{uniqueFileName}";
                    }

                    await _context.InventoryDetails.AddAsync(inventoryDetail);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<bool> UpdateAsync(int id, CreateInventoryDetailDTO dto)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return false;

            var inventoryDetail = await _context.InventoryDetails
                .Include(i => i.Inventory)
                .FirstOrDefaultAsync(i => i.InventoryDetailId == id);

            if (inventoryDetail == null) return false;
            if (role == "1" || role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                if (inventoryDetail.CreateAt != null &&
     (DateTime.Now - inventoryDetail.CreateAt.Value).TotalDays > 1)
                {
                    throw new Exception("Admin chỉ được cập nhật trong vòng 1 ngày kể từ lúc tạo!");
                }

            }


            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue || inventoryDetail.Inventory.BranchId != managerBranchId.Value)
                    return false;
            }

           
            string oldImagePath = inventoryDetail.Image;

           
            _mapper.Map(dto, inventoryDetail);

        
            inventoryDetail.UpdateBy = int.Parse(accountId);

         
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine("wwwroot", "uploads", "inventoryDetail");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

             
                if (!string.IsNullOrEmpty(oldImagePath))
                {
                    var oldImageFilePath = Path.Combine("wwwroot", oldImagePath.TrimStart('/'));
                    if (File.Exists(oldImageFilePath))
                    {
                        File.Delete(oldImageFilePath);
                    }
                }

            
                var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(fileStream);
                }

          
                inventoryDetail.Image = $"/uploads/inventoryDetail/{uniqueFileName}";
            }
            else
            {
             
                inventoryDetail.Image = oldImagePath;
            }

            await _context.SaveChangesAsync();

         
            await SendNotificationToManager(inventoryDetail.InventoryId, inventoryDetail.Quantity);

            return true;
        }

        private async Task SendNotificationToManager(int inventoryId, int quantityUpdated)
        {
            try
            {
                
                var inventory = await _context.Inventories
                    .Include(i => i.Branch)  
                    .Include(i => i.InventoryDetails) 
                    .FirstOrDefaultAsync(i => i.InventoryId == inventoryId);

                if (inventory == null || inventory.Branch == null || inventory.InventoryDetails == null)
                {
                  
                    return;
                }

            
                var manager = await _context.Accounts
                    .Where(u => u.RoleId == 2 && u.Employee.BranchId == inventory.Branch.BranchId) 
                    .FirstOrDefaultAsync();

                if (manager == null)
                {
                  
                    return;
                }

                var managerId = manager.AccountId;

              
                var updatedByStaffId = inventory.InventoryDetails?.FirstOrDefault()?.UpdateBy;  

             
                var notification = new Notification
                {
                    Title = "Cập nhật sản phẩm trong kho",
                    Content = $"Sản phẩm trong kho đã được cập nhật. Số lượng thay đổi: {quantityUpdated}.",
                    AccountId = managerId,
                    CreatedById = updatedByStaffId.Value,  
                    CreatedAt = DateTime.Now,
                  
                    Type = "Inventory update",
                    IsRead = false
                };

                // Add the notification to the database
                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();

               
            }
            catch (Exception ex)
            {

            }
        }



        public async Task<bool> DeleteAsync(int id)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return false;

            var inventoryDetail = await _context.InventoryDetails
                .Include(i => i.Inventory)
                .FirstOrDefaultAsync(i => i.InventoryDetailId == id);

            if (inventoryDetail == null)
                return false;

         
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue || inventoryDetail.Inventory.BranchId != managerBranchId.Value)
                    return false;
            }

            var now = DateTime.Now;

            if (!inventoryDetail.CreateAt.HasValue)
                return false;

            bool withinOneHourOfCreation = (now - inventoryDetail.CreateAt.Value).TotalMinutes <= 60;
            bool isExpired = inventoryDetail.ExpirationDate.HasValue &&
                             now.Date >= inventoryDetail.ExpirationDate.Value.ToDateTime(TimeOnly.MinValue);

            if (withinOneHourOfCreation)
            {
             
                _context.InventoryDetails.Remove(inventoryDetail);
            }
            else if (isExpired)
            {
               
                inventoryDetail.StatusDelete = false;
            }
            else
            {
             
                return false;
            }

            await _context.SaveChangesAsync();
            return true;
        }




        public async Task<List<InventoryDetailDTO>> FilterByQuantityAsync(int minQuantity, int maxQuantity)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<InventoryDetailDTO>();

            IQueryable<InventoryDetail> query = _context.InventoryDetails
                .Where(item => item.Quantity >= minQuantity && item.Quantity <= maxQuantity);

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDetailDTO>();

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDetailDTO>();

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }

            var result = await query.ToListAsync();
            var re = _mapper.Map<List<InventoryDetailDTO>>(result);
            foreach (var item in re)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }
            return re;
        }

        public async Task<List<InventoryDetailDTO>> SortByPriceAsync(bool ascending)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<InventoryDetailDTO>();

            IQueryable<InventoryDetail> query = _context.InventoryDetails;

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDetailDTO>();

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDetailDTO>();

                query = query.Where(i => i.Inventory.BranchId == managerBranchId.Value);
            }

            query = ascending ? query.OrderBy(i => i.Price) : query.OrderByDescending(i => i.Price);

            var result = await query.ToListAsync();
            var re = _mapper.Map<List<InventoryDetailDTO>>(result);
            foreach (var item in re)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }
            return re;
        }

        private (string accountId, string role) GetCurrentUserClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return (null, null);
            }
            var identity = httpContext.User.Identity as ClaimsIdentity;
            if (identity == null)
            {
                return (null, null);
            }
            var accountId = identity.FindFirst("AccountId")?.Value;
            var role = identity.FindFirst(ClaimTypes.Role)?.Value;
            return (accountId, role);
        }

        private async Task<int?> GetManagerBranchIdAsync(string accountId)
        {
            var manager = await _context.Employees.FirstOrDefaultAsync(e => e.AccountId.ToString() == accountId);
            return manager?.BranchId;
        }
    }
}

