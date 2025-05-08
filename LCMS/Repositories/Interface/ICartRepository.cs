using BusinessObjects.DTO.CartDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface ICartRepository
    {
        Task<bool> ValidateCartItem(CartAddItemDto item);
        CartDto GetCart();
        Task<bool> AddToCart(CartAddItemDto newItem);
        bool RemoveFromCart(int itemId);
        void ClearCart();
        bool UpdateCartItem(int itemId, int quantity);
    }
}
