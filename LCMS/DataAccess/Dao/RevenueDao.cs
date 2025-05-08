using BusinessObjects.DTO.RevenueDTO;
using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class RevenueDao
    {
        private readonly LcmsContext _context;

        public RevenueDao(LcmsContext context)
        {
            _context = context;
        }

        // Lấy tổng doanh thu cho admin
        public async Task<decimal> GetTotalRevenueAsync()
        {
            var totalRevenue = await _context.Payments
                .Where(p => p.PaymentStatus == "Success") 
                .SumAsync(p => p.AmountPaid); 

            return totalRevenue;
        }
        public async Task<decimal> GetTotalRevenueByBranchAsync(int branchId)
        {
            var totalRevenue = await _context.Payments.Include(x=>x.Booking)
                .Where(p => p.PaymentStatus == "Success" && p.Booking.BranchId == branchId)
                .SumAsync(p => p.AmountPaid);

           


            return totalRevenue;
        }
        public async Task<decimal> GetTotalRevenuePackageMonth()
        {
            var totalRevenue = await _context.Payments.Include(x => x.Booking)
                .Where(p => p.PaymentStatus == "Success" && p.BookingId==null)
                .SumAsync(p => p.AmountPaid);




            return totalRevenue;
        }



        public async Task<IList<MonthlyRevenueDTO>> GetTotalRevenueByMonthAndYearAsync()
        {
            var monthlyRevenue = await _context.Payments
                .Where(p => p.PaymentStatus == "Success" && p.Booking != null && p.Booking.BookingDate != null) // Ensure BookingDate is not null
                .GroupBy(p => new { p.Booking.BookingDate.Year, p.Booking.BookingDate.Month }) // Use Value to avoid nulls
                .Select(g => new MonthlyRevenueDTO
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalRevenue = g.Sum(p => p.AmountPaid)
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return monthlyRevenue;
        }




        public async Task<BranchRevenueDTO> GetBranchRevenueByMonthAndYearAsync(int branchId, DateTime date)
        {
            var branchData = await (from payment in _context.Payments
                                    where payment.PaymentStatus == "Success"
                                          && payment.Booking.BranchId == branchId
                                          && payment.Booking.BookingDate.Year == date.Year
                                          && payment.Booking.BookingDate.Month == date.Month
                                    group payment by new
                                    {
                                        payment.Booking.BranchId,
                                        payment.Booking.Branch.BranchName,
                                        payment.Booking.BookingDate.Month,
                                        payment.Booking.BookingDate.Year
                                    } into g
                                    select new BranchRevenueDTO
                                    {
                                        BranchID = g.Key.BranchId,
                                        BranchName = g.Key.BranchName,
                                        Month = g.Key.Month,
                                        Year = g.Key.Year,
                                        TotalRevenue = g.Sum(p => p.AmountPaid) // Tính tổng trực tiếp trên AmountPaid
                                    }).FirstOrDefaultAsync();

            return branchData;
        }




        // lấy doanh thu của các chi nhánh cho admin
        public async Task<IList<BranchRevenueDTO>> GetAllBranchRevenueByMonthAndYearAsync(DateTime date)
        {
            var branchRevenue = await (from payment in _context.Payments
                                       where payment.PaymentStatus == "Success"
                                             && payment.Booking.BookingDate.Year == date.Year
                                             && payment.Booking.BookingDate.Month == date.Month
                                       group payment by new
                                       {
                                           payment.Booking.BranchId,
                                           payment.Booking.Branch.BranchName,
                                           payment.Booking.BookingDate.Year,
                                           payment.Booking.BookingDate.Month
                                       } into g
                                       select new BranchRevenueDTO
                                       {
                                           BranchID = g.Key.BranchId,
                                           BranchName = g.Key.BranchName,
                                           Year = g.Key.Year,
                                           Month = g.Key.Month,
                                           TotalRevenue = g.Sum(p => p.AmountPaid)
                                       }).ToListAsync();

            return branchRevenue;
        }



        //Lấy doanh thu của các dịch vụ theo tháng và ngày cho admin
        public async Task<IList<ServiceRevenueDTO>> GetAllServiceRevenueByMonthAndYearAsync(DateTime date)
        {
            // Step 1: Compute total booking price per BookingId
            var totalBookingPricesQuery = from bd in _context.BookingDetails
                                          join book in _context.Bookings on bd.BookingId equals book.BookingId
                                          where book.BookingDate.Year == date.Year && book.BookingDate.Month == date.Month
                                          group bd by bd.BookingId into g
                                          select new
                                          {
                                              BookingId = g.Key,
                                              TotalPrice = g.Sum(d => (decimal?)d.Price) ?? 0m
                                          };

            // Step 2: Compute service revenue
            var serviceRevenueQuery = from bd in _context.BookingDetails
                                      join book in _context.Bookings on bd.BookingId equals book.BookingId
                                      join s in _context.Services on bd.ServiceId equals s.ServiceId
                                      join st in _context.ServiceTypes on s.ServiceTypeId equals st.ServiceTypeId
                                      join pay in _context.Payments on book.BookingId equals pay.BookingId
                                      join total in totalBookingPricesQuery on book.BookingId equals total.BookingId
                                      where pay.PaymentStatus == "Success"
                                            && book.BookingDate.Year == date.Year
                                            && book.BookingDate.Month == date.Month
                                      let serviceRatio = total.TotalPrice > 0 ? (bd.Price.GetValueOrDefault() / total.TotalPrice) : 0
                                      let allocatedRevenue = serviceRatio * pay.AmountPaid
                                      group new { bd, allocatedRevenue } by new
                                      {
                                          st.ServiceTypeName,
                                          s.ServiceName,
                                          book.BookingDate.Year,
                                          book.BookingDate.Month
                                      } into g
                                      select new ServiceRevenueDTO
                                      {
                                          ServiceName = g.Key.ServiceName,
                                          ServiceType = g.Key.ServiceTypeName,
                                          Year = g.Key.Year,
                                          Month = g.Key.Month,
                                          TotalRevenue = g.Sum(x => x.allocatedRevenue)
                                      };

            return await serviceRevenueQuery.ToListAsync();
        }



        public async Task<IList<ServiceRevenueDTO>> GetServiceRevenueByBranchAndMonthAsync(int branchId, DateTime date)
        {
            // Step 1: Compute total price per booking first
            var totalBookingPricesQuery = from bd in _context.BookingDetails
                                          join book in _context.Bookings on bd.BookingId equals book.BookingId
                                          where book.BranchId == branchId
                                                && book.BookingDate.Year == date.Year
                                                && book.BookingDate.Month == date.Month
                                          group bd by bd.BookingId into g
                                          select new
                                          {
                                              BookingId = g.Key,
                                              TotalPrice = g.Sum(d => (decimal?)d.Price) ?? 0m
                                          };

            // Step 2: Compute service revenue by branch and month
            var serviceRevenueQuery = from bd in _context.BookingDetails
                                      join book in _context.Bookings on bd.BookingId equals book.BookingId
                                      join s in _context.Services on bd.ServiceId equals s.ServiceId
                                      join st in _context.ServiceTypes on s.ServiceTypeId equals st.ServiceTypeId
                                      join pay in _context.Payments on book.BookingId equals pay.BookingId
                                      join total in totalBookingPricesQuery on book.BookingId equals total.BookingId
                                      where book.BranchId == branchId
                                            && pay.PaymentStatus == "Success"
                                            && book.BookingDate.Year == date.Year
                                            && book.BookingDate.Month == date.Month
                                      let serviceRatio = total.TotalPrice > 0 ? (bd.Price.GetValueOrDefault() / total.TotalPrice) : 0
                                      let allocatedRevenue = serviceRatio * pay.AmountPaid
                                      group allocatedRevenue by new
                                      {
                                          st.ServiceTypeName,
                                          s.ServiceName,
                                          book.BookingDate.Year,
                                          book.BookingDate.Month
                                      } into g
                                      select new ServiceRevenueDTO
                                      {
                                          ServiceName = g.Key.ServiceName,
                                          ServiceType = g.Key.ServiceTypeName,
                                          Year = g.Key.Year,
                                          Month = g.Key.Month,
                                          TotalRevenue = g.Sum(x => x) // ✅ FIX: Now summing `allocatedRevenue`
                                      };

            return await serviceRevenueQuery.ToListAsync();
        }








        // Lấy doanh thu của một khách hàng chỉ định cho admin
        public async Task<CustomerRevenueDTO> GetCustomerRevenueByMonthAndYearAsync(int customerId, DateTime date)
        {
            var customerRevenue = await (from payment in _context.Payments
                                         where payment.PaymentStatus == "Success"
                                               && payment.Booking.CustomerId == customerId
                                               && payment.Booking.BookingDate.Year == date.Year
                                               && payment.Booking.BookingDate.Month == date.Month
                                         group payment by new
                                         {
                                             payment.Booking.CustomerId,
                                             payment.Booking.Customer.Account.Name,
                                             payment.Booking.BookingDate.Year,
                                             payment.Booking.BookingDate.Month
                                         } into g
                                         select new CustomerRevenueDTO
                                         {
                                             CustomerID = g.Key.CustomerId.Value,
                                             CustomerName = g.Key.Name,
                                             Year = g.Key.Year,
                                             Month = g.Key.Month,
                                             TotalRevenue = g.Sum(p => p.AmountPaid)
                                         }).FirstOrDefaultAsync();

            return customerRevenue;
        }




        // Lấy doanh thu của các khách hàng cho admin
        public async Task<IList<CustomerRevenueDTO>> GetAllCustomerRevenueByMonthAndYearAsync(DateTime date)
        {
            var customerRevenue = await (from payment in _context.Payments
                                         where payment.PaymentStatus == "Success"
                                               && payment.Booking.BookingDate.Year == date.Year
                                               && payment.Booking.BookingDate.Month == date.Month
                                         group payment by new
                                         {
                                             payment.Booking.CustomerId,
                                             payment.Booking.Customer.Account.Name,
                                             payment.Booking.BookingDate.Year,
                                             payment.Booking.BookingDate.Month
                                         } into g
                                         select new CustomerRevenueDTO
                                         {
                                             CustomerID = g.Key.CustomerId.Value,
                                             CustomerName = g.Key.Name,
                                             Year = g.Key.Year,
                                             Month = g.Key.Month,
                                             TotalRevenue = g.Sum(p => p.AmountPaid)
                                         }).ToListAsync();

            return customerRevenue;
        }



        // Lấy doanh thu của các phương thức thanh toán cho admin
        public async Task<IList<PaymentRevenueDTO>> GetRevenueByPaymentMethodAsync()
        {
            var paymentRevenue = await (from book in _context.Payments
                                        where book.PaymentStatus == "Success"
                                        group book by book.PaymentType into g 
                                        select new PaymentRevenueDTO
                                        {
                                            PaymentType = g.Key, 
                                            TotalRevenue = g.Sum(b => b.AmountPaid) 
                                        }).ToListAsync();

            return paymentRevenue;
        }
        public async Task<IList<PaymentRevenueDTO>> GetRevenueByPaymentMethodAsync(int? branchId = null)
        {
            var query = from pay in _context.Payments
                        join book in _context.Bookings on pay.BookingId equals book.BookingId
                        where pay.PaymentStatus == "Success"
                        select new
                        {
                            book.BranchId,
                            pay.PaymentType,
                            pay.AmountPaid
                        };

            // Nếu có branchId, lọc theo chi nhánh
            if (branchId.HasValue)
            {
                query = query.Where(x => x.BranchId == branchId.Value);
            }

            var result = await query
                .GroupBy(x => x.PaymentType)
                .Select(g => new PaymentRevenueDTO
                {
                    PaymentType = g.Key,
                    TotalRevenue = g.Sum(x => x.AmountPaid)
                })
                .ToListAsync();

            return result;
        }




        //Lấy doanh thu của khách hàng theo branch cho admin và manager
        public async Task<IList<CustomerRevenueDTO>> GetCustomerRevenueByBranchAndMonthAsync(int branchId, DateTime date)
        {
            var customerRevenue = await (from payment in _context.Payments
                                         where payment.PaymentStatus == "Success"
                                               && payment.Booking.BranchId == branchId
                                               && payment.Booking.BookingDate.Year == date.Year
                                               && payment.Booking.BookingDate.Month == date.Month
                                         group payment by new
                                         {
                                             payment.Booking.CustomerId,
                                             payment.Booking.Customer.Account.Name,
                                             payment.Booking.BookingDate.Year,
                                             payment.Booking.BookingDate.Month
                                         } into g
                                         select new CustomerRevenueDTO
                                         {
                                             CustomerID = g.Key.CustomerId.Value,
                                             CustomerName = g.Key.Name,
                                             Month = g.Key.Month,
                                             Year = g.Key.Year,
                                             TotalRevenue = g.Sum(p => p.AmountPaid) // Tính tổng tiền trực tiếp
                                         }).ToListAsync();

            return customerRevenue;
        }


    }



}

