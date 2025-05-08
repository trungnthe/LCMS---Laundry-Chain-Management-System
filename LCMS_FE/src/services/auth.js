import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { fetchWithRefresh, refreshToken } from "./authHelper";

const apiUrl = import.meta.env.VITE_API_URL;

const login = (email, password) => {
  return axios
    .post(
      `${apiUrl}/api/Auth/login`,
      { email, password },
      { withCredentials: true }
    )
    .then((response) => response)
    .catch((err) => err.response);
};

const register = (name, phone, email, password) => {
  return axios
    .post(`${apiUrl}/api/Auth/register`, {
      name,
      phone,
      email,
      password,
    })
    .then((response) => response)
    .catch((error) => (error.response ? error : error));
};

const forgotPassword = (email) => {
  return axios
    .post(`${apiUrl}/api/Auth/forgot-password`, { email })
    .then((response) => response)
    .catch((error) => error);
};

const resendCode = (email) => {
  return axios
    .post(`${apiUrl}/api/Auth/resend-code`, { email })
    .then((response) => response)
    .catch((error) => error);
};

const changePassword = (oldPassword, newPassword) => {
  const token = localStorage.getItem("token");
  return axios
    .post(
      `${apiUrl}/api/Auth/change-password`,
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => response)
    .catch((error) => error || { message: "Lỗi hệ thống" });
};

const resetPassword = (email, newPassword) => {
  return axios
    .post(`${apiUrl}/api/Auth/reset-password`, {
      email,
      newPassword,
    })
    .then((response) => response)
    .catch((err) => err.response);
};

const verifyOTP = (email, code) => {
  return axios
    .post(`${apiUrl}/api/Auth/verify-otp`, { email, code })
    .then((response) => response)
    .catch((err) => err.response);
};

const verifyRegister = (email, code) => {
  return axios
    .post(`${apiUrl}/api/Auth/verify-code`, { email, code })
    .then((response) => response)
    .catch((err) => err.response);
};

const logout = async () => {
  try {
    const response = await axios.post(
      `${apiUrl}/api/Auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      }
    );

    console.log("Logout thành công:", response.data);
  } catch (error) {
    console.error("Lỗi khi logout:", error.response || error);
  }
};

export const getUserFromToken = async () => {
  let token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      console.warn("Access token hết hạn, thử refresh...");
      const newToken = await refreshToken();

      if (!newToken) {
        performLogout();
        return null;
      }

      token = newToken;
    }

    const newDecoded = jwtDecode(token);
    return {
      accountId: newDecoded.AccountId,
      role: newDecoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    };
  } catch (error) {
    console.error("Lỗi giải mã token:", error);
    return null;
  }
};

export const performLogout = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ Không tìm thấy token, chuyển hướng về đăng nhập...");
      localStorage.clear();
      window.location.replace("/login3");
      return;
    }

    const response = await fetch(`${apiUrl}/api/Auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.ok) {
      console.log("✅ Đăng xuất thành công!");
    } else {
      console.error(
        "❌ Logout thất bại:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error("❌ Lỗi khi logout:", error);
  } finally {
    localStorage.clear();
    window.location.replace("/login");
  }
};

export {
  login,
  register,
  forgotPassword,
  changePassword,
  verifyOTP,
  verifyRegister,
  resendCode,
  resetPassword,
  logout,
};
