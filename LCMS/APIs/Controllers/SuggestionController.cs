using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static BusinessObjects.DTO.SuggesstionDTO.SuggestionDTO;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuggestionController : ControllerBase
    {
        private readonly LcmsContext _context;

        public SuggestionController(LcmsContext context)
        {
            _context = context;
        }

        [HttpGet("cart-suggestions/{customerId}")]
        public async Task<IActionResult> GetCartSuggestions(int customerId)
        {
            var validStatuses = new[] { "Completed", "Done", "Delivering", "InProgress" };

            var orderDetails = await _context.Bookings
             .Where(b => b.CustomerId == customerId && validStatuses.Contains(b.Status))
             .SelectMany(b => b.BookingDetails)
             .Where(bd => bd.ProductId != null || bd.ServiceId != null)
             .ToListAsync();

            if (!orderDetails.Any())
            {
                orderDetails = await _context.Bookings
                    .Where(b => b.CustomerId != customerId && validStatuses.Contains(b.Status)) 
                    .SelectMany(b => b.BookingDetails)
                    .Where(bd => bd.ProductId != null || bd.ServiceId != null)
                    .ToListAsync();
            }


            var groupedDetails = orderDetails
                .GroupBy(bd => new { bd.ProductId, bd.ServiceId })
                .OrderByDescending(g => g.Count())
                .Take(5);

            var suggestions = new List<CartSuggestionDto>();

            foreach (var group in groupedDetails)
            {
                var service = await _context.Services
                    .FirstOrDefaultAsync(s => s.ServiceId == group.Key.ServiceId && s.StatusDelete != false);
                if (service == null) continue;

                if (group.Key.ProductId.HasValue)
                {
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p => p.ProductId == group.Key.ProductId && p.StatusDelete != false);

                    if (product != null)
                    {
                        suggestions.Add(new CartSuggestionDto
                        {
                            ProductId = product.ProductId,
                            ProductName = product.ProductName,
                            ProductImage = product.Image,
                            ProductPrice = product.Price,
                            ServiceId = service.ServiceId,
                            ServiceName = service.ServiceName,
                            ServiceImage = service.Image,
                            ServicePrice = service.Price,
                            Quantity = 1
                        });
                    }
                }
                else
                {
                    suggestions.Add(new CartSuggestionDto
                    {
                        ServiceId = service.ServiceId,
                        ServiceName = service.ServiceName,
                        ServiceImage = service.Image,
                        ServicePrice = service.Price
                    });
                }
            }

            return Ok(suggestions);
        }



        [HttpGet("booking-suggestions-popular/{customerId}")]
        public async Task<IActionResult> GetPopularBookingSuggestions(
        int customerId,
        [FromQuery] string? laundryType,
        [FromQuery] string? deliveryType)
        {

            var validStatuses = new[] { "Completed", "Done", "Delivering", "InProgress" };

            var bookings = await _context.Bookings
            .Where(b => b.CustomerId == customerId && validStatuses.Contains(b.Status))
            .ToListAsync();


            if (!bookings.Any())
            {
                return Ok(bookings);
            }

            if (!string.IsNullOrEmpty(laundryType))
            {
                bookings = bookings.Where(b => b.LaundryType == laundryType).ToList();
            }

            if (!string.IsNullOrEmpty(deliveryType))
            {
                bookings = bookings.Where(b => b.DeliveryType == deliveryType).ToList();
            }

            if (!bookings.Any())
            {
                return Ok(bookings);
            }

            var popularDeliveryAddresses = bookings
                .GroupBy(b => b.DeliveryAddress)
                .Where(g => !string.IsNullOrEmpty(g.Key))
                .Select(g => new { Address = g.Key})
                .Take(3)
                .ToList();

            var popularPickupAddresses = bookings
                .GroupBy(b => b.PickupAddress)
                .Where(g => !string.IsNullOrEmpty(g.Key))
                .Select(g => new { Address = g.Key})
                .Take(3)
                .ToList();

            var popularBookingSuggestion = new
            {
                DeliveryAddresses = popularDeliveryAddresses,
                PickupAddresses = popularPickupAddresses
            };

            return Ok(popularBookingSuggestion);
        }



        [HttpGet("products-by-service/{serviceId}/customer/{customerId}")]
        public async Task<IActionResult> GetProductsByServiceAndCustomer(int serviceId, int customerId)
        {
            var validStatuses = new[] { "Completed", "Done", "Delivering", "InProgress" };

            var recentProducts = await _context.BookingDetails
                .Include(bd => bd.Product)
                .Include(bd => bd.Service)
                .Include(bd => bd.Booking)
                .Where(bd => bd.ServiceId == serviceId &&
                 bd.Product != null &&
                 bd.Booking.CustomerId == customerId &&
                 validStatuses.Contains(bd.Booking.Status) &&
                 bd.Product.StatusDelete != false &&
                 bd.Service.StatusDelete != false)
                .ToListAsync();

            if (!recentProducts.Any())
            {
                recentProducts = await _context.BookingDetails
                    .Include(bd => bd.Product)
                    .Include(bd => bd.Service)
                    .Include(bd => bd.Booking)
                    .Where(bd => bd.ServiceId == serviceId &&
                                 bd.Product != null &&
                                 bd.Booking.CustomerId != customerId &&
                                 validStatuses.Contains(bd.Booking.Status) &&
                                 bd.Product.StatusDelete != false &&
                                 bd.Service.StatusDelete != false)
                    .ToListAsync();
            }

            var result = recentProducts
                .GroupBy(bd => bd.ProductId)
                .OrderByDescending(g => g.Count())
                .Select(g => g.First())
                .Take(5)
                .Select(bd => new ProductDto
                {
                    ProductId = bd.ProductId.Value,
                    ProductName = bd.Product.ProductName,
                    ProductImage = bd.Product.Image,
                    ProductPrice = bd.Product.Price,
                    ServiceId = bd.ServiceId,
                    ServiceName = bd.Service.ServiceName,
                    ServiceImage = bd.Service.Image,
                    ServicePrice = bd.Service.Price
                })
                .ToList();

            if (!result.Any())
            {
                result = [];
                return Ok(result);
            }

            return Ok(result);
        }

    }
}
