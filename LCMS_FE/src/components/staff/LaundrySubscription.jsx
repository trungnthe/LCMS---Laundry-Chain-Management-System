import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/staff/subcription.css";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";

import Header from "../reuse/Header_Staff.jsx";
import {
  FaSearch,
  FaUserPlus,
  FaTicketAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaCheck,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllCustomer,
  registerForCustomerByEmployee,
  createPaymentSubscription,
  cancelPayment,
} from "../../services/fetchApiStaff.js";
const LaundryTicketStaffRegistration = () => {
  // Khởi tạo state
  const [qrUrl, setQrUrl] = useState(""); // State lưu URL thanh toán
  const [paymentId, setPaymentId] = useState(""); // State lưu URL thanh toán

  const [loadingModalPayment, setLoadingModalPayment] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(1); // 1, 3, hoặc 6 tháng
  const [startDate, setStartDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("TienMat");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundCustomers, setFoundCustomers] = useState([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanTitle, setCurrentPlan] = useState("Gói 1 tháng");

  // Dữ liệu các gói vé
  const ticketPlans = [
    {
      id: 1,
      title: "Gói 1 tháng",
      months: 1,
      price: 399000,
      savings: null,
      benefits: [
        "Ưu tiên đặt lịch",
        "Giao nhận tận nơi (3 lần/tháng)",
        "Bảo hành quần áo cơ bản",
        "Giặt tối đa 20 kg/tháng",
      ],
      icon: "⭐",
    },
    {
      id: 2,
      title: "Gói 3 tháng",
      months: 3,
      price: 999000, // Tăng nhẹ để đảm bảo lợi nhuận
      savings: "16%", // (399000*3 - 999000)/(399000*3) ≈ 16%
      benefits: [
        "Ưu tiên đặt lịch cao cấp",
        "Giao nhận tận nơi (6 lần/tháng)",
        "Bảo hành quần áo nâng cao",
        "Giặt tối đa 25 kg/tháng (75kg)",
      ],
      icon: "⭐⭐",
    },
    {
      id: 3,
      title: "Gói 6 tháng",
      months: 6,
      price: 1799000, // Giảm nhẹ để hấp dẫn hơn
      savings: "25%", // (399000*6 - 1799000)/(399000*6) ≈ 25%
      benefits: [
        "Ưu tiên đặt lịch VIP",
        "Giao nhận tận nơi không giới hạn",
        "Giặt tối đa 30 kg/tháng (180kg)",
        "Làm mới 2 bộ quần áo miễn phí",
      ],
      icon: "⭐⭐⭐",
    },
  ];

  // Thiết lập ngày mặc định là ngày hiện tại khi component mount
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    setStartDate(formattedDate);
  }, []);

  // Tìm plan hiện tại
  const currentPlan = ticketPlans.find((plan) => plan.months === selectedPlan);

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Format ngày kiểu Việt Nam
  const formatDateVN = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Tính ngày kết thúc
  const calculateEndDate = () => {
    if (!startDate) return "--/--/----";

    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + selectedPlan);

    return formatDateVN(end);
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomer();
      setCustomersList(data);
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tìm kiếm khách hàng
  const searchCustomer = () => {
    if (!searchQuery?.trim()) {
      toast.error("Vui lòng nhập thông tin tìm kiếm");
      return;
    }

    setIsSearching(true);

    // Mô phỏng tìm kiếm từ database
    setTimeout(() => {
      const results = customersList.filter((customer) => {
        const customerName = customer.customerName?.toLowerCase() || "";
        const email = customer.email?.toLowerCase() || "";
        const phoneNumber = customer.phoneNumber || "";

        const customerNameMatch = customerName.includes(
          searchQuery.toLowerCase()
        );
        const phoneNumberMatch = phoneNumber.includes(searchQuery); // Số điện thoại có thể có định dạng khác
        const emailMatch = email.includes(searchQuery.toLowerCase());

        return customerNameMatch || phoneNumberMatch || emailMatch;
      });

      setFoundCustomers(results);
      setIsSearching(false);

      if (results.length === 0) {
        toast.info("Không tìm thấy khách hàng, vui lòng thêm mới");
      }
    }, 800);
  };

  // Chọn khách hàng từ kết quả tìm kiếm
  const selectCustomer = (customer) => {
    setCustomerId(customer.accountId);
    setCustomerName(customer.customerName);
    setCustomerPhone(customer.phoneNumber);
    setCustomerEmail(customer.email);
    setFoundCustomers([]);
    setSearchQuery("");
    toast.success("Đã chọn khách hàng");
  };
  const handleRegisterCustomer = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    // Validate phone (bắt đầu bằng số và có 9–11 chữ số)
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(customerPhone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    // Gửi request đăng ký
    const response = await registerForCustomerByEmployee(
      customerName,
      customerPhone,
      customerEmail,
      "123456" // hoặc tạo ngẫu nhiên nếu cần
    );

    if (response?.status === 200) {
      toast.success("Thêm khách hàng thành công!");
      setIsNewCustomer(false);
      setCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      // gọi hàm load lại danh sách nếu có
      await fetchData();
    } else {
      toast.error(response?.data || "Đăng ký thất bại");
    }
  };

  // Bắt đầu thêm khách hàng mới
  const startAddNewCustomer = () => {
    setIsNewCustomer(true);
    setCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setFoundCustomers([]);
  };

  // Hủy thêm khách hàng mới
  const cancelAddNewCustomer = () => {
    setIsNewCustomer(false);
  };

  // Xử lý đăng ký vé
  const handleCancel = async (paymentId) => {
    try {
      console.log("Đang hủy thanh toán với ID:", paymentId);

      const result = await cancelPayment(paymentId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Hủy thành công!");
      }
    } catch (error) {
    } finally {
      console.log("Đã xử lý xong hủy thanh toán.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingModalPayment(true); // Bắt đầu loading

    try {
      // Chuẩn bị dữ liệu
      console.log(currentPlanTitle);
      const packageName = currentPlanTitle;
      const currentUserId = customerId;
      const paymentTypeParam =
        paymentMethod === "TienMat" ? "TienMat" : "QRCode";

      // Gọi API thanh toán
      const result = await createPaymentSubscription(
        packageName,
        currentUserId,
        paymentTypeParam
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        if (paymentMethod === "QRCode") {
          setQrUrl(result.qrUrl); // Nếu thanh toán bằng QRCode, hiển thị mã
          setPaymentId(result.orderCode);
        } else {
          toast.success("Thanh toán thành công!");
        }
      }
    } catch (error) {
    } finally {
      setLoadingModalPayment(false); // Kết thúc loading
    }
  };
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/signalHub", {
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => localStorage.getItem("token"), // nếu bạn có dùng JWT
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected ✅");

        // Lắng nghe sự kiện từ server
        connection.on("updatePayment", (action, status) => {
          console.log(`Payment update received: ${action}, ${status}`);

          if (action === "newPayment" && status === "Success") {
            toast.success("Thanh toán thành công!");
            setTimeout(() => {
              setQrUrl("");
            }, 0);
          }
        });
      })
      .catch((err) => {
        console.error("❌ SignalR connection error:", err);
      });

    // Cleanup khi component unmount
    return () => {
      connection.stop();
    };
  }, []); // Empty dependency array means this runs once on component mount
  const closeModal = () => {
    handleCancel(paymentId);
    setQrUrl("");
  };

  return (
    <>
      <Header />
      <div className="laundry-ticket-staff-container">
        <ToastContainer position="top-right" theme="colored" />

        <div className="laundry-ticket-staff-header">
          <h1>
            <FaTicketAlt className="icon-header" /> Đăng Ký Gói Tháng
          </h1>
          <p>
            Đăng ký gói tháng cho khách hàng - tiết kiệm chi phí cho khách hàng
            sử dụng nhiều
          </p>
        </div>

        <div className="laundry-ticket-staff-form">
          <div className="laundry-ticket-staff-card">
            <div className="card-header">
              <h3>
                <FaUserPlus /> Thông tin đăng ký
              </h3>
            </div>
            {!isNewCustomer && (
              <div className="laundry-ticket-staff-search-container">
                <div className="laundry-ticket-staff-form-group">
                  <label className="laundry-ticket-staff-label">
                    Tìm kiếm khách hàng
                  </label>
                  <div className="search-input-container">
                    <input
                      type="text"
                      className="laundry-ticket-staff-input"
                      placeholder="Nhập tên, số điện thoại hoặc email khách hàng"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && searchCustomer()}
                    />
                    <button
                      className="search-button"
                      onClick={searchCustomer}
                      disabled={isSearching}
                    >
                      {isSearching ? "..." : <FaSearch />}
                    </button>
                  </div>
                </div>

                {foundCustomers.length > 0 && (
                  <div className="search-results">
                    <h4>Kết quả tìm kiếm:</h4>
                    <ul>
                      {foundCustomers.map((customer) => (
                        <li
                          key={customer.accountId}
                          onClick={() => selectCustomer(customer)}
                        >
                          <strong>{customer.customerName}</strong>
                          <div>
                            {customer.phoneNumber} | {customer.email}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="new-customer-action">
                  <button
                    className="new-customer-button"
                    onClick={startAddNewCustomer}
                  >
                    <FaUserPlus /> Thêm khách hàng mới
                  </button>
                </div>
              </div>
            )}

            {(isNewCustomer || customerName) && (
              <div className="customer-info-section">
                <div className="section-header">
                  <h4>
                    {isNewCustomer
                      ? "Thêm khách hàng mới"
                      : "Thông tin khách hàng"}
                  </h4>
                  {isNewCustomer && (
                    <button
                      className="cancel-button"
                      onClick={cancelAddNewCustomer}
                    >
                      Hủy
                    </button>
                  )}
                </div>

                <div className="laundry-ticket-staff-form-group">
                  <input
                    type="text"
                    className="laundry-ticket-staff-input"
                    placeholder="Họ và tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="laundry-ticket-staff-form-group">
                  <input
                    type="text"
                    className="laundry-ticket-staff-input"
                    placeholder="Số điện thoại"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="laundry-ticket-staff-form-group">
                  <input
                    type="email"
                    className="laundry-ticket-staff-input"
                    placeholder="Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                {/* Nút Submit */}
                {isNewCustomer && (
                  <div className="laundry-ticket-staff-form-group">
                    <button
                      className="submit-button"
                      onClick={handleRegisterCustomer}
                    >
                      Xác nhận thêm khách hàng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="laundry-ticket-staff-card">
            <div className="card-header">
              <h3>
                <FaTicketAlt /> Chọn gói tháng
              </h3>
            </div>

            <div className="laundry-ticket-staff-ticket-options">
              {ticketPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`laundry-ticket-staff-ticket-option ${
                    selectedPlan === plan.months ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedPlan(plan.months); // Cập nhật selectedPlan
                    setCurrentPlan(plan.title); // Lưu toàn bộ thông tin plan vào state
                  }}
                >
                  <div className="ticket-plan-icon">{plan.icon}</div>
                  <h3>{plan.title}</h3>
                  <div className="price">{formatPrice(plan.price)}</div>
                  <div className="benefits">
                    <div className="benefit-item">✓ Giặt không giới hạn</div>
                    {plan.benefits.map((benefit, index) => (
                      <div key={index} className="benefit-item">
                        ✓ {benefit}
                      </div>
                    ))}
                  </div>
                  {plan.savings && (
                    <div className="savings">Tiết kiệm {plan.savings}</div>
                  )}
                  {selectedPlan === plan.months && (
                    <div className="selected-badge">
                      <FaCheck /> Đã chọn
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="laundry-ticket-staff-card">
            <div className="card-header">
              <h3>
                <FaCalendarAlt /> Thanh toán
              </h3>
            </div>

            <div className="laundry-ticket-staff-payment-row">
              <div className="laundry-ticket-staff-form-group">
                <label className="laundry-ticket-staff-label">
                  Phương thức thanh toán
                </label>
                <select
                  className="laundry-ticket-staff-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {" "}
                  <option value="">Chọn phương thức</option>
                  <option value="TienMat">Tiền mặt</option>
                  <option value="QRCode">Thanh toán chuyển khoản</option>
                </select>
              </div>
            </div>

            <div className="laundry-ticket-staff-summary">
              <h3>Thông tin thanh toán</h3>
              <div className="laundry-ticket-staff-summary-row">
                <span>Tiêu đề:</span>
                <span>{currentPlan.title}</span>
              </div>
              <div className="laundry-ticket-staff-summary-row">
                <span>Thời hạn:</span>
                <span>{currentPlan.months} tháng</span>
              </div>
              <div className="laundry-ticket-staff-summary-row">
                <span>Ngày bắt đầu:</span>
                <span>
                  {startDate ? formatDateVN(startDate) : "--/--/----"}
                </span>
              </div>
              <div className="laundry-ticket-staff-summary-row">
                <span>Ngày kết thúc:</span>
                <span>{calculateEndDate()}</span>
              </div>
              <div className="laundry-ticket-staff-summary-row total">
                <span>Tổng tiền:</span>
                <span>{formatPrice(currentPlan.price)}</span>
              </div>
            </div>
          </div>

          <button
            className={`laundry-ticket-staff-button ${
              !customerName ? "disabled" : ""
            }`}
            onClick={handleSubmit}
            disabled={loadingModalPayment || !customerName}
          >
            <FaTicketAlt />{" "}
            {loadingModalPayment ? "Đang xử lý..." : "Đăng kí vé"}
          </button>
          {showSuccess && (
            <div className="laundry-ticket-staff-success">
              <FaCheck /> Đăng ký vé tháng thành công! Mã vé đã được gửi đến
              email và tin nhắn của khách hàng.
            </div>
          )}
          {qrUrl && (
            <div className="custom-modal">
              <div className="custom-modal-content">
                <h2>Thanh toán QR Code</h2>
                <iframe
                  src={qrUrl}
                  width="100%"
                  height="700px"
                  frameBorder="0"
                  title="QR Payment"
                />
                <button onClick={closeModal}>Đóng</button>
              </div>
            </div>
          )}
          {showError && (
            <div className="laundry-ticket-staff-error">{errorMessage}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default LaundryTicketStaffRegistration;
