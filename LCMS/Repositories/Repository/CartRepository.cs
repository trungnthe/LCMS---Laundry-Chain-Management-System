using BusinessObjects.DTO.CartDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class CartRepository : ICartRepository
    {
        private readonly CartDao _cartDao;
        public CartRepository(CartDao cartDao)
        {
            _cartDao = cartDao;
        }

        public async Task<bool> AddToCart(CartAddItemDto newItem)
        {
            return await _cartDao.AddToCart(newItem);
        }

        public void ClearCart()
        {
            _cartDao.ClearCart();
        }

        public CartDto GetCart()
        {
            return (CartDto)_cartDao.GetCart();
        }

        public bool UpdateCartItem(int itemId, int quantity)
        {
            return _cartDao.UpdateCartItem(itemId, quantity);
        }

        public bool RemoveFromCart(int itemId)
        {
            return _cartDao.RemoveFromCart(itemId);
        }

       

        public async Task<bool> ValidateCartItem(CartAddItemDto item)
        {
            return await _cartDao.ValidateCartItem(item);
        }
    }
}
