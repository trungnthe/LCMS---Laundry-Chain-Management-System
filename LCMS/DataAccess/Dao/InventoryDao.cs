using AutoMapper;
using BusinessObjects;
using BusinessObjects.DTO.InventoryDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class InventoryDao
    {
        private readonly LcmsContext _context;
        private IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InventoryDao(LcmsContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task<List<LowStockDTO>> GetLowStockWarningsAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<LowStockDTO>();

            IQueryable<InventoryDetail> query = _context.InventoryDetails
                .Include(d => d.Inventory).ThenInclude(d => d.Branch)
                .Where(d => d.Quantity < 10 && d.Inventory.Status == "Active"); // Chỉ lấy hàng tồn kho thấp

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<LowStockDTO>();

                query = query.Where(d => d.Inventory.BranchId == managerBranchId.Value);
            }

            var result = await query.Select(d => new LowStockDTO
            {
                InventoryID = d.Inventory.InventoryId,
                InventoryName = d.Inventory.InventoryName,
                ItemName = d.ItemName,
                BranchName = d.Inventory.Branch.BranchName,
                Quantity = d.Quantity,
                Status = d.Inventory.Status,
                WarningLevel = d.Quantity < 5 ? "🔴 Nguy cấp" : "🟡 Cảnh báo",
                WarningMessage = d.Quantity < 5
                    ? $" còn rất ít ({d.Quantity} sản phẩm)!"
                    : $" sắp hết hàng ({d.Quantity} sản phẩm)!"
            })
            .OrderBy(d => d.Quantity < 5 ? 0 : 1)  // Nguy cấp (0) lên trước, Cảnh báo (1) xuống sau
            .ThenBy(d => d.Quantity)  // Nếu cùng mức cảnh báo, sắp xếp tăng dần theo số lượng
            .ToListAsync();


            // Gửi tín hiệu cập nhật đến tất cả client sử dụng SignalHub

            return result;
        }
        public async Task<List<InventoryDTO2>> GetAllAsync(int branchId)
        {
            IQueryable<Inventory> query = _context.Inventories
                                                  .Include(i => i.Branch)
                                                  .Include(i => i.InventoryDetails);

            query = query.Where(i => i.BranchId == branchId);

            var result = await query.ToListAsync();
            var mappedResult = _mapper.Map<List<InventoryDTO2>>(result);

            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);
            }

            return mappedResult;
        }







        public async Task<List<InventoryDTO>> GetAllAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<InventoryDTO>();

            IQueryable<Inventory> query = _context.Inventories
                                                  .Include(i => i.Branch)
                                                  .Include(i => i.InventoryDetails); // Thêm chi tiết kho

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<InventoryDTO>();

                query = query.Where(i => i.BranchId == managerBranchId.Value);
            }

            var result = await query.ToListAsync();
            var mappedResult = _mapper.Map<List<InventoryDTO>>(result);

            foreach (var item in mappedResult)
            {
                item.Image = ImageHelper.GetFullImageUrl(item.Image);

                // Cập nhật URL cho ảnh của từng InventoryDetail
                foreach (var detail in item.InventoryDetails)
                {
                    detail.Image = ImageHelper.GetFullImageUrl(detail.Image);
                }
            }

            return mappedResult;
        }




        public async Task<InventoryDTO1> GetByIdAsync(int id)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return null;

            var query = _context.Inventories
                .Include(i => i.Branch)
                .Include(i => i.InventoryDetails)
                .AsQueryable();


            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return null;

                query = query.Where(i => i.BranchId == managerBranchId.Value);
            }

            var result = await query.FirstOrDefaultAsync(i => i.InventoryId == id);
            if (result == null)
                return null;


            var inventoryDto = _mapper.Map<InventoryDTO1>(result);


            inventoryDto.Image = ImageHelper.GetFullImageUrl(inventoryDto.Image);


            inventoryDto.TotalAmount = result.InventoryDetails
                .Sum(d => d.Quantity * d.Price);


            inventoryDto.InventoryDetails = result.InventoryDetails
                .Select(d => new InventoryDetailDTO1
                {
                    InventoryDetailId = d.InventoryDetailId,
                    InventoryId = d.InventoryId,
                    ItemName = d.ItemName,
                    Quantity = d.Quantity,
                    Price = d.Price,
                    ExpirationDate = d.ExpirationDate,
                    TotalPrice = d.Quantity * d.Price, // Tính tổng giá cho từng item
                    Image = ImageHelper.GetFullImageUrl(d.Image) // Cập nhật hình ảnh sản phẩm
                }).ToList();

            return inventoryDto;
        }




        public async Task<bool> CreateAsync(CreateInventoryDTO dto)
        {
            try
            {

                if (dto.BranchId == null || dto.BranchId <= 0)
                    throw new Exception("BranchId không hợp lệ.");


                bool isDuplicate = await _context.Inventories
                    .AnyAsync(i => i.InventoryName == dto.InventoryName && i.BranchId == dto.BranchId);
                if (isDuplicate)
                    throw new Exception("Tên kho đã tồn tại trong chi nhánh này.");


                var inventory = _mapper.Map<Inventory>(dto);


                if (dto.ImageFile != null && dto.ImageFile.Length > 0)
                {
                    var uploadsFolder = Path.Combine("wwwroot", "uploads", "inventory");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}_{dto.ImageFile.FileName}";
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.ImageFile.CopyToAsync(fileStream);
                    }

                    inventory.Image = $"/uploads/inventory/{uniqueFileName}";
                }

                await _context.Inventories.AddAsync(inventory);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }







        public async Task<bool> UpdateAsync(int id, UpdateInventoryDTO dto)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return false;

            var inventory = await _context.Inventories.FindAsync(id);
            if (inventory == null) return false;

            // Kiểm tra quyền của Manager hoặc Staff
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue || inventory.BranchId != managerBranchId.Value)
                    return false;
            }

            // Lưu ảnh cũ để xử lý sau
            string oldImagePath = inventory.Image;

            // Ánh xạ các thuộc tính nhưng không cập nhật ảnh ở đây
            _mapper.Map(dto, inventory);

            // Nếu có ảnh mới thì cập nhật, nếu không thì giữ nguyên ảnh cũ
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine("wwwroot", "uploads", "inventory");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Xóa ảnh cũ nếu tồn tại
                if (!string.IsNullOrEmpty(oldImagePath))
                {
                    var oldImageFilePath = Path.Combine("wwwroot", oldImagePath.TrimStart('/'));
                    if (File.Exists(oldImageFilePath))
                    {
                        File.Delete(oldImageFilePath);
                    }
                }

                // Tạo tên file mới
                var uniqueFileName = $"{Guid.NewGuid()}_{dto.Image.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(fileStream);
                }

                // Gán đường dẫn ảnh mới vào inventory
                inventory.Image = $"/uploads/inventory/{uniqueFileName}";
            }
            else
            {
                // Nếu không có ảnh mới, giữ nguyên ảnh cũ
                inventory.Image = oldImagePath;
            }

            await _context.SaveChangesAsync();
            return true;
        }




        public async Task<bool> DeleteAsync(int id)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return false;

            var inventory = await _context.Inventories
                .Include(i => i.InventoryDetails)
                .FirstOrDefaultAsync(i => i.InventoryId == id);

            if (inventory == null) return false;

            // Kiểm tra quyền chi nhánh
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase) ||
                role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue || inventory.BranchId != managerBranchId.Value)
                    return false;
            }

            var now = DateTime.Now;
            if (!inventory.CreatedDate.HasValue)
                return false;

            bool withinOneHourOfCreation = (now - inventory.CreatedDate.Value).TotalMinutes <= 60;
          

            if (withinOneHourOfCreation)
            {
            
                _context.InventoryDetails.RemoveRange(inventory.InventoryDetails);
                _context.Inventories.Remove(inventory);
            }
            else 
            {
                inventory.StatusDelete = false;
               
                foreach (var detail in inventory.InventoryDetails)
                {
                    detail.StatusDelete = false;
                }
            }
          

            await _context.SaveChangesAsync();
            return true;
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
        public async Task<int?> GetCurrentUserBranchIdAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId))
                throw new Exception("Không thể xác định tài khoản của bạn.");

            if (!int.TryParse(accountId, out int accountIdInt))
                throw new Exception("AccountId không hợp lệ.");

            var branchId = await _context.Employees
                .Where(e => e.AccountId == accountIdInt)
                .Select(e => e.BranchId)
                .FirstOrDefaultAsync();

            if (branchId == 0)
                throw new Exception("Không tìm thấy chi nhánh của bạn.");

            return branchId;
        }



        private async Task<int?> GetManagerBranchIdAsync(string accountId)
        {
            var manager = await _context.Employees.FirstOrDefaultAsync(e => e.AccountId.ToString() == accountId);
            return manager?.BranchId;
        }


        public async Task<bool> DeductInventoryAsync(int itemId, int quantityToDeduct, int employeeId, string note)
        {
            // Tìm sản phẩm trong kho
            var item = await _context.InventoryDetails.FindAsync(itemId);
            if (item == null || item.Quantity < quantityToDeduct)
                return false; // Nếu không tìm thấy sản phẩm hoặc số lượng kho không đủ

            int oldQuantity = item.Quantity;
            item.Quantity -= quantityToDeduct;  // Trừ số lượng kho

            // Lưu lịch sử thay đổi kho
            var history = new InventoryHistory
            {
                ItemId = itemId,
                ChangeType = "Export",
                QuantityChanged = -quantityToDeduct,  // Số lượng trừ đi
                OldQuantity = oldQuantity,
                NewQuantity = item.Quantity,
                EmployeeId = employeeId,
                ChangeDate = DateTime.Now,
                Note = note
            };

            // Thêm lịch sử vào cơ sở dữ liệu
            _context.InventoryHistories.Add(history);

            // Lưu thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();

            // Gửi thông báo cho người quản lý sau khi trừ kho thành công
            await SendManagerNotificationAsync(item, quantityToDeduct, employeeId, note);

            return true;  // Trả về true nếu mọi việc thành công
        }


        private async Task SendManagerNotificationAsync(InventoryDetail item, int quantityDeducted, int employeeId, string note)
        {
            // Lấy thông tin nhân viên thực hiện hành động
            var employee = await _context.Employees
                .Include(e => e.Account) 
                .Include(e => e.Branch)
                .FirstOrDefaultAsync(e => e.AccountId  == employeeId); 
            string employeeName = employee != null ? employee.Account.Name : $"ID: {employeeId}";

            int branchId = employee.BranchId;

            // Lấy manager của chi nhánh (vì mỗi chi nhánh chỉ có 1 manager)
            var manager = await _context.Employees
                .Where(e => e.Account.RoleId == 2 || e.Account.Role.RoleName == "Manager")
                .FirstOrDefaultAsync(e => e.BranchId == branchId);
            var inventory = await _context.Inventories
         .FirstOrDefaultAsync(i => i.InventoryId == item.InventoryId);  // Truy vấn Inventory liên quan đến item
            if (manager != null)
            {
                // Tạo thông báo
                string message = $"Thông báo kho hàng: {employeeName} đã trừ {quantityDeducted} đơn vị của sản phẩm {item.ItemName} (ID: {item.InventoryDetailId}). " +
                                 $"Số lượng mới: {item.Quantity}. Ghi chú: {note}. Lô hàng: {inventory.InventoryName}";

                // Kiểm tra nếu kho còn dưới ngưỡng (ví dụ: 20% của số lượng thường xuyên)
                bool isLowStock = item.Quantity <= 20;  // 20 là ngưỡng cảnh báo cho số lượng tồn kho thấp

                // Tạo thông báo cho quản lý
                var notification = new Notification
                {
                    Title = "Thông báo kho hàng",  // Tiêu đề thông báo
                    Content = message,  // Nội dung thông báo
                    CreatedById = employee.AccountId,  // ID của người tạo thông báo
                    CreatedAt = DateTime.Now,  // Thời gian tạo thông báo
                    IsRead = false,  // Mặc định là chưa đọc
                    AccountId = manager.AccountId,  // Gửi cho manager của chi nhánh
                    Type = "kho hàng"  // Phân loại thông báo
                };

                // Thêm thông báo vào cơ sở dữ liệu
                _context.Notifications.Add(notification);

                // Lưu thay đổi vào cơ sở dữ liệu một lần
                await _context.SaveChangesAsync();
            }
            else
            {
                // Trường hợp không tìm thấy quản lý cho chi nhánh
                Console.Error.WriteLine("Không tìm thấy quản lý cho chi nhánh.");
            }
        }
    } 
    }


    

