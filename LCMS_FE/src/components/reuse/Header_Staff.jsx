import React, { useEffect, useState, useRef } from "react";
import "../../assets/css/staff/header.css";
import "../../assets/css/staff/staffs.css";
import { HubConnectionBuilder } from "@microsoft/signalr";

import { FaBell, FaUser } from "react-icons/fa";
import { SlLogin, SlLogout } from "react-icons/sl";
import { CgProfile } from "react-icons/cg";
import { MdClose } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUserFromToken, performLogout } from "../../services/auth.js";
import {
  fetchStaffInfo,
  getMyNotificationlAsync,
} from "../../services/fetchApiStaff.js";
const apiUrl = import.meta.env.VITE_API_URL;

import {
  markNotificationAsRead,
  markAllNotificationsRead,
} from "../../services/notification";
function HeaderStaff() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("unread"); // hoặc "read"
  const notificationSound = new Audio(
    "/sounds/elevator-chimenotification-ding-recreation-287560.mp3"
  );

  const [staffData, setStaffData] = useState(null);
  const [branchData, setBranchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const fetchDataNotification = async () => {
    try {
      const notiData = await getMyNotificationlAsync();
      setNotifications(notiData || []);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Không thể tải dữ liệu kho hàng");
    }
  };

  useEffect(() => {
    fetchDataNotification();
  }, []);
  useEffect(() => {
    // Early return if no staffData or branchId
    if (!staffData || !staffData.branchId) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/signalHub`)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR Connected");

        connection.on("receiveupdate", (action, branchId) => {
          console.log(`Booking update received: ${action}, ${branchId}`);

          if (action === "NewBooking" && branchId === staffData.branchId) {
            console.log(`BranchId: ${staffData.branchId}`);

            fetchDataNotification();
            notificationSound.play();
          }
        });
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.off("receiveupdate");
      connection.stop();
      console.log("SignalR Disconnected");
    };
  }, [staffData]); // Add staffData as a dependency
  const logoutTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleCount, setVisibleCount] = useState(5);
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5); // mỗi lần load thêm 5
  };

  const navLinks = [
    { path: "/nhan-vien/trang-chu", label: "Trang chủ" },
    { path: "/nhan-vien/tao-lich-giat", label: "Tạo lịch giặt" },
    { path: "/nhan-vien/danh-sach-don-hang", label: "Đơn hàng" },
    { path: "/nhan-vien/lich-lam-viec-cham-cong", label: "Lịch làm việc" },
    { path: "/nhan-vien/thong-tin-luong", label: "Thông tin lương" },
    { path: "/nhan-vien/kho-hang", label: "Kho hàng" },
  ];
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await fetchStaffInfo();
      setStaffData(data);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Facebook-style relative time formatting
  const getRelativeTime = (date) => {
    if (!date) return "";

    const seconds = Math.floor((currentTime - date) / 1000);

    if (seconds < 30) return "vừa xong";
    if (seconds < 60) return `${seconds} giây trước`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} tuần trước`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;

    const years = Math.floor(days / 365);
    return `${years} năm trước`;
  };
  const handleNotification = async (id) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res?.status === 200) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === id ? { ...n, isRead: true } : n
          )
        );
      } else {
      }
    } catch (error) {}
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowConfirm(true);
    setCountdown(10);

    logoutTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(logoutTimerRef.current);
          performLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelLogout = () => {
    if (logoutTimerRef.current) {
      clearInterval(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    setShowConfirm(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) {
      setNotificationOpen(false);
    }
  };

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      setDropdownOpen(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await markAllNotificationsRead(); // Giả sử không cần id

      if (res?.status === 200) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      } else {
        console.error("Lỗi khi đánh dấu tất cả là đã đọc:", res?.status);
      }
    } catch (error) {
      console.error("Lỗi kết nối khi đánh dấu tất cả là đã đọc:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Loading skeleton for user dropdown
  const LoadingUserDropdown = () => (
    <div className="header-staff-user-dropdown-skeleton">
      <div className="header-staff-skeleton-circle"></div>
      <div className="header-staff-skeleton-lines">
        <div className="header-staff-skeleton-line"></div>
        <div className="header-staff-skeleton-line"></div>
      </div>
    </div>
  );

  // Render function with loading state
  const renderUserSection = () => {
    if (isLoading) {
      return <LoadingUserDropdown />;
    }

    return (
      <div className="header-staff-user-profile" ref={dropdownRef}>
        <div className="header-staff-user-icon" onClick={toggleDropdown}>
          <FaUser />
          <span className="header-staff-username-display">
            {staffData?.employeeName?.split(" ").pop() || "User"}
          </span>
        </div>

        {dropdownOpen && (
          <div className="header-staff-user-dropdown-menu">
            <div className="header-staff-user-info">
              <h4>Chào {staffData?.employeeName || "User"}!</h4>
              <span className="header-staff-user-role">
                Vai trò: {staffData?.employeeRoleName || "Chưa có dữ liệu"}
              </span>
            </div>
            <div className="header-staff-dropdown-divider"></div>
            <div
              className="header-staff-dropdown-item"
              onClick={() => navigate("/user/profile")}
            >
              <CgProfile />
              <span>Thông tin cá nhân</span>
            </div>
            <div
              className="header-staff-dropdown-item header-staff-logout-item"
              onClick={handleLogout}
            >
              <SlLogout />
              <span>Đăng xuất</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="header-staff">
      <div className="header-staff-container">
        <nav className="header-staff-main-nav">
          <div className="header-staff-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`header-staff-nav-link ${
                  location.pathname === link.path ? "header-staff-active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="header-staff-actions">
            <div className="header-staff-action-buttons">
              <Link
                to="/nhan-vien/ve-thang"
                className="header-staff-action-button"
              >
                Gói tháng
              </Link>
              <Link
                to="/nhan-vien/lich-lam-viec-cham-cong"
                className="header-staff-action-button header-staff-primary"
              >
                Chấm công
              </Link>
            </div>

            <div className="header-staff-notification" ref={notificationRef}>
              <div
                className="header-staff-notification-icon"
                onClick={toggleNotifications}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="header-staff-notification-badge">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notificationOpen && (
                <div className="header-staff-notification-dropdown">
                  <div className="header-staff-notification-header">
                    <h3>Thông báo</h3>{" "}
                    {unreadCount > 0 && (
                      <button
                        className="header-staff-mark-all-read"
                        onClick={markAllAsRead}
                      >
                        Đánh dấu đã đọc tất cả
                      </button>
                    )}{" "}
                  </div>

                  {/* Tabs */}
                  <div className="notification-tabs">
                    <button
                      className={activeTab === "unread" ? "active" : ""}
                      onClick={() => setActiveTab("unread")}
                    >
                      Chưa đọc ({unreadNotifications.length})
                    </button>
                    <button
                      className={activeTab === "read" ? "active" : ""}
                      onClick={() => setActiveTab("read")}
                    >
                      Đã đọc ({readNotifications.length})
                    </button>{" "}
                  </div>

                  {/* Danh sách thông báo */}
                  <div className="header-staff-notification-list">
                    {(activeTab === "unread"
                      ? unreadNotifications
                      : readNotifications
                    )
                      .slice(0, visibleCount)
                      .map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`header-staff-notification-item ${
                            !notification.isRead ? "header-staff-unread" : ""
                          }`}
                          onClick={() =>
                            handleNotification(notification.notificationId)
                          }
                        >
                          <div className="header-staff-notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.content}</p>
                            <span className="header-staff-notification-time">
                              {getRelativeTime(
                                new Date(notification.createdAt)
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Nút Load thêm */}
                  <div className="header-staff-notification-footer">
                    <button className="btn-load-more" onClick={handleLoadMore}>
                      Xem thông báo trước đó
                    </button>
                  </div>
                </div>
              )}
            </div>

            {renderUserSection()}
          </div>
        </nav>
      </div>

      {showConfirm && (
        <div className="header-staff-logout-confirmation-overlay">
          <div className="header-staff-logout-confirmation-modal">
            <h3>Xác nhận đăng xuất</h3>
            <p>
              Bạn sẽ bị đăng xuất sau{" "}
              <span className="header-staff-countdown">{countdown}</span>{" "}
              giây...
            </p>
            <div className="header-staff-modal-actions">
              <button
                onClick={cancelLogout}
                className="header-staff-stay-button"
              >
                Ở lại
              </button>
              <button
                onClick={performLogout}
                className="header-staff-logout-now-button"
              >
                Đăng xuất ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default HeaderStaff;
