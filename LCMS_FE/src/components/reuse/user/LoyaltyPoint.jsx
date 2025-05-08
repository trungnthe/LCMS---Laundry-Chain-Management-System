import React, { useEffect, useState, useMemo } from "react";
import "../../../assets/css/user/profile.css";
import { jwtDecode } from "jwt-decode";
import { fetchCustomerById } from "../../../services/account";

const LoyaltyPoint = () => {
  const [customer, setCustomer] = useState(null);

  // Lấy userId từ token
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded?.AccountId || null;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  useEffect(() => {
    if (!userId) return;

    fetchCustomerById(userId)
      .then((response) => {
        if (response) {
          setCustomer(response);
        }
      })
      .catch((error) => {});
  }, [userId]);

  const maxSilver = 1000000;
  const maxGold = 5000000;
  const maxDiamond = 10000000;

  const progress = useMemo(() => {
    if (customer?.membershipLevel == "Bronze") {
      return (customer.totalSpent / maxSilver) * 100;
    } else if (customer?.membershipLevel == "Gold") {
      return (customer.totalSpent / maxGold) * 100;
    } else if (customer?.membershipLevel == "Silver") {
      return (customer.totalSpent / maxDiamond) * 100;
    } else return 0;
  }, [customer]);

  return (
    <div>
      <div className="point-header">
        <div className="point-header-title">
          <h5>Tích điểm</h5>
          <h3>Xem điểm tích lũy của bạn</h3>
        </div>
        <div className="point-level">
          <h3>
            Thành viên{" "}
            <span>
              {customer?.membershipLevel === "Silver"
                ? "Bạc"
                : customer?.membershipLevel === "Gold"
                ? "Vàng"
                : customer?.membershipLevel === "Diamond"
                ? "Kim Cương"
                : "Đồng"}
            </span>
          </h3>
        </div>
      </div>
      <div className="point-container">
        <div className="point-progress">
          <div className="point-progress-header">
            <h3>
              Đang có: <span>{customer?.loyaltyPoints || 0} Điểm</span>
            </h3>
          </div>
        </div>
        <div className="slider-container">
          <div className="slider-content">
            <div className="slider-label">
              <h5>
                {customer?.membershipLevel === "Silver"
                  ? "Bạc"
                  : customer?.membershipLevel === "Gold"
                  ? "Vàng"
                  : customer?.membershipLevel === "Diamond"
                  ? "Kim Cương"
                  : "Đồng"}
              </h5>
              <h5>
                {customer?.membershipLevel === "Silver"
                  ? "Vàng"
                  : customer?.membershipLevel === "Gold"
                  ? "Kim Cương"
                  : customer?.membershipLevel === "Diamond"
                  ? "Kim Cương"
                  : "Bạc"}
              </h5>
            </div>
            <div className="slider">
              <div className="progress" style={{ width: `${progress}%` }}></div>
              <div className="thumb" style={{ left: `${progress}%` }}></div>
            </div>
          </div>
          <div className="slider-point">
            {customer?.membershipLevel === "Bronze" ? (
              <h4>
                {" "}
                Còn {maxSilver - (customer?.totalSpent || 0)} vnđ nữa bạn sẽ
                thăng hạng.
              </h4>
            ) : (
              <></>
            )}
            {customer?.membershipLevel === "Silver" ? (
              <h4>
                {" "}
                Còn {maxGold - (customer?.totalSpent || 0)} vnđ nữa bạn sẽ thăng
                hạng.
              </h4>
            ) : (
              <></>
            )}
            {customer?.membershipLevel === "Gold" ? (
              <h4>
                {" "}
                Còn {maxDiamond - (customer?.totalSpent || 0)} vnđ nữa bạn sẽ
                thăng hạng.
              </h4>
            ) : (
              <></>
            )}
            <h4>Sử dụng điểm không ảnh hưởng tới việc thăng hạng của bạn.</h4>
          </div>
        </div>
      </div>
      <div className="point-list"></div>
    </div>
  );
};

export default LoyaltyPoint;
