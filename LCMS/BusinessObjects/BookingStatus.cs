using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
   
        public enum BookingStatus
    {
        Pending,        // Chờ xác nhận
        Confirmed,      // Đã xác nhận
        Received,       //Nhận được đồ
        Canceled,       // Đã hủy
        Rejected,       // Bị từ chối
        InProgress,     // Đang xử lý
        Completed,      // Hoàn thành khi giặt xong 
        Delivering, // Đang giao hàng
        Done        // Đã nhận hàng 
    }


}
