using BusinessObjects.DTO.BranchDTO;
using BusinessObjects.Models;
using Org.BouncyCastle.Tsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IBranchRepository
    {
        List<string> GetAllStatuses();
        Task<List<BranchDto>> GetAllBranchesAsync();
        Task<BranchDto?> GetBranchByIdAsync(int id);
        Task<BranchDto> CreateBranchAsync(UpdateBranchDto dto);
        Task<bool> UpdateBranchAsync(int id, UpdateBranchDto dto);
        Task<bool> DeleteBranchAsync(int id);
        Task<List<BranchDto>> SearchBranchesAsync(string keyword);
        Task<int> GetBranchIdByAccountId(int accountId);
        Task<List<BranchDto>> GetBranchesByRoleIdAsync();

    }
}
