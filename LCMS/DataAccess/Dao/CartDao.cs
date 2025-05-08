using BusinessObjects.DTO.CartDTO;
using BusinessObjects.DTO.SessionHelper;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class CartDao
    {
        private readonly LcmsContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CartDao(LcmsContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private ISession Session => _httpContextAccessor.HttpContext.Session;

        public async Task<bool> ValidateCartItem(CartAddItemDto item)
        {
            if (item.ServiceId != 0)
            {
                bool serviceExists = await _context.Services.AnyAsync(s => s.ServiceId == item.ServiceId);
                if (!serviceExists) return false;
            }

            if (item.ProductId.HasValue)
            {
                bool productExists = await _context.Products.AnyAsync(p => p.ProductId == item.ProductId);
                if (!productExists) return false;
            }

            return true;
        }

        public CartDto GetCart()
        {
            var cart = Session.GetObjectFromJson<CartDto>("Cart") ?? new CartDto();

            int idCounter = 1;
            foreach (var item in cart.Items)
            {

                item.ServiceName = _context.Services
                    .Where(s => s.ServiceId == item.ServiceId)
                    .Select(s => s.ServiceName)
                    .FirstOrDefault() ?? "Unknown Service";


                if (item.ProductId.HasValue)
                {
                    item.ProductName = _context.Products
                        .Where(p => p.ProductId == item.ProductId.Value)
                        .Select(p => p.ProductName)
                        .FirstOrDefault() ?? "Unknown Product";
                }

                item.ItemId = idCounter++;
            }

            return cart;
        }


        public async Task<bool> AddToCart(CartAddItemDto newItem)
        {
            if (!await ValidateCartItem(newItem)) return false;

            var cart = GetCart();


            var existingItem = cart.Items.FirstOrDefault(i =>
    i.ServiceId == newItem.ServiceId &&
    object.Equals(i.ProductId, newItem.ProductId)
);

            if (existingItem != null && existingItem.ProductId != null)
            {
                existingItem.Quantity = (existingItem.Quantity ?? 0) + (newItem.Quantity ?? 1);
            }else if(existingItem != null && existingItem.ProductId == null)
            {

            }
            else
            {
                cart.Items.Add(new CartItemDto
                {
                    ItemId = cart.Items.Count + 1,
                    ServiceId = newItem.ServiceId,
                    ProductId = newItem.ProductId,
                    Price = newItem.Price,

                    Quantity = newItem.Quantity ?? 0,

                });
            }

            Session.SetObjectAsJson("Cart", cart);

            Console.WriteLine($"Cart After: {Newtonsoft.Json.JsonConvert.SerializeObject(cart)}");

            return true;
        }
        public bool UpdateCartItem(int itemId, int quantity)
        {
            var cart = GetCart();
            var item = cart.Items.FirstOrDefault(i => i.ItemId == itemId);

            var productPrice = _context.Products.FirstOrDefault(_context => _context.ProductId == item.ProductId).Price;


            var servicePrice = _context.Services.FirstOrDefault(_context => _context.ServiceId == item.ServiceId).Price;

            if (item != null)
            {
                if (quantity > 0)
                {
                    item.Quantity = quantity;
                    item.Price = (servicePrice + productPrice) * quantity;
                }
                else
                {
                    cart.Items.Remove(item);
                }

                Session.SetObjectAsJson("Cart", cart);
                return true;
            }

            return false;
        }



        public bool RemoveFromCart(int itemId)
        {
            var cart = GetCart();
            var item = cart.Items.FirstOrDefault(i => i.ItemId == itemId);
            if (item != null)
            {
                cart.Items.Remove(item);
                Session.SetObjectAsJson("Cart", cart);
                return true;
            }
            return false;
        }

        public void ClearCart()
        {
            Session.Remove("Cart");
        }
    }
}
