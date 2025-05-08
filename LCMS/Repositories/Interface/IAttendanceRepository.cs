using BusinessObjects.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IAttendanceRepository
    {
        Task<List<Attendance>> CreateAttendanceRecordsAsync(List<Employee> employees, int workScheduleId, DateOnly startDate, DateOnly endDate);
        Task<List<Employee>> GetEmployeesByIdsAsync(List<int> employeeIDs);
        Task<List<Attendance>> GetAttendancesByEmployeeIdAsync(int employeeId, DateOnly startDate, DateOnly endDate);
        Task<List<Attendance>> GetAttendancesInMonthAsync( int year, int month);
        Task<List<Attendance>> GetAttendancesByEmployeeIdInMonthAsync(int employeeId, int year, int month);

        Task<IActionResult> UpdateAttendanceWorkTime(int id);
        Task<IActionResult> CheckInAsync(int id);
        Task<IActionResult> CheckOutAsync(int id);
        Task<Attendance> GetAttendanceById(int id);
        Task<List<Attendance>> GetAttendanceByEmployeeToday(int id);
        Task<List<Attendance>> GetAttendanceByBranchId(int id);
        Task<int?> GetBranchIdByEmployeeId(int employeeId);
        Task<Attendance> GetAttendanceByEmployeeTodayByTime(int id);
        Task<List<Attendance>> GetAllAttendanceByAccountID(int id);
        Task UpdateAttendance(Attendance attendance);



    

    }
}
