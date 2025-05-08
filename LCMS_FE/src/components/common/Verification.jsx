import React, { useState, useRef, useEffect } from "react";
import "../../assets/css/common/verification.css";
import {
  forgotPassword,
  logout,
  resendCode,
  verifyOTP,
  verifyRegister,
} from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  sendUpdateEmailCode,
  verifyUpdateEmailCode,
} from "../../services/account";

const Verification = ({ email, funct }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [errmessage, setErrMessage] = useState("");
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    setIsButtonActive(otp.every((num) => num !== ""));
  }, [otp]);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
      setCountdown(30);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle paste of multiple characters
    if (value.length > 1) {
      // If user pastes multiple digits, distribute them across inputs
      const digits = value.split("").slice(0, 6 - index);
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus on the appropriate input after paste
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 5) {
        inputRefs.current[nextIndex + 1].focus();
      }
    } else {
      // Normal single digit input
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input when a digit is entered
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    // Handle backspace
    if (event.key === "Backspace") {
      const newOtp = [...otp];

      // If current input is empty and not the first input, move to previous input
      if (otp[index] === "" && index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Just clear current input
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
    // Handle left arrow key
    else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    // Handle right arrow key
    else if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleLogout = async () => {
    const res = logout();
    localStorage.removeItem("token");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleBackspace = (index, event) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleResendCode = () => {
    if (funct == "forgot-password") {
      setResendDisabled(true);
      setCountdown(30);
      forgotPassword(email);
    } else if (funct == "verify-register") {
      setResendDisabled(true);
      setCountdown(30);
      resendCode(email);
      setCountdown(30);
    } else if (funct == "verify-email") {
      setResendDisabled(true);
      setCountdown(30);
      sendUpdateEmailCode(email);
      setCountdown(30);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const otpString = otp.join("");

    if (funct == "forgot-password") {
      const response = await verifyOTP(email, otpString);

      if (response.status === 200) {
        sessionStorage.setItem("email", email);
        toast.success("Xác thực thành công", {
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
          navigate("/change-password");
        }, 1000);
      } else if (response.status === 400) {
        setOtp(["", "", "", "", "", ""]);
        setErrMessage("Mã bạn vừa nhập đã sai hoặc hết hạn ");
      }
    } else if (funct == "verify-register") {
      const response = await verifyRegister(email, otpString);

      if (response.status === 200) {
        toast.success("Đăng ký thành công", {
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
        }, 1000);
      } else if (response.status === 401) {
        setOtp(Array(6).fill(""));
        setErrMessage("Mã bạn vừa nhập đã sai hoặc hết hạn ");
        inputRefs.current[0].focus();
      }
    } else if (funct == "login") {
      const response = await verifyRegister(email, otpString);

      if (response.status === 200) {
        toast.success("Kích hoạt tài khoản thành công", {
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
          navigate("/");
        }, 1500);
      } else if (response.status === 401) {
        setOtp(Array(6).fill(""));
        setErrMessage("Mã bạn vừa nhập đã sai hoặc hết hạn ");
        inputRefs.current[0].focus();
      }
    } else if (funct == "verify-email") {
      const response = await verifyUpdateEmailCode(otpString);

      console.log("====================================");
      console.log(response);
      console.log("====================================");

      if (response.status === 200) {
        toast.success("Đổi email thành thành công, vui lòng đăng nhập lại", {
          className: "custom_toast",
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          transition: Bounce,
        });
        handleLogout();
      } else if (response.status === 500) {
        setOtp(Array(6).fill(""));
        setErrMessage("Mã bạn vừa nhập đã sai hoặc hết hạn ");
        inputRefs.current[0].focus();
      }
    }
  };

  return (
    <div className="verification-container">
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
      <h3>Nhập mã OTP</h3>
      <form onSubmit={handleVerify}>
        <div className="verification-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onClick={() => handleClick(index)}
              ref={(el) => (inputRefs.current[index] = el)}
              autoComplete="off"
              autoCorrect="off"
            />
          ))}
        </div>
        <h5 style={{ color: "red", paddingTop: "4%" }}>{errmessage}</h5>
        <button
          type="submit"
          className={
            isButtonActive
              ? "verification-button active"
              : "verification-button"
          }
          disabled={!isButtonActive}
        >
          Xác nhận OTP
        </button>
        <p className="resend-text">
          Chưa nhận được mã?
          <button
            type="button"
            className="resend-button"
            onClick={handleResendCode}
            disabled={resendDisabled}
          >
            {resendDisabled ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Verification;
