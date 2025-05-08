import React, { useEffect, useRef, useState } from "react";
import "../../assets/css/user/homepage.css";
import { FaLocationDot } from "react-icons/fa6";
import {
  FaBars,
  FaBell,
  FaEdit,
  FaExchangeAlt,
  FaMobileAlt,
  FaRegPaperPlane,
} from "react-icons/fa";
import { FaUser, FaRegClock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsCart } from "react-icons/bs";
import { SlLogout } from "react-icons/sl";
import { CgClose, CgProfile } from "react-icons/cg";
import { jwtDecode } from "jwt-decode";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../../services/notification";
import { fetchServices, fetchServiceTypes } from "../../admin/manage_service";
import { fetchCart, removeFromCart, updateQuantity } from "../../services/cart";
import Swal from "sweetalert2";
import { fetchBookingHistoryByCustomerId } from "../../services/bookingHistory";
import { logout } from "../../services/auth";
import { refreshToken } from "../../services/authHelper";
import * as signalR from "@microsoft/signalr";
import NotificationPopup from "./user/NotificationPopup";
import { div } from "framer-motion/client";

const Header = ({ keyProp }) => {
  const [isWithinTime, setIsWithinTime] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNoficationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL;
  const [firstnotification, setFirstNotification] = useState(null);

  let userId;
  let role;
  const menuRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);

  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.AccountId;
    role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  }

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);

          const currentTime = Math.floor(Date.now() / 1000);

          if (decoded.exp && decoded.exp < currentTime) {
            const newToken = await refreshToken();
            if (newToken) {
              const newDecoded = jwtDecode(newToken);
              setUserData(newDecoded);
              setIsLogin(true);
            } else {
              localStorage.removeItem("token");
              setIsLogin(false);
              setUserData(null);
              window.location.href = "/login";
            }
          } else {
            setUserData(decoded);
            setIsLogin(true);
          }
        } catch (error) {
          console.error("Token validation error:", error);
          localStorage.removeItem("token");
          setIsLogin(false);
          setUserData(null);
        }
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    fetchNotifications(userId)
      .then((response) => {
        setNotification(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        setNotification([]);
      });

    fetchServices()
      .then((data) => {
        setServices(data);
      })
      .catch((error) => {});

    fetchServiceTypes()
      .then((data) => {
        setServiceTypes(data);
      })
      .catch((error) => {});

    fetchCart()
      .then((data) => {
        setCart(data);
      })
      .catch((error) => {});

    // Kết nối SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/signalHub`, {
        accessTokenFactory: () => localStorage.getItem("token"),
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {})
      .catch();

    // Nhận sự kiện "receiveupdate"
    connection.on("receiveupdate", (event, data) => {
      if (event === "Notification") {
        fetchNotifications(userId)
          .then((response) => {
            const notifications = Array.isArray(response.data)
              ? response.data
              : [];
            setNotification(notifications);

            if (notifications.length > 0) {
              setFirstNotification(notifications[0]);
              setTimeout(() => {
                setFirstNotification(null);
              }, 5000);
            }
          })
          .catch((error) => {
            setNotification([]);
          });
      }
    });

    return () => {
      connection.stop();
    };
  }, [keyProp]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      setIsWithinTime(
        now.getDay() >= 1 &&
          now.getDay() <= 5 &&
          now.getHours() >= 8 &&
          now.getHours() < 20
      );
    };
    checkTime();
    const intervalId = setInterval(checkTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
    setIsNoficationOpen(false);
  };

  const handleToggleNotification = () => {
    setIsNoficationOpen(!isNotificationOpen);
    setIsOpen(false);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsMobileMenuOpen(!isMobileMenuOpen);

    // Close other menus
    setIsCartOpen(false);
    setIsOpen(false);
    setIsNoficationOpen(false);
  };

  const handleNotification = async (id) => {
    const res = await markNotificationAsRead(id);
    if (res?.status === 200) {
      const updatedNotification = notification.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      );
      setNotification(updatedNotification);

      if (
        notification.find((n) => n.notificationId === id).type === "đơn hàng"
      ) {
        let bookingDetail;

        await fetchBookingHistoryByCustomerId(userId).then((response) => {
          bookingDetail = response.find(
            (x) =>
              x.bookingId ==
              notification.find((n) => n.notificationId === id)?.bookingId
          );
        });

        navigate(
          "/user/profile/booking-history/" +
            notification.find((n) => n.notificationId === id)?.bookingId,
          { state: { bookingDetail } }
        );
        setIsNoficationOpen(false);
        setFirstNotification(null);
      }
    }
  };

  const handleUpdateQuantity = async (e, id) => {
    let value = parseInt(e.target.value, 10);

    if (isNaN(value) || value < 1) {
      return;
    }

    try {
      const response = await updateQuantity(id, value);

      if (response) {
        const updatedCart = await fetchCart();
        setCart(updatedCart);
      } else {
      }
    } catch (error) {}
  };

  const handleDeleteQuantity = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Đơn hàng sẽ bị xóa khỏi giỏ hàng!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa!",
      cancelButtonText: "Hủy",
      position: "top",
      customClass: {
        popup: "small-swal-popup",
      },
    });

    if (!result.isConfirmed) return;

    const response = await removeFromCart(id);
    if (response) {
      const updatedCart = await fetchCart();
      setCart(updatedCart);
    }
  };

  const handleClickOutside = (event) => {
    // Handle each menu separately to avoid dependency on other menus
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }

    if (
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setIsNoficationOpen(false);
    }

    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target) &&
      !event.target.closest(".mobile-menu-toggle")
    ) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    // Mouse events
    document.addEventListener("click", handleClickOutside);
    // Touch events for mobile
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const res = logout();
    localStorage.removeItem("token");
    setIsLogin(false);
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
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleNavigateProfile = (link) => {
    navigate(`/user/profile/${link}`);
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavigateEdit = (link, type) => {
    navigate(`/user/profile/${link}`, {
      state: { type },
    });
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleCheckOut = async () => {
    if (cart.length > 0) {
      navigate("/user/checkout");
      setIsCartOpen(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div id="top">
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
      {firstnotification && (
        <div>
          <NotificationPopup
            notification={firstnotification}
            handleNotification={handleNotification}
          />
        </div>
      )}

      <nav className="prenav">
        <div className="prenav-brand">
          <span onClick={() => navigate("/")}> Giặt Là Nhanh</span>
        </div>
        <div className="prenav-container">
          <div className="prenav-item">
            <div className="prenav-icon">
              <FaRegClock style={{ color: "gray" }}></FaRegClock>
            </div>
            <div className="prenav-item-content">
              <p>THỨ 2-THỨ 7: 08:00 SÁNG - 10:00 TỐI</p>
              <i>Chủ Nhật : 08:30 sáng - 9h30 tối </i>
            </div>
          </div>
          <div className="prenav-item">
            <div className="prenav-icon">
              <FaMobileAlt style={{ color: "gray" }}></FaMobileAlt>
            </div>
            <div className="prenav-item-content">
              <p>0898.504.236</p>
              <i>Liên hệ ngay </i>
            </div>
          </div>
          <div className="prenav-item">
            <div className="prenav-icon">
              <FaLocationDot style={{ color: "gray" }}></FaLocationDot>
            </div>
            <div className="prenav-item-content">
              <p>HÒA LẠC - HÀ NỘI</p>
              {isWithinTime ? (
                <i style={{ color: "green" }}>Đang mở cửa</i>
              ) : (
                <i style={{ color: "red" }}>Đã đóng cửa</i>
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="navbar">
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <FaBars size={24} />
        </div>

        <div className="navbar-container">
          <div className={`nav-items`}>
            <div>
              <Link to="/" className="nav-link">
                Trang chủ
              </Link>
            </div>
            <div>
              <Link to="/user/services" className="nav-link">
                Dịch vụ
              </Link>
            </div>
            <div>
              <Link to="/user/pricing" className="nav-link">
                Bảng giá
              </Link>
            </div>
            <div>
              <Link to="/user/branches" className="nav-link">
                Chi nhánh
              </Link>
            </div>
            <div>
              <Link to="/user/blogs" className="nav-link">
                Tin tức
              </Link>
            </div>
            {role == "Customer" ? (
              <div>
                <Link to="/user/subscription" className="nav-link">
                  Gói tháng
                </Link>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>

        <div className="navbar-funct">
          {isLogin && role == "Customer" ? (
            <>
              <div
                className="navbar-book"
                style={{ fontSize: "16px" }}
                onClick={() => navigate("/user/booking")}
              >
                <p>Đặt lịch ngay</p>
              </div>
              <div
                className="navbar-icons"
                onClick={() => setIsCartOpen(true)}
                style={{ position: "relative" }}
              >
                <BsCart />
                {cart?.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-1px",
                      right: "-10px",
                      background: "rgb(253, 40, 40)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "17px",
                      height: "17px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {cart.length}
                  </span>
                )}
              </div>
              <div
                className="user-hover"
                ref={notificationRef}
                style={{ position: "relative", cursor: "pointer" }}
              >
                <FaBell
                  onClick={handleToggleNotification}
                  style={{ color: "orange", fontSize: "22px" }}
                />
                {notification?.filter((n) => !n.isRead).length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-1px",
                      right: "-10px",
                      background: "rgb(253, 40, 40)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "17px",
                      height: "17px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {notification.filter((n) => !n.isRead).length}
                  </span>
                )}

                {isNotificationOpen && (
                  <div className="user-content" style={{ width: "350px" }}>
                    <div className="user-info">
                      {notification.length > 0 ? (
                        notification.map((n) => (
                          <div
                            className={`manage-notification-item ${
                              n.isRead ? "read" : ""
                            }`}
                            key={n.notificationId}
                            onClick={() => handleNotification(n.notificationId)}
                          >
                            <h2>{n.title}</h2>
                            <h5>{n.content}</h5>
                          </div>
                        ))
                      ) : (
                        <p className="no-notification">Chưa có thông báo</p>
                      )}
                    </div>
                  </div>
                )}
              </div>{" "}
            </>
          ) : (
            <></>
          )}

          {isLogin ? (
            <div className="user-hover" ref={menuRef}>
              <FaUser
                onClick={handleToggleMenu}
                style={{ cursor: "pointer" }}
              />
              {isOpen && (
                <div className="user-content">
                  <div className="user-info">
                    <p className="username">{userData?.Name}</p>

                    {role == "Customer" && (
                      <>
                        <div className="user-funct-container">
                          <div className="user-funct">
                            <FaEdit />
                            <p
                              onClick={() => {
                                handleNavigateEdit("", 1);
                              }}
                            >
                              Sửa
                            </p>
                          </div>
                          <div className="user-funct">
                            <FaExchangeAlt />
                            <p
                              onClick={() => {
                                handleNavigateEdit("", 2);
                              }}
                            >
                              Đổi mật khẩu
                            </p>
                          </div>
                        </div>
                        <div
                          className="manage-container"
                          style={{ marginTop: "15px" }}
                        >
                          <p>Quản lí đơn hàng</p>
                        </div>
                        <div
                          className="manage-item-container"
                          onClick={() =>
                            handleNavigateProfile("booking-history")
                          }
                        >
                          <BsCart />
                          <p>Lịch sử đơn hàng</p>
                        </div>
                        <div className="manage-container">
                          <p>Tài khoản</p>
                        </div>
                        <div
                          className="manage-item-container"
                          onClick={() => {
                            navigate("/user/profile");
                            setIsOpen(false);
                          }}
                        >
                          <CgProfile />
                          <p>Thông tin cá nhân</p>
                        </div>
                      </>
                    )}

                    <div
                      className="manage-item-container"
                      onClick={handleLogout}
                    >
                      <SlLogout />
                      <p>Đăng xuất</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="homepage-login" onClick={() => navigate("/login")}>
              <p>Đăng Nhập</p>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`mobile-navbar ${isMobileMenuOpen ? "open" : ""}`}
        ref={mobileMenuRef}
      >
        <div className="mobile-navbar-header">
          <h3>Giặt là mê</h3>
          <CgClose className="mobile-menu-close" onClick={toggleMobileMenu} />
        </div>
        <div className="mobile-nav-items">
          <div className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => handleNavigate("/")}
            >
              Trang chủ
            </div>
          </div>
          <div className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => handleNavigate("/user/services")}
            >
              Dịch vụ
            </div>
          </div>
          <div className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => handleNavigate("/user/pricing")}
            >
              Bảng giá
            </div>
          </div>
          <div className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => handleNavigate("/user/branches")}
            >
              Chi nhánh
            </div>
          </div>
          <div className="mobile-nav-item">
            <div
              className="mobile-nav-link"
              onClick={() => handleNavigate("/user/blogs")}
            >
              Tin tức
            </div>
          </div>
          {role == "Customer" && (
            <div className="mobile-nav-item">
              <div
                className="mobile-nav-link"
                onClick={() => handleNavigate("/user/subscription")}
              >
                Gói tháng
              </div>
            </div>
          )}
          {isLogin && role == "Customer" && (
            <div className="mobile-nav-item">
              <div
                className="mobile-nav-link"
                onClick={() => handleNavigate("/user/booking")}
              >
                Đặt lịch ngay
              </div>
            </div>
          )}
          {isLogin ? (
            <>
              <div className="mobile-nav-item">
                <div
                  className="mobile-nav-link"
                  onClick={() => handleNavigate("/user/profile")}
                >
                  Thông tin cá nhân
                </div>
              </div>
              {role == "Customer" && (
                <div className="mobile-nav-item">
                  <div
                    className="mobile-nav-link"
                    onClick={() => handleNavigateProfile("booking-history")}
                  >
                    Lịch sử đơn hàng
                  </div>
                </div>
              )}
              <div className="mobile-nav-item">
                <div className="mobile-nav-link" onClick={handleLogout}>
                  Đăng xuất
                </div>
              </div>
            </>
          ) : (
            <div className="mobile-nav-item">
              <div
                className="mobile-nav-link"
                onClick={() => handleNavigate("/login")}
              >
                Đăng Nhập
              </div>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="overlay" onClick={toggleMobileMenu}></div>
      )}

      <div className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h4>Các dịch vụ giặt bạn đã chọn: </h4>
          <CgClose onClick={() => setIsCartOpen(false)}></CgClose>
        </div>
        <div className="cart-content">
          {cart && cart?.length > 0 ? (
            cart.map((x) => (
              <div className="cart-list" key={x.itemId}>
                <div className="cart-detail">
                  <div className="cart-image">
                    <img
                      src={
                        services.find((y) => y.serviceId == x.serviceId)
                          ?.image || "https://via.placeholder.com/100"
                      }
                      alt=""
                    />
                  </div>
                  <div className="cart-text">
                    <p>
                      {!x.productName
                        ? `${
                            serviceTypes.find(
                              (z) =>
                                z.serviceTypeId ==
                                services.find((y) => y.serviceId == x.serviceId)
                                  ?.serviceTypeId
                            )?.serviceTypeName || "Dịch vụ"
                          } (${x.serviceName})`
                        : `${x.serviceName} - ${x.productName}`}
                    </p>
                  </div>
                </div>
                <div className="cart-adjust">
                  {x?.productId && (
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={x.quantity}
                      onChange={(e) => handleUpdateQuantity(e, x.itemId)}
                    />
                  )}
                  <CgClose onClick={() => handleDeleteQuantity(x.itemId)} />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-cart-message">
              🛒 Chưa có sản phẩm trong giỏ hàng
            </p>
          )}
        </div>
        {cart?.length > 0 && isCartOpen ? (
          <div className="book-btn-fixed">
            <div className="book-btn" style={{ paddingTop: "3%" }}>
              <button className="book-btn-CartBtn" onClick={handleCheckOut}>
                <span className="book-btn-IconContainer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 576 512"
                    fill="rgb(17, 17, 17)"
                    className="book-btn-cart"
                  >
                    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
                  </svg>
                </span>
                <p className="book-btn-text">Lên đơn</p>
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>

      {isCartOpen && (
        <div className="overlay" onClick={() => setIsCartOpen(false)}></div>
      )}
    </div>
  );
};

export default Header;
