import CryptoJS from "crypto-js";

// Khóa và IV cho AES
const key = "1234567890123456"; // Khóa 16 byte
const iv = "1234567890123456"; // IV 16 byte

export const encryptToShortCode = (inputNumber) => {
  // Chuyển số thành chuỗi
  const plainText = inputNumber.toString();

  // Mã hóa với AES
  const encrypted = CryptoJS.AES.encrypt(
    plainText,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7, // Padding
    }
  );

  // Chuyển đổi kết quả AES sang Base64 (chuỗi mã hóa)
  const encryptedBase64 = encrypted.toString(CryptoJS.format.Base64); // Sử dụng Base64 chuẩn

  // Tạo SHA256 hash từ chuỗi Base64
  const hash = CryptoJS.SHA256(encryptedBase64).toString(CryptoJS.enc.Hex);

  // Trích xuất 5 chữ số từ hash
  const hashValue = Math.abs(parseInt(hash.substring(0, 8), 16)) % 100000;

  // Đảm bảo kết quả có dạng GLN-xxxxx
  return "GLN-" + hashValue.toString().padStart(5, "0");
};
