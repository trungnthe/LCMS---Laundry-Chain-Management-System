using BusinessObjects.DTO.PaymentDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Errors;
using Net.payOS.Types;
using Net.payOS.Utils;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Repositories.Interface;
using Repositories.Repository;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static DataAccess.Dao.BookingDAO;
using DataAccess.Dao;
using BusinessObjects.DTO.LaundrySubscriptionDTO;
using Microsoft.AspNetCore.SignalR;
using BusinessObjects;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly PayOS payOS;
        private readonly IBookingHistory _bookingHistory;
        private readonly ILaundry _laundry;
        private readonly LaundrySubscriptionDao _laundryDao;
        private readonly IHubContext<SignalHub> _hubContext;

        private const string ClientId = "9bb082b6-0ce3-4851-8d2c-5e88291da577";
        private const string ApiKey = "892cc89a-ce8d-4201-b979-c8e6c10f9786";
        private const string ChecksumKey = "ba929c6bbc51fbed29b5adaa9fb029a994acba03343e7249ed7cea823179472f";
        private const string PartnerCode = "195029";

        public PaymentController(IPaymentRepository paymentRepository, IBookingHistory bookingHistory, ILaundry laundry, LaundrySubscriptionDao laundryDao, IHubContext<SignalHub> hubContext)
        {
            payOS = new PayOS(ClientId, ApiKey, ChecksumKey);
            _paymentRepository = paymentRepository;
            _bookingHistory = bookingHistory;
            _laundry = laundry;
            _laundryDao = laundryDao;
            _hubContext = hubContext;
        }
        [HttpPost("createSubscription")]
        public async Task<IActionResult> CreatePaymentForSubscription(string packageName, int currentUserId, string paymentType)
        {
            bool hasActive = await _laundryDao.HasActiveSubscriptionAsync(currentUserId);
            if (hasActive)
            {
                return BadRequest(new { message = "Bạn đã có gói giặt đang hoạt động. Vui lòng sử dụng hết hoặc chờ hết hạn trước khi mua gói mới." });
            }
            var selectedPackage = _laundryDao.GetFixedPackages().FirstOrDefault(x => x.PackageName == packageName);

            if (selectedPackage == null)
            {
                return BadRequest(new { message = "Package not found" });
            }
            int orderCode = int.Parse(DateTime.Now.ToString("MMddHHmmss")) + new Random().Next(10, 99);

            decimal totalPrice = selectedPackage.Price;

            var payment = new Payment
            {
                PackageName = packageName,
                PaymentDate = DateTime.Now,
                AmountPaid = totalPrice,
                PaymentStatus = "Pending",
                Discount = 0,
                TotalPrice = totalPrice,
                Points = 0,
                PaymentType = paymentType,
                CreateBy = currentUserId,
                OrderCode = orderCode,
            };

            var createdPayment = await _paymentRepository.CreatePayment(payment);
            //long orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            switch (paymentType)
            {
                case "QRCode":
                    if (totalPrice <= 0)
                    {
                        return BadRequest(new { message = "Invalid total price for QR payment" });
                    }

                    try
                    {
                        long expiredAt = DateTimeOffset.Now.ToUnixTimeSeconds() + 120;
                        string rawData = $"{PartnerCode}|{payment.PaymentId}|{totalPrice}|{expiredAt}";
                        string signature = GenerateHmacSHA256(rawData, ChecksumKey);

                        var paymentData = new PaymentData(
                    orderCode,
                     (int)totalPrice,
                     "Thanh toán gói tháng",
                     new List<ItemData>(),
                     "http://localhost:5000/api/payment/fail",
                     "http://localhost:5000/api/payment/success1"
                 );

                        var createPayment = await payOS.createPaymentLink(paymentData);

                        return Ok(new
                        {
                            qrUrl = createPayment.checkoutUrl,
                            orderCode = payment.PaymentId
                        });
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new { message = "Failed to create QR payment", error = ex.Message });
                    }

                case "TienMat":
                    createdPayment.PaymentStatus = "Success";
                    await _paymentRepository.UpdatePaymentStatus(createdPayment.PaymentId, "Success");
                    await _laundry.AddAsync(packageName, currentUserId);

                    return Ok(new
                    {
                        AmountPaid = totalPrice,
                        Discount = createdPayment.Discount,
                        TotalPrice = selectedPackage.Price,
                        PaymentType = createdPayment.PaymentType
                    });

                default:
                    return BadRequest(new { message = "Invalid payment type" });
            }
        }

        [HttpGet("success1")]
        public async Task<IActionResult> PaymentSuccess1(int orderCode)
        {
      
            try
            {
                var payment = await _paymentRepository.GetPaymentByIdAsync(orderCode);
                if (payment == null)
                {
                    return BadRequest(new { message = "Payment record not found." });
                }

                // Cập nhật trạng thái thanh toán thành công
                await _paymentRepository.UpdatePaymentStatus(payment.PaymentId, "Success");

                // Thêm gói đăng ký vào hệ thống
                await _laundry.AddAsync(payment.PackageName, payment.CreateBy.Value);

                // Gửi thông báo qua SignalR sau khi thanh toán thành công
                await _hubContext.Clients.All.SendAsync("updatePayment", "newPayment", "Success");
                return Ok(new { message = "Subscription added successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to add subscription", error = ex.Message });
            }
        }
        //[HttpGet("success")]
        //public async Task<IActionResult> PaymentSuccess(int orderCode)
        //{
           
        //    var payment = await _paymentRepository.GetPaymentByIdAsync(orderCode);

        //    if (payment == null)
        //    {
        //        return BadRequest(new { message = "Payment record not found." });
        //    }
        //    await _paymentRepository.ApplySubscriptionToBookingAsync(payment.BookingId.Value);

        //    await _paymentRepository.UpdatePaymentStatus(payment.PaymentId, "Success");
        //    await _paymentRepository.UpdateUserPoints(payment.Points.Value, payment.BookingId.Value);
        //    await _paymentRepository.UpdateCurrentUserMembershipLevel(payment.BookingId.Value);
        //    await _paymentRepository.AddLoyaltyPoints(payment.BookingId.Value);
        //    await _hubContext.Clients.All.SendAsync("updatePayment", "newPayment", "Success");
        //    return Ok(new { message = "Payment successful. Thank you for your purchase!" });

        //}


        public class PaymentSuccessRequest
        {
            public string PackageName { get; set; }
            public int orderCode { get; set; }
        }


        [HttpGet("laundry/{bookingID}")]
        public async Task<ActionResult<List<LaundryDTO>>> GetSubscriptionsByBookingID(int bookingID)
        {
            var subscriptions = await _laundry.GetSubscriptionsByBookingIDc(bookingID);

            if (subscriptions.Count == 0)
            {
                return NotFound(new { message = "No subscriptions found for this booking." });
            }

            return Ok(subscriptions);
        }

        [HttpPost("cancel/{orderId}")]
        public async Task<IActionResult> CancelPaymentLink(long orderId, [FromQuery] string? cancellationReason)
        {
            try
            {

                var paymentLinkInfo = payOS.cancelPaymentLink(orderId, cancellationReason);
                await _paymentRepository.DeletePaymentsByPaymentIdAsync(orderId);

                return Ok(new { message = "Payment link cancelled successfully", data = paymentLinkInfo });
            }
            catch (Exception ex)
            {

                return BadRequest(new { message = "Failed to cancel payment link", error = ex.Message });
            }
        }


        [HttpDelete("deleteByBooking/{bookingId}")]
        public async Task<IActionResult> DeletePaymentsByBookingId(int bookingId)
        {
            try
            {
                await _paymentRepository.DeletePaymentsByBookingIdAsync(bookingId);
                return Ok(new { message = $"All payments for Booking ID {bookingId} have been deleted." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to delete payments.", error = ex.Message });
            }
        }



        [HttpGet("get-points")]
        public async Task<IActionResult> GetUserPoints(int bookingId)
        {
            var points = await _paymentRepository.GetCurrentUserPoints(bookingId);
            return Ok(points);
        }
        [HttpGet("get-PaymentByBooking")]
        public async Task<IActionResult> GetPaymentByBoooking(int bookingId)
        {
            var points = await _paymentRepository.GetPaymentByBookingId(bookingId);
            return Ok(points);
        }

        [HttpGet("get-paymentsuccess-by-bookingId")]
        public async Task<IActionResult> GetPaymentSuccessByBoookingId(int bookingId)
        {
            try
            {
               
                var result = await _paymentRepository.GetSuccessfulPaymentByBookingIdAsync(bookingId);

            
                if (result == null)
                {
                    return Ok(result);
                }

               
                return Ok(result);
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, new { message = "An error occurred while fetching payment data.", error = ex.Message });
            }
        }

        [HttpGet("get-user-membershiplevel")]
        public async Task<IActionResult> GetUserMemberShipLevel(int bookingId)
        {
            var points = await _paymentRepository.GetCurrentUserMembershipLevelAsync(bookingId);
            return Ok(points);
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentDTO paymentDto)
        {
            var booking = await _paymentRepository.GetCompletedBookingAsync(paymentDto.BookingId);
            if (booking == null)
            {
                return BadRequest("Booking is not completed or does not exist.");
            }
            var existingPayment = await _paymentRepository.GetSuccessfulPaymentByBookingIdAsync(paymentDto.BookingId);
            if (existingPayment != null)
            {
                return BadRequest(new { message = "A successful payment already exists for this booking. Cannot create another payment." });
            }
            var pendingPayments = await _paymentRepository.GetPendingPaymentByBookingIdAsync(paymentDto.BookingId);

            if (pendingPayments.Any())
            {
                await _paymentRepository.RemovePendingPaymentsAsync(pendingPayments);
            }


            decimal totalPrice = booking.TotalAmount ?? 0;
            if (totalPrice == 0)
            {
                return BadRequest(new { message = ("Tổng tiền của booking không được bằng 0.") });
            }

            var currentUser = await _paymentRepository.GetCurrentUserAsync(paymentDto.BookingId);
            if (currentUser != null)
            {

                var currentPoints = await _paymentRepository.GetCurrentUserPoints(paymentDto.BookingId);
                if (paymentDto.Points.HasValue && paymentDto.Points.Value > currentPoints)
                {
                    return BadRequest("You do not have enough loyalty points." );
                }



                totalPrice = await _paymentRepository.CalculateBookingDetailPrice(booking);


                string membershipLevel = currentUser.MembershipLevel ?? "Bronze";
                decimal discountRate = membershipLevel switch
                {
                    "Silver" => 0.05m,
                    "Gold" => 0.10m,
                    "Diamond" => 0.15m,
                    _ => 0m
                };

                decimal membershipDiscount = totalPrice * discountRate;
                totalPrice -= membershipDiscount;
                if (paymentDto.Discount.HasValue)
                {
                    totalPrice *= (1 - paymentDto.Discount.Value);
                }


                decimal pointDiscount = paymentDto.Points.Value * 100;
                totalPrice = Math.Max(totalPrice - pointDiscount, 0);

            }


            if (!Enum.TryParse(paymentDto.PaymentType, out PaymentType paymentType))
            {
                return BadRequest(new { message = "Invalid payment type." });
            }
            var currentUserId = User.FindFirst("AccountId")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }
            int orderCode = int.Parse(DateTime.Now.ToString("MMddHHmmss")) + new Random().Next(10, 99);


            var payment = new Payment
            {
                BookingId = paymentDto.BookingId,
                PaymentDate = DateTime.Now,
                AmountPaid = totalPrice,
                PaymentStatus = "Pending",
                Discount = paymentDto.Discount,
                TotalPrice = booking.TotalAmount,
                Points = paymentDto.Points,
                PaymentType = paymentType.ToString(),
                CreateBy = int.Parse(currentUserId),
               OrderCode = orderCode,

           
        };

            var createdPayment = await _paymentRepository.CreatePayment(payment);

            if (totalPrice > 0 && paymentType == PaymentType.QRCode)
            {
                long expiredAt = DateTimeOffset.Now.ToUnixTimeSeconds() + 120;
                string rawData = $"{PartnerCode}|{orderCode}|{totalPrice}|{expiredAt}";
                string signature = GenerateHmacSHA256(rawData, ChecksumKey);
                /*   string status = "Success";
                   payment.PaymentStatus= status;*/

                var paymentData = new PaymentData(
                   orderCode,
                    (int)totalPrice,
                    "Thanh toán giặt là",
                    new List<ItemData>(),
                    "http://localhost:5000/api/payment/fail",
                    "http://localhost:5000/api/payment/success"
                );
                try
                { 
                    var createPayment = await payOS.createPaymentLink(paymentData);



                    return Ok(new { qrUrl = createPayment.checkoutUrl, orderCode = createdPayment.PaymentId });
                }
                catch (Exception ex)
                {
                    var pendingPayments1 = await _paymentRepository.GetPendingPaymentByBookingIdAsync(paymentDto.BookingId);

                    if (pendingPayments.Any())
                    {
                        foreach (var payment1 in pendingPayments1)
                        {
                            payment1.PaymentStatus = "Canceled";
                        }
                        await _paymentRepository.SaveAsync();
                    }
                    await payOS.cancelPaymentLink(payment.PaymentId);
                    return BadRequest(new { message = "Failed to create QR payment", error = ex.Message });
                }
            }
            else if (paymentType == PaymentType.TienMat)
            {
                var updatedPayment = await _paymentRepository.GetPaymentByBookingId(paymentDto.BookingId);

                if (updatedPayment == null)
                {
                    return BadRequest(new { message = "Payment not found for this booking." });
                }

                updatedPayment.PaymentStatus = "Success";
                await _paymentRepository.UpdatePaymentStatus(updatedPayment.PaymentId, updatedPayment.PaymentStatus);
                await _paymentRepository.ApplySubscriptionToBookingAsync(payment.BookingId.Value);

                await _paymentRepository.UpdateCurrentUserMembershipLevel(payment.BookingId.Value);

                await _paymentRepository.UpdateUserPoints(paymentDto.Points.Value, paymentDto.BookingId);

                if(booking.CustomerId != null)
                {
                    await _paymentRepository.AddLoyaltyPoints(payment.BookingId.Value);

                }


                return Ok(new
                {
                    BookingID = createdPayment.BookingId,
                    AmountPaid = totalPrice,
                    Discount = createdPayment.Discount,
                    TotalPrice = booking.TotalAmount,
                    PaymentType = createdPayment.PaymentType
                });
            }


            return BadRequest(new { message = "Unexpected error occurred." });
        }
        [HttpPost("webhook")]
        public async Task<IActionResult> PaymentWebhook([FromBody] PayOSWebhookRequest request)
        {
            var payment = await _paymentRepository.GetPaymentByIdAsync(request.OrderCode);
            if (payment == null)
            {
                return BadRequest(new { message = "Payment record not found." });
            }

            if (request.Status == "PAID")
            {
                await _paymentRepository.UpdatePaymentStatus(request.OrderCode, "Success");
            }

            return Ok(new { message = "Webhook received" });
        }
        [HttpGet("success")]
        public async Task<IActionResult> PaymentSuccess( int orderCode)
        {
            var payment = await _paymentRepository.GetPaymentByIdAsync(orderCode);

            if (payment == null)
            {
                return BadRequest(new { message = "Payment record not found." });
            }
            await _paymentRepository.ApplySubscriptionToBookingAsync(payment.BookingId.Value);

            await _paymentRepository.UpdatePaymentStatus(payment.PaymentId, "Success");
            await _paymentRepository.UpdateUserPoints(payment.Points.Value, payment.BookingId.Value);
            await _paymentRepository.UpdateCurrentUserMembershipLevel(payment.BookingId.Value);
            await _paymentRepository.AddLoyaltyPoints(payment.BookingId.Value);
            await _hubContext.Clients.All.SendAsync("updatePayment", "newPayment", "Success");
            return Ok(new { message = "Payment successful. Thank you for your purchase!" });

        }

        [HttpGet("fail")]
        public async Task<IActionResult> PaymentFail()
        {

            return BadRequest(new { message = "Payment failed. Please try again." });
        }





        private string GenerateHmacSHA256(string data, string key)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
            {
                byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }
    }

    public class PayOSWebhookRequest
    {
        public int OrderCode { get; set; }
        public string Status { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentTime { get; set; }
        public string Checksum { get; set; }
    }
    public class UpdatePaymentStatusDTO
    {
        public int PaymentId { get; set; }
    }
    public class PaymentDataDTO
    {
        public string OrderCode { get; set; }
        public string PackageName { get; set; }
        public double Amount { get; set; }
        public string Signature { get; set; }
    }




}