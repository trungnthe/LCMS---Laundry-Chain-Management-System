using BusinessObjects.DTO.EmployeeDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface ICustomerRepository
    {
        Task<List<CustomerDTO>> GetAllCustomer();
        Task<CustomerDTO> GetUserByID(int id);
        Task<List<CustomerDTO>> SearchUserByName(string name);
        Task<List<CustomerDTO>> SortCustomersByLoyaltyPoints(bool ascending);
        Task AddLoyaltyPoints(int customerId, int points);
        Task<bool> UpdateCustomerStatus(int accountId, string newStatus);
        Task<int> GetTotalCustomersForManagerBranch();
        Task<List<CustomerDTO>> GetNewCustomersList(int days);
        Task<List<CustomerDTO>> GetTopServiceCustomers(int topCount);
        Task<List<string>> GetAllStatus();
        Task<List<CustomerDTO>> GetTopSpendingCustomersAsync(int topCount, int? branchId = null);
    }
}
