import React, { useState } from "react";
import {
  FaShoppingCart,
  FaUsers,
  FaUserTie,
  FaBoxes,
  FaBox,
  FaCalendarDay,
  FaChevronDown,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "../../assets/css/manager/sidebar_manager.css";

const Sidebar_Manager = ({ isSidebarOpen, toggleSidebar }) => {
  const [activeLink, setActiveLink] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = (link) => {
    setActiveLink(link);
    navigate(link);
  };

  return (
    <div
      className={`dashboard-manager-sidebar ${isSidebarOpen ? "active" : ""}`}
    >
      <div className="dashboard-manager-sidebar-brand"></div>
      <div
        className="dashboard-manager-sidebar-menu-toggle"
        onClick={toggleSidebar}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="dashboard-manager-sidebar-menu">
        <button
          className={`dashboard-manager-sidebar-link ${
            activeLink === "/manager/orders" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/manager/orders")}
        >
          <FaShoppingCart /> Quản Lý Đơn Hàng
        </button>
        <button
          className={`dashboard-manager-sidebar-link ${
            activeLink === "/manager/customers" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/manager/customers")}
        >
          <FaUsers /> Quản Lý Khách Hàng
        </button>
        <button
          className={`dashboard-manager-sidebar-link ${
            activeLink === "/manager/staff" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/manager/staff")}
        >
          <FaUserTie /> Quản Lý Nhân Viên
        </button>
        <button
          className={`dashboard-manager-sidebar-link ${
            activeLink === "/manager/inventory" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/manager/inventory")}
        >
          <FaBoxes /> Quản lý lô hàng
        </button>

        <button
          className={`dashboard-manager-sidebar-link ${
            activeLink === "/manager/time" ? "active" : ""
          }`}
          onClick={() => handleLinkClick("/manager/time")}
        >
          <FaCalendarDay /> Quản lý ca làm việc
        </button>
      </div>
    </div>
  );
};

export default Sidebar_Manager;
