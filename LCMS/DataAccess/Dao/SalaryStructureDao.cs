using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class SalaryStructureDao
    {
        private readonly LcmsContext _context;

        public SalaryStructureDao(LcmsContext context)
        {
            _context = context;
        }

        public async Task<List<SalaryStructure>> GetAllSalariesAsync()
        {
            return await _context.SalaryStructures.Include(x => x.EmployeeRole).ToListAsync();
        }

        public async Task<SalaryStructure?> GetSalaryByIdAsync(int id)
        {
            return await _context.SalaryStructures
                                 .Include(s => s.EmployeeRole) 
                                 .FirstOrDefaultAsync(s => s.EmployeeRoleId == id);
        }


        public async Task UpdateSalaryAsync(SalaryStructure salary)
        {
            salary.UpdatedAt = DateTime.Now; // Cập nhật thời gian
            _context.Set<SalaryStructure>().Update(salary);
            await _context.SaveChangesAsync();
        }



    }

}
