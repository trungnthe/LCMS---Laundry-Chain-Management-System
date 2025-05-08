import React, { useState, useEffect } from "react";
import "../../assets/css/admin/navbar_admin.css";
import { FaHome, FaUser } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { SlLogout } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyProfile from "./user/MyProfile";
import { logout } from "../../services/auth";
import { refreshToken } from "../../services/authHelper";

const Header_Admin = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     try {
  //       const decoded = jwtDecode(token);
  //       setUserData(decoded);
  //     } catch (error) {
  //       localStorage.removeItem("token");
  //       setUserData(null);
  //     }
  //   } else {
  //     setUserData(null);
  //   }
  // }, []);
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Decode token to check if expired
          const decoded = jwtDecode(token);

          // Check if token is expired (exp is in seconds)
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired, attempt to refresh
            const newToken = await refreshToken();

            if (newToken) {
              // Successfully refreshed
              const newDecoded = jwtDecode(newToken);
              setUserData(newDecoded);
            } else {
              // Failed to refresh token, redirect to login
              localStorage.removeItem("token");
              setUserData(null);
              window.location.href = "/login";
            }
          } else {
            // Token still valid
            setUserData(decoded);
          }
        } catch (error) {
          console.error("Token validation error:", error);
          localStorage.removeItem("token");
          setUserData(null);
        }
      }
    };

    verifyToken();
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const res = logout();
    localStorage.removeItem("token");
    setUserData(null);
    toast.success("Đăng xuất thành công", {
      className: "custom_toast",
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      transition: Bounce,
    });
    setTimeout(() => navigate("/login"), 1000);
  };

  const handleNavigate = () => navigate("/admin/dashboard");

  return (
    <>
      <ToastContainer />
      <nav
        className={`dashboard-navbar header-admin ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        <div className="dashboard-navbar-content header-admin">
          <div className="navbar-left header-admin" onClick={handleNavigate}>
            <div className="navbar-home header-admin">
              <FaHome className="navbar-icon header-admin" />
              <h1>Dashboard</h1>
            </div>
            <div className="breadcrumb header-admin">
              <span style={{ cursor: "pointer" }}>Home</span>
            </div>
          </div>
          <div className="navbar-right header-admin">
            <div className="user-icons header-admin">
              <div className="user-icon header-admin">
                <div className="admin-user-hover">
                  <FaUser style={{ fontSize: "23px", paddingRight: "5%" }} />
                  <div className="admin-user-content">
                    <div className="admin-user-info">
                      {userData && (
                        <p className="admin-username">{userData.Name}</p>
                      )}
                      <div className="admin-manage-item-container"></div>
                      <div
                        className="admin-manage-item-container"
                        onClick={() => setShowProfileModal(true)}
                      >
                        <CgProfile />
                        <p>Thông tin cá nhân</p>
                      </div>
                      <div
                        className="admin-manage-item-container"
                        onClick={handleLogout}
                      >
                        <SlLogout />
                        <p>Đăng xuất</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowProfileModal(false)}
            >
              ×
            </button>
            <MyProfile />
          </div>
        </div>
      )}
    </>
  );
};

export default Header_Admin;
