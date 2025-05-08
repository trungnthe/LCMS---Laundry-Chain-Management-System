import React, { useState, useEffect } from "react";
import { resetPassword } from "../../services/auth";
import "../../assets/css/common/change-password.css";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");

  useEffect(() => {
    if (!email) {
      sessionStorage.setItem(
        "message",
        "Chưa xác thực yêu cầu, vui lòng xác thực"
      );
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,32}$/;

    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 32) {
      setError("Mật khẩu phải có từ 8 đến 32 ký tự!");
      return;
    }

    if (!passwordPattern.test(newPassword)) {
      setError(
        "Mật khẩu phải có ít nhất 1 ký tự in hoa, 1 ký tự in thường và 1 chữ số!"
      );
      return;
    }

    try {
      const response = await resetPassword(email, newPassword);
      console.log(response);

      if (response.status === 200) {
        toast.success("Đổi mật khẩu thành công", {
          className: "custom_toast",
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          transition: Bounce,
        });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError("Lỗi khi đổi mật khẩu. Vui lòng thử lại!");
      }
    } catch (err) {
      setError("Lỗi khi đổi mật khẩu. Vui lòng thử lại!");
    }
  };

  return (
    <div className="change-password-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        transition={Bounce}
      />
      <form className="change-password-form" onSubmit={handleChangePassword}>
        <h1 className="change-title">Đổi mật khẩu</h1>

        {error && <p className="a-error-message">{error}</p>}

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="change-input"
          required
        />

        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="change-input"
          required
        />

        <button type="submit" className="change-button">
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
