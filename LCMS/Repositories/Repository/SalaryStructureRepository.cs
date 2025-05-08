using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    using DataAccess.Dao;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using BusinessObjects.Models;

    namespace Repositories.Repository
    {
        public class SalaryStructureRepository : ISalaryStructureRepository
        {
            private readonly SalaryStructureDao _salaryStructureDao;

            public SalaryStructureRepository(SalaryStructureDao salaryStructureDao)
            {
                _salaryStructureDao = salaryStructureDao;
            }

            public async Task<List<SalaryStructure>> GetAllSalariesAsync()
            {
                return await _salaryStructureDao.GetAllSalariesAsync();
            }

            public async Task<SalaryStructure> GetSalaryByIdAsync(int id)
            {
                return await _salaryStructureDao.GetSalaryByIdAsync(id);
            }
 

            public async Task UpdateSalaryAsync(SalaryStructure updatedSalary)
            {
                await _salaryStructureDao.UpdateSalaryAsync(updatedSalary);
            }

        
        }
    }


}
