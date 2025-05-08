using BusinessObjects.DTO.BranchDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;

namespace Repositories.Repository
{
    public class BranchRepository : IBranchRepository
    {
        private readonly BranchDao _branchDao;
        public BranchRepository(BranchDao branchDao)
        {
            _branchDao = branchDao;
        }

        public Task<BranchDto> CreateBranchAsync(UpdateBranchDto dto)
        {
            return _branchDao.CreateBranchAsync(dto);
        }

        public Task<bool> DeleteBranchAsync(int id)
        {
            return _branchDao.DeleteBranchAsync(id);
        }

        public Task<List<BranchDto>> GetAllBranchesAsync()
        {
           return _branchDao.GetAllBranchesAsync();
        }

        public List<string> GetAllStatuses()
        {
            return _branchDao.GetAllStatuses();
        }

        public Task<BranchDto?> GetBranchByIdAsync(int id)
        {
            return _branchDao.GetBranchByIdAsync(id);
        }

        public Task<List<BranchDto>> GetBranchesByRoleIdAsync()
        {
           return _branchDao.GetBranchesByRoleIdAsync();
        }

        public Task<int> GetBranchIdByAccountId(int accountId)
        {
            return _branchDao.GetBranchIdByAccountId((int)accountId);
        }

        public Task<List<BranchDto>> SearchBranchesAsync(string keyword)
        {
            return _branchDao.SearchBranchesAsync(keyword);
        }

        public Task<bool> UpdateBranchAsync(int id, UpdateBranchDto dto)
        {
            return _branchDao.UpdateBranchAsync(id, dto);
        }

    }
}
