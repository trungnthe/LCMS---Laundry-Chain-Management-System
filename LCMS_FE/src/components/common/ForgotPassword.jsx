import React, { useEffect, useState } from "react";
import { forgotPassword } from "../../services/auth";
import Verification from "./Verification";
import "../../assets/css/common/forgot-password.css";
import LoadingSpinner from "../reuse/LoadingSpinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const errmess = sessionStorage.getItem("message");

  useEffect(() => {
    if (errmess) {
      setMessage(errmess);
    }
  }, [errmess]);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email không được để trống!");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email);
      console.log(response);

      if (response.status == "200") {
        setMessage("Vui lòng kiểm tra email để lấy mã đổi mật khẩu");
        setIsEmailSent(true);
        setLoading(false);
      } else {
        setMessage("  Không tìm thấy tài khoản với email này!");
      }
    } catch (err) {
      setMessage("Lỗi khi gửi yêu cầu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h1 className="forgot-title">Quên mật khẩu</h1>
        <p className="forgot-subtitle">
          Nhập email để nhận mã đặt lại mật khẩu
        </p>

        {message && <p className="a-success-message">{message}</p>}

        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="forgot-input"
          readOnly={isEmailSent}
        />

        {message == "Vui lòng kiểm tra email để lấy mã đổi mật khẩu" ? (
          <>
            <Verification email={email} funct="forgot-password"></Verification>
          </>
        ) : (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <button
                  type="submit"
                  onClick={handleForgotPassword}
                  className="forgot-button"
                >
                  GỬI YÊU CẦU
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
