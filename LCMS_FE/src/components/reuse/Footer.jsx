import React, { useEffect, useState } from "react";
import { FaClock, FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { fetchBranches } from "../../admin/manage_branches";

const Footer = () => {
  const [branch, setBranch] = useState([]);
  const handleScrollToTopClick = () => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });
  };

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchBranches().then((data) => {
      setBranch(data.filter((x) => x.statusDelete !== false));
    });
  }, []);

  return (
    <footer className="footer">
      <div className="footer-firstcolumn">
        <h4 className="footer-title">GIAT LA ME</h4>
        <p>
          Dịch vụ giặt là chuyên nghiệp – Nhanh chóng, sạch sẽ, thơm lâu!
          <br></br> Chúng tôi cam kết mang đến quần áo tinh tươm với công nghệ
          <br></br> giặt hiện đại, an toàn cho vải và môi trường. Giao nhận tận
          nơi
          <br></br>tiết kiệm thời gian, tận hưởng cuộc sống!
        </p>
      </div>
      <div className="footer-secondcolumn">
        <h4 className="footer-title">LIEN HE</h4>
        <div className="footer-social">
          <FaFacebook></FaFacebook>
          <FaInstagram></FaInstagram>
        </div>
        <div className="footer-branchlist">
          {branch?.map((b) => {
            return (
              <div className="footer-branch" key={b.branchId}>
                <h5>
                  {b.branchName}: {b.address}
                </h5>
                <div className="footer-info">
                  <FaPhone></FaPhone>
                  <p>{b.phoneNumber}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="footer-thirdcolumn">
        <h4 className="footer-title">GIO LAM VIEC</h4>
        <table>
          <tbody>
            <tr>
              <td>Mon - Fri:</td>
              <td>8.00 - 22.00</td>
            </tr>
            <tr>
              <td>Sat - Sun:</td>
              <td>8.30 - 21.30</td>
            </tr>
          </tbody>
        </table>
        <button
          onClick={handleScrollToTopClick}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "50px",
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "50%",
            padding: "10px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.6697 12.5788L8.48825 20.7602C8.41224 20.8363 8.322 20.8965 8.22268 20.9377C8.12336 20.9788 8.01692 21 7.90942 21C7.80192 21 7.69547 20.9788 7.59615 20.9377C7.49684 20.8965 7.40659 20.8363 7.33058 20.7602C7.25457 20.6842 7.19427 20.594 7.15313 20.4947C7.11199 20.3953 7.09082 20.2889 7.09082 20.1814C7.09082 20.0739 7.11199 19.9675 7.15313 19.8681C7.19427 19.7688 7.25457 19.6786 7.33058 19.6026L14.9342 12L7.33058 4.39743C7.17706 4.24391 7.09082 4.0357 7.09082 3.8186C7.09082 3.60149 7.17706 3.39328 7.33058 3.23976C7.4841 3.08624 7.69231 3 7.90942 3C8.12652 3 8.33473 3.08624 8.48825 3.23976L16.6697 11.4212C16.7457 11.4971 16.8061 11.5874 16.8472 11.6867C16.8884 11.786 16.9096 11.8925 16.9096 12C16.9096 12.1075 16.8884 12.214 16.8472 12.3133C16.8061 12.4126 16.7457 12.5029 16.6697 12.5788Z"
              fill="black"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
