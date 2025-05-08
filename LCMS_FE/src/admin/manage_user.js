import { useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode";

export const useUserData = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwt_decode(token);
    } catch (error) {
      setErrorMessage("Token không hợp lệ. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      setErrorMessage("Token hết hạn. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    const fetchTotalCustomers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/Customer/total-customers`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Lỗi khi lấy tổng số khách hàng.");
        }

        const data = await response.json();
        setTotalCustomers(data.total || data); // Nếu dữ liệu là số
      } catch (error) {
        setErrorMessage("Lỗi khi lấy tổng số khách hàng: " + error.message);
        console.error("Lỗi khi lấy tổng số khách hàng:", error);
      }
    };

    // Fetch danh sách người dùng
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/Customer/get-all-customer`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu người dùng.");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setErrorMessage("Lỗi khi lấy dữ liệu người dùng: " + error.message);
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalCustomers();
    fetchUsers();
  }, [apiUrl]);

  return { users, loading, errorMessage, isAuthenticated, totalCustomers };
};
