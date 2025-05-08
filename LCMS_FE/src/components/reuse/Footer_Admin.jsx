// Footer_Admin.jsx
import React from "react";
import "../../assets/css/admin/dashboard.css";

const Footer_Admin = () => {
  return (
    <footer className="footer-admin">
      <div className="footer-content">
        <p>
          © 2025, thực hiện với{" "}
          <span role="img" aria-label="heart">
            ❤️
          </span>{" "}
          bởi
          <a
            href="https://website-cua-chuoi-giat-la.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            G22-SEP490
          </a>{" "}
          vì một tương lai sạch hơn.
        </p>
      </div>
      <div className="footer-links">
        <a href="#about-us">Giới thiệu</a>
        <a href="#services">Dịch vụ của chúng tôi</a>
        <a href="#blog">Blog</a>
        <a href="#contact">Liên hệ</a>
        <a href="#terms">Điều khoản và Điều kiện</a>
      </div>
    </footer>
  );
};

export default Footer_Admin;
