using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class WorkScheduleDao
    {
        private readonly LcmsContext _context;

        public WorkScheduleDao(LcmsContext context)
        {
            _context = context;
        }



        public async Task AddAsync(WorkSchedule schedule)
        {
            await _context.WorkSchedules.AddAsync(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var schedule = await _context.WorkSchedules.FindAsync(id);
            if (schedule != null)
            {
                _context.WorkSchedules.Remove(schedule);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<WorkSchedule>> GetAllAsync()
        {
            return await _context.WorkSchedules.ToListAsync();
        }

        public async Task<WorkSchedule> GetByIdAsync(int id)
        {
            return await _context.WorkSchedules.FindAsync(id);
        }

        public async Task UpdateAsync(WorkSchedule schedule)
        {
            _context.WorkSchedules.Update(schedule);
            await _context.SaveChangesAsync();
        }
    }



}
