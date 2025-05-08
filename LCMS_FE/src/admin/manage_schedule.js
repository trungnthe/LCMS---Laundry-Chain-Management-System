import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;

export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);

   
    setIsAuthenticated(true);
    fetch(`${apiUrl}/api/AdminBooking/get-all-booking`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setScheduleData(data);
        setLoading(false);
      })
      .catch((error) => {
        setErrorMessage("Lỗi khi lấy dữ liệu lịch: " + error.message);
        setLoading(false);
        console.error("Lỗi khi lấy dữ liệu lịch:", error);
      });
  }, []);

  return { scheduleData, loading, errorMessage, isAuthenticated };
};
