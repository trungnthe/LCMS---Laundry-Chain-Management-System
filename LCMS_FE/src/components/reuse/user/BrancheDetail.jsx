import React, { useEffect, useState } from "react";
import MiniNews from "./MiniNews";
import MiniService from "./MiniService";
import RecentBlogs from "./RecentBlogs";
import "../../../assets/css/user/services.css";
import {
  IoLocationOutline,
  IoMailOutline,
  IoStarOutline,
} from "react-icons/io5";
import { MdOutlineSettingsPhone } from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBranchById } from "../../../admin/manage_branches";
import { jwtDecode } from "jwt-decode";

const BrancheDetail = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [isWithinTime, setIsWithinTime] = useState(false);
  const [branchesList, setBranchesList] = useState({});
  const [date, setDate] = useState("");
  const { branchId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let userId;
  let role;

  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.AccountId;
    role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  }

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    document.getElementById(category).scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    fetchBranchById(branchId)
      .then((data) => {
        setBranchesList(data);
      })
      .catch((err) => {
        console.error("Lỗi khi tải chi nhánh:", err);
      });
  }, [branchId]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const day = now.getDay();

      if (day >= 1 && day <= 5 && hours >= 8 && hours < 20) {
        setIsWithinTime(true);
      } else {
        setIsWithinTime(false);
      }

      setDate(day);
    };

    checkTime();
    const intervalId = setInterval(checkTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (branchId != null) {
    return (
      <div className="branch-detail-container">
        <div className="branches-title">
          <h3>Thông tin chi tiết - {branchesList.branchName}</h3>
        </div>
        <div className="branch-section">
          <div className="branch-left">
            <div className="branch-content">
              <div className="branch-image">
                <img src={branchesList.image} alt="" />
              </div>
              <div className="branch-info-left-text">
                <h3>Giặt Là ABC - {branchesList.branchName}</h3>
                <div className="branch-info-left-location">
                  <IoLocationOutline color="#333" width="40px" />
                  <p>{branchesList.address}</p>
                </div>
                <div className="branch-info-left-location">
                  <IoStarOutline color="#333"></IoStarOutline>
                  <p>4.8</p>
                </div>
                <div className="branch-info-left-location">
                  <IoMailOutline color="#333" />
                  <p>{branchesList.email}</p>
                </div>
                <div className="branch-info-left-location">
                  <MdOutlineSettingsPhone color="#333" />
                  <p>{branchesList.phoneNumber}</p>
                </div>
                <div className="branch-info-left-location">
                  <AiOutlineClockCircle color="#333" />
                  {isWithinTime ? (
                    <>
                      <p
                        style={{ color: "green", cursor: "pointer" }}
                        onClick={() => handleCategoryClick("gio-hoat-dong")}
                      >
                        Đang mở cửa: 8h00 - 22h00
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => handleCategoryClick("gio-hoat-dong")}
                      >
                        Đã đóng cửa: 8h00 - 22h00
                      </p>
                    </>
                  )}
                </div>
                {role == "Customer" ? (
                  <button
                    className="branch-btn"
                    onClick={() => {
                      navigate("/user/booking", {
                        state: { branchId: branchId || 0 },
                      });
                    }}
                  >
                    Đặt lịch ngay
                  </button>
                ) : (
                  <></>
                )}
              </div>

              <div className="branch-category">
                <div
                  className={`branch-cate ${
                    activeCategory === "gio-hoat-dong" ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick("gio-hoat-dong")}
                >
                  <p>Giờ Hoạt Động</p>
                </div>

                <div
                  className={`branch-cate ${
                    activeCategory === "tin-tuc" ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick("tin-tuc")}
                >
                  <p>Tin Tức</p>
                </div>
              </div>

              <div id="gio-hoat-dong">
                <div className="branch-section-content">
                  <h4 className="footer-title">Giờ hoạt động </h4>
                  <table>
                    <tbody>
                      {date === 1 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Thứ 2:</td>
                            <td style={{ color: "green" }}>8.00 - 22.00</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Thứ 2:</td>
                            <td>8.00 - 22.00</td>
                          </tr>
                        </>
                      )}
                      {date === 2 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Thứ 3:</td>
                            <td style={{ color: "green" }}>8.00 - 22.00</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Thứ 3:</td>
                            <td>8.00 - 22.00</td>
                          </tr>
                        </>
                      )}
                      {date === 3 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Thứ 4:</td>
                            <td style={{ color: "green" }}>8.00 - 22.00</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Thứ 4:</td>
                            <td>8.00 - 22.00</td>
                          </tr>
                        </>
                      )}
                      {date === 4 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Thứ 5:</td>
                            <td style={{ color: "green" }}>8.00 - 22.00</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Thứ 5:</td>
                            <td>8.00 - 22.00</td>
                          </tr>
                        </>
                      )}
                      {date === 5 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Thứ 6:</td>
                            <td style={{ color: "green" }}>8.00 - 22.00</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Thứ 6:</td>
                            <td>8.00 - 22.00</td>
                          </tr>
                        </>
                      )}
                      {date === 6 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Thứ 7:</td>
                            <td style={{ color: "green" }}>8.00 - 22.00</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Thứ 7:</td>
                            <td>8.30 - 21.30</td>
                          </tr>
                        </>
                      )}
                      {date === 0 ? (
                        <>
                          <tr>
                            <td style={{ color: "green" }}>Chủ Nhật:</td>
                            <td style={{ color: "green" }}>8.30 - 21.30</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td>Chủ Nhật:</td>
                            <td>8.30 - 21.30</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="tin-tuc">
                <RecentBlogs></RecentBlogs>
              </div>
            </div>
          </div>
          <div className="branch-right">
            <MiniService />
            <MiniNews />
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};

export default BrancheDetail;
