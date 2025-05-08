using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public static class ImageHelper
    {
        private static IConfiguration? _configuration;

        public static void Configure(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public static string GetFullImageUrl(string? imagePath)
        {
            if (!string.IsNullOrEmpty(imagePath) && _configuration != null)
            {
                string baseUrl = _configuration["AppSettings:BaseUrl"] ?? "http://localhost:5000";
                return $"{baseUrl}{imagePath}";
            }
            return null;
        }
    }

}
