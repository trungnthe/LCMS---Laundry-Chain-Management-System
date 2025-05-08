using BusinessObjects.DTO.EmployeeDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly CustomerDao _customerDao;
        public CustomerRepository(CustomerDao customerDao)
        {
            _customerDao = customerDao;
        }

        public Task AddLoyaltyPoints(int customerId, int points)
        {
            return _customerDao.AddLoyaltyPoints(customerId, points);
        }

        public Task<List<CustomerDTO>> GetAllCustomer()
        {
           return  _customerDao.GetAllCustomer();
        }

        public Task<List<string>> GetAllStatus()
        {
            return _customerDao.GetAllStatus();
        }

        public Task<List<CustomerDTO>> GetNewCustomersList(int days)
        {
            return _customerDao.GetNewCustomersList(days);
        }

       

        public Task<List<CustomerDTO>> GetTopServiceCustomers(int topCount)
        {
           return _customerDao.GetTopServiceCustomers(topCount);
        }

        public Task<List<CustomerDTO>> GetTopSpendingCustomersAsync(int topCount, int? branchId = null)
        {
            return _customerDao.GetTopSpendingCustomersAsync(topCount, branchId);
        }

        public Task<int> GetTotalCustomersForManagerBranch()
        {
            return _customerDao.GetTotalCustomersForManagerBranch();
        }

        public Task<CustomerDTO> GetUserByID(int id)
        {
            return _customerDao.GetUserByID(id);
        }

        public Task<List<CustomerDTO>> SearchUserByName(string name)
        {
            return _customerDao.SearchUserByName(name);
        }

        public Task<List<CustomerDTO>> SortCustomersByLoyaltyPoints(bool ascending)
        {
            return _customerDao.SortCustomersByLoyaltyPoints(ascending);
        }

        public Task<bool> UpdateCustomerStatus(int accountId, string newStatus)
        {
           return _customerDao.UpdateCustomerStatus(accountId, newStatus);
        }

       
    }
}
