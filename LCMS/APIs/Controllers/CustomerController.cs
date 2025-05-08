using BusinessObjects.DTO.CustomerDTO;
using BusinessObjects.DTO.EmployeeDTO;
using BusinessObjects.DTO.EmployeeRoleDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repositories.Interface;
using Repositories.Repository;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
/*    [Authorize(Roles = "Admin,Manager")]*/
    public class CustomerController : ControllerBase
    {
        private ICustomerRepository _customerRepository;
        public CustomerController(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }
        [HttpGet("list-all-Status")]
        public async Task<IActionResult> GetAllStaus()
        {
            var bookings = await _customerRepository.GetAllStatus();
            return Ok(bookings);
        }
        [HttpGet("top-spending-customers")]
        public async Task<IActionResult> GetTopSpendingCustomers([FromQuery] int branchId)
        {
            var result = await _customerRepository.GetTopSpendingCustomersAsync(10, branchId);
            return Ok(result);
        }

        [HttpGet("get-all-customer")]
        
        public async Task<ActionResult<CustomerDTO>> GetAll()
        {
            try
            {
                var accounts = await _customerRepository.GetAllCustomer();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("get-customer-byID")]
        public async Task<ActionResult<CustomerDTO>> GetUserById(int Id)
        {
            try
            {
                var accounts = await _customerRepository.GetUserByID(Id);
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("Search-customer-byName")]
        public async Task<ActionResult<CustomerDTO>> GetUserByName(string name)
        {
            try
            {
                var accounts = await _customerRepository.SearchUserByName(name);
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("sort-customers")]
       
        public async Task<ActionResult<List<CustomerDTO>>> SortCustomers([FromQuery] bool ascending = true)
        {
            try
            {
                var customers = await _customerRepository.SortCustomersByLoyaltyPoints(ascending);
                return Ok(customers);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("update-loyalty")]
 
        public async Task<ActionResult> UpdateLoyaltyPoints([FromBody] UpdateLoyaltyPointDTO request)
        {
            try
            {
                await _customerRepository.AddLoyaltyPoints(request.CustomerId, request.PointsToAdd);
                return Ok("Cập nhật điểm thành công!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        

        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusRequest request)
        {
            try
            {
                bool result = await _customerRepository.UpdateCustomerStatus(request.CustomerId, request.NewStatus);
                if (!result)
                {
                    return NotFound($"Không tìm thấy Account với ID: {request.CustomerId}");
                }

                return Ok("Cập nhật trạng thái thành công!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi hệ thống: {ex.Message}");
            }
        }
        [HttpGet("total-customers")]
        public async Task<ActionResult<int>> GetTotalCustomersForManagerBranch()
        {
            var totalCustomers = await _customerRepository.GetTotalCustomersForManagerBranch();
            return Ok(totalCustomers);
        }
        [HttpGet("new-customers/{days}")]
        public async Task<IActionResult> GetNewCustomersList(int days)
        {
            var customers = await _customerRepository.GetNewCustomersList(days);
            return Ok(customers);
        }

        [HttpGet("top-service-customers/{topCount}")]
        public async Task<ActionResult<List<CustomerDTO>>> GetTopServiceCustomers(int topCount)
        {
            var topCustomers = await _customerRepository.GetTopServiceCustomers(topCount);
            return Ok(topCustomers);
        }





    }
}
