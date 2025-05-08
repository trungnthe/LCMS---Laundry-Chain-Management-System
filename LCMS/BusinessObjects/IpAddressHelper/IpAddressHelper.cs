using System;
using System.Net;
using System.Net.NetworkInformation;
using System.Linq;

public class IpAddressHelper
{
    public string GetLocalIpAddress()
    {
        string ipAddress = string.Empty;

        // Duyệt qua tất cả các card mạng
        foreach (var networkInterface in NetworkInterface.GetAllNetworkInterfaces())
        {
            // Kiểm tra nếu card mạng đang kết nối và hoạt động
            if (networkInterface.OperationalStatus == OperationalStatus.Up)
            {
                // Lấy thông tin IP của card mạng
                var ipProperties = networkInterface.GetIPProperties();

                // Duyệt qua các địa chỉ Unicast (IPv4)
                foreach (var address in ipProperties.UnicastAddresses)
                {
                    // Lọc chỉ địa chỉ IPv4
                    if (address.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    {
                        ipAddress = address.Address.ToString();
                        break;
                    }
                }
            }

            // Nếu đã tìm thấy địa chỉ IP, dừng lại
            if (!string.IsNullOrEmpty(ipAddress))
                break;
        }

        return ipAddress;
    }
}
