// src/components/staff/Footer.jsx
import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="staff-footer">
      <div className="staff-footer-content">
        <div className="staff-footer-info">
          <p>&copy; 2025 Laundry Store Chain. All rights reserved.</p>
          <p className="staff-footer-contact">
            <FaPhoneAlt /> <span>+1 555-1234</span> | <FaEnvelope /> <span>info@laundrystore.com</span>
          </p>
        </div>

        <div className="staff-footer-socials">
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="staff-footer-icon" />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="staff-footer-icon" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="staff-footer-icon" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="staff-footer-icon" />
          </a>
        </div>

        <div className="staff-footer-terms">
          <a href="/terms" className="staff-footer-link">Terms of Service</a> | 
          <a href="/privacy" className="staff-footer-link">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
