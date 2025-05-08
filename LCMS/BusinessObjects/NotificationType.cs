using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.ComponentModel;

    public class NotificationType
    {
        public enum NotificationType1
        {
            [Description("đơn hàng")]
            DonHang,

            [Description("hỗ trợ")]
            HoTro,

            [Description("thông báo")]
            ThongBao
        }
    }

}
