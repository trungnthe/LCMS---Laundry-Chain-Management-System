using BusinessObjects.DTO.RevenueDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IRevenueRepository
    {
        Task<decimal> GetTotalRevenueAsync();
        Task<BranchRevenueDTO> GetBranchRevenueByMonthAndYearAsync(int branchId, DateTime date);

        Task<IList<BranchRevenueDTO>> GetAllBranchRevenueByMonthAndYearAsync(DateTime date);

        Task<IList<ServiceRevenueDTO>> GetAllServiceRevenueByMonthAndYearAsync(DateTime date);

        Task<CustomerRevenueDTO> GetCustomerRevenueByMonthAndYearAsync(int customerId, DateTime date);

        Task<IList<CustomerRevenueDTO>> GetAllCustomerRevenueByMonthAndYearAsync(DateTime date);

        Task<IList<PaymentRevenueDTO>> GetRevenueByPaymentMethodAsync();


        Task<IList<MonthlyRevenueDTO>> GetTotalRevenueByMonthAndYearAsync();

        Task<IList<CustomerRevenueDTO>> GetCustomerRevenueByBranchAndMonthAsync(int branchId, DateTime date);
        Task<byte[]> ExportFullRevenueReportAsync(DateTime? date);
        Task<decimal> GetTotalRevenueByBranchAsync(int branchId);
        Task<IList<ServiceRevenueDTO>> GetServiceRevenueByBranchAndMonthAsync(int branchId, DateTime date);
        Task<IList<PaymentRevenueDTO>> GetRevenueByPaymentMethodAsync(int? branchId = null);
        Task<decimal> GetTotalRevenuePackageMonth();

    }
}
