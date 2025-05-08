using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

public class AesEncryptionHelper
{
    private static readonly string key = "1234567890123456";  // Đảm bảo khóa có độ dài hợp lệ (16 byte cho AES-128)
    private static readonly string iv = "1234567890123456";   // IV phải có độ dài hợp lệ (16 byte cho AES)

    public static string EncryptToShortCode(string plainText)
    {
        using (Aes aesAlg = Aes.Create())
        {
            // Thiết lập khóa và IV từ chuỗi, đảm bảo độ dài hợp lệ cho AES
            aesAlg.Key = Encoding.UTF8.GetBytes(key);
            aesAlg.IV = Encoding.UTF8.GetBytes(iv);

            ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

            using (MemoryStream msEncrypt = new MemoryStream())
            {
                using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                {
                    using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }
                }

                // Lấy chuỗi mã hóa và chuyển đổi sang base64
                string encryptedBase64 = Convert.ToBase64String(msEncrypt.ToArray());

                // Sử dụng SHA256 để tạo hash và lấy một phần của hash
                using (SHA256 sha256 = SHA256.Create())
                {
                    byte[] hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(encryptedBase64));

                    // Lấy 5 chữ số đầu tiên từ hash (chuyển thành số và đảm bảo là 5 chữ số)
                    int hashValue = Math.Abs(BitConverter.ToInt32(hashBytes, 0)) % 100000; // Dùng % 100000 để có tối đa 5 chữ số

                    // Đảm bảo kết quả có dạng #13243
                    return "GLN-" + hashValue.ToString("D5");
                }
            }
        }
    }
}
