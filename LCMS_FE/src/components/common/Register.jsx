import React, { useEffect, useState } from "react";
import "../../assets/css/common/register.css";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/auth";
import Verification from "./Verification";
import LoadingSpinner from "../reuse/LoadingSpinner";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    let formErrors = { name: "", phone: "", email: "", password: "" };
    let isValid = true;

    // Kiểm tra họ tên
    if (!name) {
      formErrors.name = "Vui lòng nhập họ và tên!";
      isValid = false;
    }

    // Kiểm tra số điện thoại
    const phonePattern =
      /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
    if (!phone) {
      formErrors.phone = "Vui lòng nhập số điện thoại!";
      isValid = false;
    } else if (!phonePattern.test(phone)) {
      formErrors.phone = "Số điện thoại không hợp lệ!";
      isValid = false;
    }

    // Kiểm tra email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      formErrors.email = "Vui lòng nhập email!";
      isValid = false;
    } else if (!emailPattern.test(email)) {
      formErrors.email = "Email không hợp lệ!";
      isValid = false;
    }

    // Kiểm tra mật khẩu
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,32}$/;
    if (!password) {
      formErrors.password = "Vui lòng nhập mật khẩu!";
      isValid = false;
    } else if (password.length < 8 || password.length > 32) {
      formErrors.password = "Mật khẩu phải có từ 8 đến 32 ký tự!";
      isValid = false;
    } else if (!passwordPattern.test(password)) {
      formErrors.password =
        "Mật khẩu phải có ít nhất 1 ký tự in hoa, 1 ký tự in thường và 1 chữ số!";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await register(name, phone, email, password);
      if (response.status === 400) {
        setMessage("Email đã được sử dụng, hãy dùng 1 email khác");
      } else if (response.status === 200) {
        setMessage(
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác nhận"
        );
        setLoading(false);
        setIsRegistered(true);
      }
    } catch (error) {
      setMessage("Đăng ký thất bại! Hãy thử lại." + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-form">
          <h1 className="register-title">Đăng Ký</h1>
          <p className="register-subtitle">Tạo tài khoản mới ngay hôm nay!</p>

          <div className="register-input-container">
            <input
              type="text"
              placeholder="Họ và Tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`register-input ${errors.name ? "has-error" : ""}`}
              readOnly={isRegistered}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}{" "}
          </div>

          <div className="register-input-container">
            <input
              type="text"
              placeholder="Số Điện Thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={`register-input ${errors.phone ? "has-error" : ""}`}
              readOnly={isRegistered}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}{" "}
          </div>

          <div className="register-input-container">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`register-input ${errors.email ? "has-error" : ""}`}
              readOnly={isRegistered}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}{" "}
          </div>

          <div className="register-input-container">
            <input
              type="password"
              placeholder="Mật Khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`register-input ${errors.password ? "has-error" : ""}`}
              readOnly={isRegistered}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}{" "}
          </div>

          <h5 className="a-success-message" style={{ paddingTop: "2%" }}>
            {message}
          </h5>

          {message ===
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác nhận" ? (
            <>
              <Verification email={email} funct="verify-register" />
            </>
          ) : (
            <>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <button
                    type="submit"
                    className="register-button"
                    onClick={handleRegister}
                  >
                    Đăng Ký
                  </button>
                  Đã có tài khoản?{" "}
                  <span
                    className="login-link"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <p className="register-text"></p>
      </div>
    </div>
  );
};

export default Register;
