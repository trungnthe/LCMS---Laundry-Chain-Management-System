import React, { useState, useEffect } from "react";
import "../../assets/css/user/subscription.css";
import Header from "../reuse/Header";
import { jwtDecode } from "jwt-decode";
import {
  fetchAllLaundrySubsByAccount,
  fetchLaundrySubsByAccount,
} from "../../services/subscription";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const SubscriptionPage = () => {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [showIframe, setShowIframe] = useState(false);
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

  const availablePackages = [
    {
      id: 1,
      packageName: "Gói 1 tháng",
      price: 399000.0,
      maxWeight: 20.0,
      description: "Phù hợp cho nhu cầu sử dụng ngắn hạn",
    },
    {
      id: 2,
      packageName: "Gói 3 tháng",
      price: 999000.0,
      maxWeight: 75.0,
      description: "Tiết kiệm hơn cho nhu cầu sử dụng dài hạn",
    },
    {
      id: 3,
      packageName: "Gói 6 tháng",
      price: 1799000.0,
      maxWeight: 180.0,
      description: "Phù hợp cho nhu cầu sử dụng dài hạn",
    },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        setPackages(availablePackages);

        const subscriptionData = await fetchAllLaundrySubsByAccount(userId);
        if (subscriptionData) setUserSubscriptions(subscriptionData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    let activeSubscriptions = [];

    if (userSubscriptions.length > 0) {
      activeSubscriptions = userSubscriptions?.filter(
        (x) => x.status !== "Expired"
      );
    }

    if (activeSubscriptions.length > 0) {
      toast.error("Bạn chỉ có thể đăng ký một gói tháng tại một thời điểm.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/Payment/createSubscription`,
        null,
        {
          params: {
            packageName: selectedPackage.packageName,
            currentUserId: userId,
            paymentType: "QRCode",
          },
        }
      );

      const { qrUrl } = response.data || {};

      if (qrUrl) {
        setPaymentUrl(qrUrl);
        setShowIframe(true);
        setTimer(180);
      } else {
        toast.error("Không thể tạo thanh toán. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Đã xảy ra lỗi khi tạo thanh toán.");
    }
  };

  useEffect(() => {
    // Create the connection
    const connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/signalHub`, {
        accessTokenFactory: () => localStorage.getItem("token"),
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    // Start connection
    connection
      .start()
      .then(() => {
        // Set up the event handler for payment updates
        connection.on("updatePayment", (action, status) => {
          if (action === "newPayment" && status === "Success") {
            toast.success("Thanh toán thành công!");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      })
      .catch((err) => {});

    // Cleanup function to stop connection and remove handlers
    return () => {
      connection.off("updatePayment");
      connection.stop();
    };
  }, []); // Empty dependency array means this runs once on component mount

  useEffect(() => {
    if (showIframe && paymentUrl) {
      const intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setShowIframe(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [showIframe, paymentUrl]);

  const formatNumber = (num) => {
    return num.toLocaleString("vi-VN");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <Header></Header>
      <div className="subscription-page">
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
        <div className="section">
          <h2>Gói tháng hiện tại của bạn</h2>
          {userSubscriptions.length > 0 ? (
            <div className="subscription-table-container">
              <table className="subscription-table">
                <thead>
                  <tr>
                    <th>Tên gói</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                    <th>Khối lượng tối đa</th>
                    <th>Khối lượng còn lại</th>
                    <th>Trạng thái</th>
                    <th>Giá tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {[...userSubscriptions]
                    .sort((a, b) => {
                      if (a.status === "Active" && b.status !== "Active")
                        return -1;
                      if (a.status !== "Active" && b.status === "Active")
                        return 1;
                      return 0;
                    })
                    .map((sub) => (
                      <tr key={sub.subscriptionId}>
                        <td>{sub.packageName}</td>
                        <td>{formatDate(sub.startDate)}</td>
                        <td>{formatDate(sub.endDate)}</td>
                        <td>{sub.maxWeight.toFixed(2)} kg</td>
                        <td style={{ color: "#1976d2", fontWeight: "500" }}>
                          {sub.remainingWeight.toFixed(2)} kg
                        </td>
                        <td>
                          <span
                            className={`status ${sub.status.toLowerCase()}`}
                          >
                            {sub.status === "Active" && "Có hiệu lực"}
                            {sub.status === "Expired" && "Đã hết hạn"}
                          </span>
                        </td>
                        <td>{formatNumber(sub.price)} VND</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">
              Bạn chưa có gói tháng nào. Hãy đăng ký gói tháng phù hợp với nhu
              cầu của bạn.
            </p>
          )}
        </div>

        <div className="section">
          <h2>Đăng ký gói tháng mới</h2>
          <div className="package-options">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`package-card ${
                  selectedPackage && selectedPackage.id === pkg.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => handlePackageSelect(pkg)}
              >
                <h3>{pkg.packageName}</h3>
                <div className="package-details">
                  <p>
                    <strong>Giá:</strong>{" "}
                    <span>{formatNumber(pkg.price)} VND</span>
                  </p>
                  <p>
                    <strong>Khối lượng tối đa:</strong>{" "}
                    <span>{pkg.maxWeight.toFixed(2)} kg</span>
                  </p>
                  {pkg.description && (
                    <p className="description">{pkg.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="purchase-section">
            <p
              style={{ fontSize: "15px", color: "#1976d2", fontWeight: "500" }}
            >
              Mua trực tiếp tại cơ sở hoặc thanh toán online tại đây
            </p>
            {selectedPackage ? (
              <div className="selected-package-info">
                <p>
                  Gói đã chọn: <strong>{selectedPackage.packageName}</strong>
                </p>
                <p>
                  Giá:{" "}
                  <strong>{formatNumber(selectedPackage.price)} VND</strong>
                </p>
              </div>
            ) : (
              <p>Vui lòng chọn gói tháng để tiếp tục</p>
            )}

            <button
              className="purchase-button"
              disabled={!selectedPackage || showIframe}
              onClick={handlePurchase}
            >
              Đăng ký ngay
            </button>

            {showIframe && paymentUrl && (
              <div
                className="payment-iframe-container"
                style={{ marginTop: "20px" }}
              >
                <h4>Thanh toán bằng QR Code</h4>
                <iframe
                  src={paymentUrl}
                  title="QR Payment"
                  width="100%"
                  height="500px"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    marginTop: "15px",
                  }}
                />
                <div className="timer">
                  <p>Thời gian còn lại: {formatTime(timer)}</p>
                </div>
                <button
                  onClick={handleCloseIframe}
                  style={{
                    top: "10px",
                    right: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Hủy thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
