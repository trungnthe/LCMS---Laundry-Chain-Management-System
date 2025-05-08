using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface ISalaryStructureRepository
    {
        Task<List<SalaryStructure>> GetAllSalariesAsync(); // Lấy tất cả cấu trúc lương
        Task<SalaryStructure> GetSalaryByIdAsync(int id); // Lấy cấu trúc lương theo ID
        Task UpdateSalaryAsync(SalaryStructure salary); // Cập nhật thông tin cấu trúc lương
    }

}
