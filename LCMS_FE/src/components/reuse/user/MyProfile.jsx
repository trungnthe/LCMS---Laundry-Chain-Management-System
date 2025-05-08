import React, { useEffect, useState } from "react";
import "../../../assets/css/user/profile.css";
import { jwtDecode } from "jwt-decode";
import {
  getAccountById,
  sendUpdateEmailCode,
  updateProfile,
} from "../../../services/account";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { changePassword } from "../../../services/auth";
import { useLocation } from "react-router-dom";
import Verification from "../../common/Verification";
import LoadingSpinner from "../LoadingSpinner";
import { div } from "framer-motion/client";

const MyProfile = () => {
  const [isClicked, setClicked] = useState(0);
  const [account, setAccount] = useState();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const type = location.state?.type;

  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded?.AccountId || null;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  useEffect(() => {
    if (type) {
      setClicked(type);
    }
  }, [type]);

  useEffect(() => {
    if (userId) {
      getAccountById(userId)
        .then((response) => {
          setAccount(response.data);
          setName(response.data.name);
          setPhone(response.data.phone);
          //setOldEmail(response.data.email);
        })
        .catch((error) => {
          console.error("Error fetching account:", error);
        });
    }
  }, [userId]);

  const handleClicked = (number) => {
    setClicked(number);
  };

  const handleUpdateProfile = async () => {
    if (name === account?.name && phone === account?.phone) {
      toast.error("Không có thay đổi để cập nhật!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    if (!name?.trim() || !phone?.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên và số điện thoại!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    const phoneRegex = /^(0[1-9]\d{8,9}|(\+?\d{1,3})?\d{9,15})$/;

    if (!phoneRegex.test(phone)) {
      toast.error("Số điện thoại không hợp lệ!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    try {
      const response = await updateProfile(name, phone);
      if (response) {
        toast.success("Cập nhật thành công", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          transition: Bounce,
        });
        setClicked(0);
        setName(account?.name);
        setPhone(account?.phone);
      }

      localStorage.setItem("token", response.token);
      window.location.reload();
      setAccount((prev) => ({ ...prev, name, phone }));
    } catch (error) {
      console.error("Lỗi: " + error);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    if (oldPassword == newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu cũ", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,32}$/;

    if (!passRegex.test(newPassword)) {
      toast.error(
        "Mật khẩu phải có từ 8 đến 32 ký tự, có ít nhất 1 ký tự in hoa, 1 ký tự in thường và 1 chữ số!",
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          transition: Bounce,
        }
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    try {
      const response = await changePassword(oldPassword, newPassword);

      if (
        response.status == "400" &&
        response.response.data.message == "Old password is incorrect."
      ) {
        throw new Error("Mật khẩu cũ không đúng");
      }

      toast.success("Đổi mật khẩu thành công!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      setOldPassword("");
      setNewPassword("");
      setClicked(0);
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail?.trim()) {
      toast.error("Vui lòng nhập địa chỉ email mới bạn muốn thay đổi", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Địa chỉ email không hợp lệ!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await sendUpdateEmailCode(newEmail);
      if (response.status === 500) {
        setMessage("Email đã được sử dụng, vui lòng chọn email khác.");
      } else if (response.status === 200) {
        setMessage("Vui lòng kiểm tra hộp thư đến để lấy mã xác nhận.");
      }
    } catch (error) {
      setMessage("Thất bại! Hãy thử lại. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="my-profile-header">
        <h5>Hồ sơ của tôi</h5>
        <h3>Quản lí thông tin cá nhân để bảo mật tài khoản</h3>
      </div>
      <div className="my-profile-content">
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
        <div className="my-profile-content-left">
          <div className="my-profile-content-text">
            <div className="my-profile-content-text-title">
              <h2>Tên người dùng</h2>
            </div>
            <div>
              <h4>{account?.name}</h4>
            </div>
          </div>
          <div className="my-profile-content-text">
            <div className="my-profile-content-text-title">
              <h2>Số điện thoại</h2>
            </div>
            <div>
              <h4>{account?.phone}</h4>
            </div>
          </div>
          <div className="my-profile-content-text">
            <div className="my-profile-content-text-title">
              <h2>Địa chỉ email</h2>
            </div>
            <div>
              <h4>{account?.email}</h4>
            </div>
          </div>
          <div className="my-profile-content-left-button">
            <button
              className="my-profile-content-left-button-hover"
              onClick={() => handleClicked(1)}
            >
              Sửa thông tin
            </button>
            <button
              className="my-profile-content-left-button-hover"
              onClick={() => handleClicked(3)}
            >
              Đổi email
            </button>
            <button
              className="my-profile-content-left-button-hover"
              onClick={() => handleClicked(2)}
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
        <div className="my-profile-content-right">
          {isClicked === 0 ? (
            <></>
          ) : (
            <>
              {isClicked === 1 ? (
                <>
                  <p>Chỉnh sửa thông tin cá nhân: </p>
                  <input
                    type="text"
                    placeholder={account?.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  ></input>
                  <input
                    type="text"
                    placeholder={account?.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  ></input>
                  <div className="my-profile-content-right-button">
                    <button onClick={handleUpdateProfile}>Cập Nhật</button>
                  </div>
                </>
              ) : (
                <></>
              )}

              {isClicked === 2 ? (
                <>
                  <p>Đổi mật khẩu: </p>
                  <input
                    type="password"
                    placeholder="Mật khẩu cũ"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  ></input>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  ></input>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  ></input>
                  <div className="my-profile-content-right-button">
                    <button onClick={handleChangePassword}>Cập Nhật</button>
                  </div>
                </>
              ) : (
                <></>
              )}

              {isClicked === 3 ? (
                <>
                  <p>Đổi địa chỉ email: </p>
                  {message && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "red",
                        textDecoration: "none",
                      }}
                    >
                      {message}
                    </p>
                  )}

                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email mới"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  ></input>

                  {message ==
                  "Vui lòng kiểm tra hộp thư đến để lấy mã xác nhận." ? (
                    <div style={{ paddingLeft: "50px" }}>
                      <Verification email={newEmail} funct="verify-email" />
                    </div>
                  ) : (
                    <>
                      {loading ? (
                        <div
                          style={{ paddingTop: "20px", paddingRight: "20px" }}
                        >
                          <div className="loading">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="my-profile-content-right-button">
                            <button onClick={handleChangeEmail}>
                              Đổi email
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
