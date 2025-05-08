// services/time.js

export const getCurrentFormattedTime = () => {
    const now = new Date();
    
    // Lấy phần ngày tháng năm
    const datePart = now.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  
    // Lấy phần giờ phút giây
    const timePart = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  
    return `${datePart}, ${timePart}`;
  };
  export const getCurrentDate = () => {
    return new Date().toLocaleDateString("vi-VN", {
      weekday: "long", // Thứ Hai, Thứ Ba...
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  
  export const getCurrentTime = () => {
    return new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  