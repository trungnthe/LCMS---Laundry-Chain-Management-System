import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaCut,
  FaBoxOpen,
  FaListUl,
  FaStore,
  FaBuilding,
  FaUserTie,
  FaMoneyBillWave,
  FaUserTag,
  FaBoxes,
  FaBox,
  FaBell,
  FaCalendarDay,
  FaBlog,
  FaChevronDown,
  FaLightbulb,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../../assets/css/admin/sidebar_admin.css";

const Sidebar_Admin = ({ isSidebarOpen, toggleSidebar }) => {
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Set active link based on current location
  useEffect(() => {
    setActiveLink(location.pathname);

    // Check if current path is in submenus and open appropriate dropdown
    if (
      location.pathname.includes("/admin/manage-service") ||
      location.pathname.includes("/admin/manage-service-type")
    ) {
      setIsServiceOpen(true);
    }

    if (
      location.pathname.includes("/admin/manage-product") ||
      location.pathname.includes("/admin/manage-product-category")
    ) {
      setIsProductOpen(true);
    }

    if (
      location.pathname.includes("/admin/manage-inventory") ||
      location.pathname.includes("/admin/manage-inventory-detail")
    ) {
      setIsInventoryOpen(true);
    }
  }, [location.pathname]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    navigate(link);
  };

  const toggleServiceMenu = (e) => {
    e.preventDefault();
    setIsServiceOpen(!isServiceOpen);
  };

  const toggleProductMenu = (e) => {
    e.preventDefault();
    setIsProductOpen(!isProductOpen);
  };

  const toggleInventoryMenu = (e) => {
    e.preventDefault();
    setIsInventoryOpen(!isInventoryOpen);
  };

  return (
    <div className={`sidebar-admin ${isSidebarOpen ? "active" : ""}`}>
      <div className="sidebar-brand"></div>
      <div className="sidebar-menu-toggle" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="sidebar-menu">
        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-user" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-user")}
        >
          <FaUsers /> Quản lý người dùng
        </button>
        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-branches" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-branches")}
        >
          <FaBuilding /> Quản lý chuỗi cửa hàng
        </button>

        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-schedule" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-schedule")}
        >
          <FaCalendarAlt /> Quản lý đặt lịch
        </button>

        {/* Dịch vụ - Toggle Menu */}
        <button
          className={`sidebar-link ${
            isServiceOpen ? "dropdown-active" : ""
          } toggle`}
          onClick={toggleServiceMenu}
        >
          <FaCut /> Dịch vụ
          <FaChevronDown className="dropdown-icon" />
        </button>
        <div className={`submenu ${isServiceOpen ? "show" : ""}`}>
          <button
            className={`sidebar-link ${
              activeLink === "/admin/manage-service" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/manage-service")}
          >
            <FaCut /> Quản lý dịch vụ
          </button>
          <button
            className={`sidebar-link ${
              activeLink === "/admin/manage-service-type" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/manage-service-type")}
          >
            <FaListUl /> Quản lý loại dịch vụ
          </button>
        </div>

        {/* Sản phẩm - Toggle Menu */}
        <button
          className={`sidebar-link ${
            isProductOpen ? "dropdown-active" : ""
          } toggle`}
          onClick={toggleProductMenu}
        >
          <FaBoxOpen /> Sản phẩm
          <FaChevronDown className="dropdown-icon" />
        </button>
        <div className={`submenu ${isProductOpen ? "show" : ""}`}>
          <button
            className={`sidebar-link ${
              activeLink === "/admin/manage-product" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/manage-product")}
          >
            <FaBoxOpen /> Quản lý sản phẩm
          </button>
          <button
            className={`sidebar-link ${
              activeLink === "/admin/manage-product-category" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/manage-product-category")}
          >
            <FaListUl /> Quản lý loại sản phẩm
          </button>
        </div>

        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-employee" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-employee")}
        >
          <FaUserTie /> Quản lý nhân viên
        </button>
        {/* <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-timekeeping" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-timekeeping")}
        >
          <FaMoneyBillWave /> Quản lý lương
        </button> */}
        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-role-salary" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-role-salary")}
        >
          <FaUserTag /> Quản lý vai trò & lương
        </button>

        {/* Lô hàng - Toggle Menu */}
        <button
          className={`sidebar-link ${
            isInventoryOpen ? "dropdown-active" : ""
          } toggle`}
          onClick={toggleInventoryMenu}
        >
          <FaBoxes /> Lô hàng
          <FaChevronDown className="dropdown-icon" />
        </button>
        <div className={`submenu ${isInventoryOpen ? "show" : ""}`}>
          <button
            className={`sidebar-link ${
              activeLink === "/admin/manage-inventory" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/manage-inventory")}
          >
            <FaBoxes /> Quản lý lô hàng
          </button>
          <button
            className={`sidebar-link ${
              activeLink === "/admin/manage-inventory-detail" ? "active" : ""
            }`}
            onClick={() => handleLinkClick("/admin/manage-inventory-detail")}
          >
            <FaBox /> Chi tiết lô hàng
          </button>
        </div>

        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-shift" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-shift")}
        >
          <FaCalendarDay /> Quản lý ca làm việc
        </button>
        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-blog" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-blog")}
        >
          <FaBlog /> Quản lý bài viết
        </button>
        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-weather-suggestion" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-weather-suggestion")}
        >
          <FaLightbulb /> Quản lý gợi ý
        </button>
        <button
          className={`sidebar-link ${
            activeLink === "/admin/manage-notify" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/admin/manage-notify")}
        >
          <FaBell /> Quản lý thông báo
        </button>
      </div>
    </div>
  );
};

export default Sidebar_Admin;
