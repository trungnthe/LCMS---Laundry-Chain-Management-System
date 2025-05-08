using BusinessObjects.DTO.RevenueDTO;
using DataAccess.Dao;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class RevenueRepository : IRevenueRepository
    {
        private readonly RevenueDao revenueDao;

        public RevenueRepository(RevenueDao revenueDao)
        {
            this.revenueDao = revenueDao;
        }


        public async Task<byte[]> ExportFullRevenueReportAsync(DateTime? date)
        {
            if (!date.HasValue || !IsValidDate(date.Value))
            {
                throw new ArgumentException("Ngày tháng không hợp lệ.");
            }

            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var totalRevenueByMonthAndYear = await GetTotalRevenueByMonthAndYearAsync();
            var branchRevenueList = await GetAllBranchRevenueByMonthAndYearAsync(date.Value);
            var customerRevenueList = await GetAllCustomerRevenueByMonthAndYearAsync(date.Value);
            var paymentRevenueList = await GetRevenueByPaymentMethodAsync();

            totalRevenueByMonthAndYear = totalRevenueByMonthAndYear
                .OrderByDescending(x => x.Year)
                .ThenByDescending(x => x.Month)
                .ToList();

            using (var package = new ExcelPackage())
            {
                int row;

                // Sheet 1: Tổng Doanh Thu Theo Tháng
                var totalSheet = package.Workbook.Worksheets.Add("Tổng Doanh Thu Theo Tháng");

                totalSheet.Cells[1, 1].Value = $"Báo Cáo Doanh Thu Tháng {date.Value.Month} Năm {date.Value.Year}";
                totalSheet.Cells[1, 1, 1, 2].Merge = true;
                totalSheet.Cells[1, 1].Style.Font.Bold = true;
                totalSheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                totalSheet.Cells[1, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                totalSheet.Cells[1, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);

                totalSheet.Cells[2, 1].Value = "Tháng";
                totalSheet.Cells[2, 2].Value = "Tổng Doanh Thu";

                row = 3;
                decimal totalRevenueByYear = 0;

                foreach (var monthlyRevenue in totalRevenueByMonthAndYear)
                {
                    totalSheet.Cells[row, 1].Value = monthlyRevenue.Month;
                    totalSheet.Cells[row, 2].Value = monthlyRevenue.TotalRevenue;
                    totalRevenueByYear += monthlyRevenue.TotalRevenue;
                    row++;
                }

                totalSheet.Cells[row, 1].Value = "Tổng Doanh Thu Cả Năm";
                totalSheet.Cells[row, 2].Value = totalRevenueByYear;
                totalSheet.Cells.AutoFitColumns();

                // Sheet 2: Doanh Thu Chi Nhánh
                if (branchRevenueList?.Any() == true)
                {
                    var branchSheet = package.Workbook.Worksheets.Add($"Chi Nhánh {date.Value.Month}/{date.Value.Year}");

                    branchSheet.Cells[1, 1].Value = "Mã Chi Nhánh";
                    branchSheet.Cells[1, 2].Value = "Tên Chi Nhánh";
                    branchSheet.Cells[1, 3].Value = "Tổng Doanh Thu";

                    row = 2;
                    foreach (var branch in branchRevenueList)
                    {
                        branchSheet.Cells[row, 1].Value = branch.BranchID;
                        branchSheet.Cells[row, 2].Value = branch.BranchName;
                        branchSheet.Cells[row, 3].Value = branch.TotalRevenue;
                        row++;
                    }

                    branchSheet.Cells.AutoFitColumns();
                }

                // Sheet 3: Doanh Thu Khách Hàng
                if (customerRevenueList?.Any() == true)
                {
                    var customerSheet = package.Workbook.Worksheets.Add($"Khách Hàng {date.Value.Month}/{date.Value.Year}");

                    customerSheet.Cells[1, 1].Value = "Mã Khách Hàng";
                    customerSheet.Cells[1, 2].Value = "Tên Khách Hàng";
                    customerSheet.Cells[1, 3].Value = "Tổng Doanh Thu";

                    row = 2;
                    foreach (var customer in customerRevenueList)
                    {
                        customerSheet.Cells[row, 1].Value = customer.CustomerID;
                        customerSheet.Cells[row, 2].Value = customer.CustomerName;
                        customerSheet.Cells[row, 3].Value = customer.TotalRevenue;
                        row++;
                    }

                    customerSheet.Cells.AutoFitColumns();
                }

                // Sheet 4: Doanh Thu Theo Phương Thức Thanh Toán
                if (paymentRevenueList?.Any() == true)
                {
                    var paymentSheet = package.Workbook.Worksheets.Add("Thanh Toán");

                    paymentSheet.Cells[1, 1].Value = "Phương Thức Thanh Toán";
                    paymentSheet.Cells[1, 2].Value = "Tổng Doanh Thu";

                    row = 2;
                    foreach (var payment in paymentRevenueList)
                    {
                        paymentSheet.Cells[row, 1].Value = payment.PaymentType;
                        paymentSheet.Cells[row, 2].Value = payment.TotalRevenue;
                        row++;
                    }

                    paymentSheet.Cells.AutoFitColumns();
                }

                return package.GetAsByteArray();
            }
        }







        public async Task<IList<BranchRevenueDTO>> GetAllBranchRevenueByMonthAndYearAsync(DateTime date)
        {
           return  await revenueDao.GetAllBranchRevenueByMonthAndYearAsync(date);
        }


        public async Task<IList<CustomerRevenueDTO>> GetAllCustomerRevenueByMonthAndYearAsync(DateTime date)
        {
            return await revenueDao.GetAllCustomerRevenueByMonthAndYearAsync(date);
        }

        public async Task<BranchRevenueDTO> GetBranchRevenueByMonthAndYearAsync(int branchId, DateTime date)
        {
            return await revenueDao.GetBranchRevenueByMonthAndYearAsync(branchId, date);
        }

        public async Task<CustomerRevenueDTO> GetCustomerRevenueByMonthAndYearAsync(int customerId, DateTime date)
        {
            return await revenueDao.GetCustomerRevenueByMonthAndYearAsync(customerId, date);
        }

        public async Task<IList<PaymentRevenueDTO>> GetRevenueByPaymentMethodAsync()
        {
           return await revenueDao.GetRevenueByPaymentMethodAsync();
        }

        public async Task<IList<ServiceRevenueDTO>> GetAllServiceRevenueByMonthAndYearAsync(DateTime date)
        {
            return await revenueDao.GetAllServiceRevenueByMonthAndYearAsync(date);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await revenueDao.GetTotalRevenueAsync();
        }

        public async Task<IList<MonthlyRevenueDTO>> GetTotalRevenueByMonthAndYearAsync()
        {
         return await revenueDao.GetTotalRevenueByMonthAndYearAsync();
        }

        public async Task<IList<CustomerRevenueDTO>> GetCustomerRevenueByBranchAndMonthAsync(int branchId, DateTime date)
        {
            return await revenueDao.GetCustomerRevenueByBranchAndMonthAsync(branchId, date);
        }

        public bool IsValidDate(DateTime date)
        {
            // Kiểm tra nếu tháng hợp lệ (từ 1 đến 12)
            if (date.Month < 1 || date.Month > 12)
            {
                return false;
            }

            // Kiểm tra nếu ngày hợp lệ trong tháng
            var daysInMonth = DateTime.DaysInMonth(date.Year, date.Month);
            if (date.Day < 1 || date.Day > daysInMonth)
            {
                return false;
            }

            return true;
        }

        public Task<decimal> GetTotalRevenueByBranchAsync(int branchId)
        {
            return revenueDao.GetTotalRevenueByBranchAsync(branchId);
        }

        public Task<IList<ServiceRevenueDTO>> GetServiceRevenueByBranchAndMonthAsync(int branchId, DateTime date)
        {
           return revenueDao.GetServiceRevenueByBranchAndMonthAsync((int)branchId, date);
        }

        public Task<IList<PaymentRevenueDTO>> GetRevenueByPaymentMethodAsync(int? branchId = null)
        {
           return revenueDao.GetRevenueByPaymentMethodAsync((int)branchId);
        }

        public Task<decimal> GetTotalRevenuePackageMonth()
        {
            return revenueDao.GetTotalRevenuePackageMonth();
        }
    }
  

}
