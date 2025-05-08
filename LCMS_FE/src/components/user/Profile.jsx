import React from "react";
import Header from "../reuse/Header";
import "../../assets/css/user/profile.css";
import { PiPencil } from "react-icons/pi";
import { Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let decodedToken;

  if (token) {
    decodedToken = jwtDecode(token);
  } else {
    console.log("Không tìm thấy token");
  }

  const handleNavigate = (link) => {
    navigate(link);
  };

  // Kiểm tra vai trò của người dùng
  const role =
    decodedToken?.[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ];

  return (
    <div>
      <Header></Header>
      <div className="profile-container">
        <div className="profile-container-left">
          <div className="profile-left-header">
            <div className="profile-left-header-img">
              <img src="/UserImage.png" alt="" />
            </div>
            <div className="profile-left-header-content">
              <h3>{decodedToken?.Name}</h3>
              <div
                className="profile-left-header-icon"
                onClick={() => handleNavigate("/user/profile")}
              ></div>
            </div>
          </div>
          <div className="profile-left-title-list">
            <div
              className="profile-left-title"
              onClick={() => handleNavigate("/user/profile")}
            >
              <img src="../../../public/User.png" alt="" />
              <h5>Tài Khoản Của Tôi</h5>
            </div>

            {role === "Admin" || role === "Manager" || role === "Staff" ? (
              <></>
            ) : (
              <>
                <div
                  className="profile-left-title"
                  onClick={() => handleNavigate("/user/profile/notification")}
                >
                  <img src="../../../public/Notification.png" alt="" />
                  <h5>Thông Báo</h5>
                </div>
                <div
                  className="profile-left-title"
                  onClick={() =>
                    handleNavigate("/user/profile/booking-history")
                  }
                >
                  <img src="../../../public/Order.png" alt="" />
                  <h5>Đơn Mua</h5>
                </div>
                <div
                  className="profile-left-title"
                  onClick={() => handleNavigate("/user/profile/loyalty-point")}
                >
                  <img src="../../../public/Point.png" alt="" />
                  <h5>Điểm Thành Viên</h5>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="profile-container-right">
          <Outlet></Outlet>
        </div>
      </div>
    </div>
  );
};

export default Profile;
