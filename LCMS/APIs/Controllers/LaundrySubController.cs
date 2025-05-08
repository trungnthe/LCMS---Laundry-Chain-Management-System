using BusinessObjects.DTO.LaundrySubscriptionDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LaundrySubController : ControllerBase
    {
        private readonly ILaundry _laundrySubscriptionDao;
        public LaundrySubController(ILaundry laundrySubscriptionDao)
        {
            _laundrySubscriptionDao = laundrySubscriptionDao;
        }
        [HttpPost]
        public async Task<IActionResult> Add(string packageName)
        {
            var currentUserId = User.FindFirst("AccountId")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {

                return Unauthorized("User not logged in");
            }

            var subscriptionId = await _laundrySubscriptionDao.AddAsync(packageName, int.Parse(currentUserId));

            return Ok( new { id = subscriptionId });
        }
        [HttpPost("Add-Sub-By-Staff")]
        public async Task<IActionResult> AddSubByStaff(string packageName, int accountid)
        {
         
            var subscriptionId = await _laundrySubscriptionDao.AddSubByStaff(packageName, accountid);

            return Ok(new { id = subscriptionId });
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var subscriptions = await _laundrySubscriptionDao.GetAllSubscriptionsAsync();
            if (subscriptions == null || subscriptions.Count == 0)
            {
                return NotFound("No subscriptions found.");
            }

            return Ok(subscriptions);
        }


        [HttpGet("get-all-by-account/{accountId}")]
        public async Task<IActionResult> GetAllByAccountId(int accountId)
        {
            var subscriptions = await _laundrySubscriptionDao.GetAllSubscriptionsByAccountIdAsync(accountId);
            if (subscriptions == null || subscriptions.Count == 0)
            {
                return NotFound($"No subscriptions found for account ID {accountId}.");
            }

            return Ok(subscriptions);
        }

        [HttpGet("get-by-account/{accountId}")]
        public async Task<IActionResult> GetByAccountId(int accountId)
        {
            var subscriptions = await _laundrySubscriptionDao.GetSubscriptionByAccountIdAsync(accountId);
            if (subscriptions == null )
            {
                return NotFound($"No subscriptions found for account ID {accountId}.");
            }

            return Ok(subscriptions);
        }
        [HttpGet("packages")]
        public IActionResult GetPackageNames()
        {
            var packageNames = _laundrySubscriptionDao.GetPackageNames();
            return Ok(packageNames);
        }
     
    }
}

