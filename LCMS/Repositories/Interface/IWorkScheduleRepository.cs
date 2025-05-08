using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IWorkScheduleRepository
    {
        Task<List<WorkSchedule>> GetAllSchedulesAsync(); // Lấy tất cả ca làm việc
        Task<WorkSchedule> GetScheduleByIdAsync(int id); // Lấy ca làm việc theo ID
        Task AddScheduleAsync(WorkSchedule schedule); // Thêm một ca làm việc
        Task UpdateScheduleAsync(WorkSchedule schedule); // Cập nhật thông tin ca làm việc
        Task DeleteScheduleAsync(int id); // Xóa một ca làm việc
    }

}
