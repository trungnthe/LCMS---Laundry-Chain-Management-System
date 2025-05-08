using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class WorkScheduleRepository : IWorkScheduleRepository
    {
        private readonly WorkScheduleDao _workScheduleDao;

        public WorkScheduleRepository(WorkScheduleDao workScheduleDao)
        {
            _workScheduleDao = workScheduleDao;
        }

        // Thêm một ca làm việc mới
        public async Task AddScheduleAsync(WorkSchedule schedule)
        {
            await _workScheduleDao.AddAsync(schedule);
        }

        // Xóa ca làm việc theo ID
        public async Task DeleteScheduleAsync(int id)
        {
            await _workScheduleDao.DeleteAsync(id);
        }

        // Lấy tất cả các ca làm việc
        public async Task<List<WorkSchedule>> GetAllSchedulesAsync()
        {
            return await _workScheduleDao.GetAllAsync();
        }

        // Lấy ca làm việc theo ID
        public async Task<WorkSchedule> GetScheduleByIdAsync(int id)
        {
            return await _workScheduleDao.GetByIdAsync(id);
        }

        // Cập nhật ca làm việc
        public async Task UpdateScheduleAsync(WorkSchedule schedule)
        {
            await _workScheduleDao.UpdateAsync(schedule);
        }
    }

}
