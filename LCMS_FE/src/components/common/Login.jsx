import React, { useState } from "react";
import "../../assets/css/common/login.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { login } from "../../services/auth";
import Verification from "./Verification";
import LoadingSpinner from "../reuse/LoadingSpinner";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setErrMessage("Email hoặc mật khẩu không được để trống!");
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);
      if (!response) throw new Error("Không nhận được phản hồi từ server!");

      if (response.status === 400) {
        if (response.data == "Invalid email.") {
          setErrMessage("Tên đăng nhập hoặc mật khẩu không đúng");
        } else if (response.data == "Invalid password.") {
          setErrMessage("Tên đăng nhập hoặc mật khẩu không đúng");
        } else setErrMessage(response.data || "");
      } else if (response.status === 200) {
        if (!response.data.token)
          throw new Error("Không nhận được token từ server!");

        const decodedData = jwtDecode(response.data.token);
        setErrMessage("");

        if (decodedData) {
          localStorage.setItem("token", response.data.token);

          const role =
            decodedData[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];

          toast.success("Đăng nhập thành công", {
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
            switch (role) {
              case "Admin":
                navigate("/admin/dashboard");
                break;
              case "Manager":
                navigate("/manager/dashboard_manager");
                break;
              case "Staff":
                navigate("/nhan-vien/trang-chu");
                break;
              case "Customer":
                navigate("/");
                break;
              default:
                navigate("/unauthorized");
                break;
            }
          }, 1500);
        }
      } else {
        throw new Error("Phản hồi không xác định từ server.");
      }
    } catch (error) {
      setErrMessage(error.message || "Đăng nhập thất bại! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
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
      <div className="login-form">
        <h1 className="login-title">Đăng nhập</h1>
        <span className="login-subtitle">hoặc tạo tài khoản mới</span>
        {errMessage && <h4 className="error-message">{errMessage}</h4>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />

          {errMessage ===
          "Your account is not activated. A new confirmation code has been sent to your email." ? (
            <Verification email={email} funct="login" />
          ) : (
            <>
              <p
                className="forgot-password"
                onClick={() => navigate("/forgot-password")}
              >
                Quên mật khẩu?
              </p>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <button
                    type="submit"
                    className="login-button"
                    disabled={loading}
                  >
                    Đăng nhập
                  </button>
                  <p className="login-register-text">Chưa có tài khoản?</p>
                  <button
                    type="button"
                    className="login-register-button"
                    onClick={() => navigate("/register")}
                  >
                    Đăng ký ngay
                  </button>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
