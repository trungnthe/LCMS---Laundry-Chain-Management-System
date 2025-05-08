import { useEffect, useRef, useState } from "react";
import "../../assets/css/user/checkout.css";
import Header from "../reuse/Header";
import { fetchCart } from "../../services/cart";
import { fetchBranchById, fetchBranches } from "../../admin/manage_branches";
import { fetchServices } from "../../admin/manage_service";
import { createBookingFromCart } from "../../services/booking";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPopularBookingSuggestions } from "../../services/suggestion";

const CheckoutPage = () => {
  const [deliveryType, setDeliveryType] = useState("");
  const [pickupType, setPickupType] = useState("");
  const [branchId, setBranchId] = useState(null);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [branches, setBranches] = useState([]);
  const [isOverloadedModalOpen, setIsOverloadedModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [service, setService] = useState([]);
  const [branch, setBranch] = useState();
  const [note, setNote] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [popularSuggestions, setPopularSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDeliverySuggestions, setShowDeliverySuggestions] = useState(false);
  const token = localStorage.getItem("token");
  const branchRef = useRef(null);
  const pickupAddressRef = useRef(null);
  const deliveryAddressRef = useRef(null);
  let decodedToken;
  const navigate = useNavigate();

  if (token) {
    decodedToken = jwtDecode(token);
  } else {
  }

  const fetchSuggestions = async () => {
    try {
      const suggestions = await fetchPopularBookingSuggestions(
        decodedToken.AccountId,
        "Pickup",
        "HomeDelivery"
      );
      setPopularSuggestions(suggestions);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSuggestions();
    fetchCart()
      .then((data) => {
        setCart(data);

        if (data.length === 0) {
          navigate("/user/booking");
        }
      })
      .catch((error) => {});

    fetchServices()
      .then((data) => {
        setService(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});

    fetchBranches()
      .then((data) => {
        setBranches(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});

    fetchSuggestions();
  }, [navigate]);

  const handleClickBranch = (branchId, status) => {
    setIsBranchOpen(false);

    if (status === "Không hoạt động") {
      return toast.error("Cơ sở này đang đóng cửa", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }

    if (status === "Quá tải") {
      setIsOverloadedModalOpen(true);
      return;
    }

    setBranchId(branchId);
  };

  const handleClickBranchOutside = (event) => {
    if (branchRef.current && !branchRef.current.contains(event.target)) {
      setIsBranchOpen(false);
    }
  };

  const handleClickPickupAddressOutside = (event) => {
    if (
      pickupAddressRef.current &&
      !pickupAddressRef.current.contains(event.target)
    ) {
      setShowPickupSuggestions(false);
    }
  };

  const handleClickDeliveryAddressOutside = (event) => {
    if (
      deliveryAddressRef.current &&
      !deliveryAddressRef.current.contains(event.target)
    ) {
      setShowDeliverySuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickBranchOutside);
    document.addEventListener("click", handleClickPickupAddressOutside);
    document.addEventListener("click", handleClickDeliveryAddressOutside);

    return () => {
      document.removeEventListener("click", handleClickBranchOutside);
      document.removeEventListener("click", handleClickPickupAddressOutside);
      document.removeEventListener("click", handleClickDeliveryAddressOutside);
    };
  }, []);

  const toggleBranchDropdown = () => {
    setIsBranchOpen(!isBranchOpen);
  };

  useEffect(() => {
    if (branchId) {
      selectedFacility();
    }
  }, [branchId]);

  const selectedFacility = async () => {
    try {
      const res = await fetchBranchById(branchId);
      if (res) {
        setBranch(res);
      }
    } catch (error) {}
  };

  useEffect(() => {
    let timer;
    if (isSuccessModalOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSuccessModalOpen && countdown === 0) {
      navigate("/user/profile/booking-history");
    }
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen, countdown, navigate]);

  const handleCheckOut = async () => {
    if (!branchId) {
      return toast.error("Vui lòng chọn cơ sở giặt", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }

    if (pickupType === "Pickup" && !pickupAddress.trim()) {
      return toast.error("Vui lòng nhập địa chỉ lấy đồ", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }

    if (deliveryType === "HomeDelivery" && !deliveryAddress.trim()) {
      return toast.error("Vui lòng nhập địa chỉ giao đồ", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }

    if (!note.trim()) {
      return toast.error("Vui lòng nhập ghi chú để xác nhận số lượng đồ", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }

    const bookingData = {
      branchId: branchId,
      note: note,
      deliveryAddress: deliveryAddress,
      pickupAddress: pickupAddress,
      laundryType: pickupType,
      deliveryType: deliveryType,
    };

    const res = await createBookingFromCart(bookingData);
    if (res) {
      setIsSuccessModalOpen(true);
      setCountdown(3);
    }
  };

  const selectSuggestion = (address, type) => {
    if (type === "pickup") {
      setPickupAddress(address);
      setShowPickupSuggestions(false);
    } else {
      setDeliveryAddress(address);
      setShowDeliverySuggestions(false);
    }
  };

  const storeNotifications = [
    "Nhân viên sẽ xác nhận đơn hàng và gửi lại thông báo cho bạn sớm nhất có thể",
    "Ghi đúng mô tả quần áo để chúng tôi có thể giảm thiểu mất lạc đồ cho bạn ",
  ];

  const filteredPickupSuggestions = popularSuggestions?.pickupAddresses?.filter(
    (s) => s.address.toLowerCase().includes(pickupAddress.toLowerCase())
  );

  const filteredDeliverySuggestions =
    popularSuggestions?.deliveryAddresses?.filter((s) =>
      s.address.toLowerCase().includes(deliveryAddress.toLowerCase())
    );

  return (
    <>
      <Header></Header>
      <div className="checkout-container">
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
        <h1 className="checkout-title">Hoàn thành đơn hàng của bạn</h1>

        {/* Selected Services Section */}
        <div className="checkout-section checkout-services-section">
          <h2 className="checkout-section-title">Dịch vụ đã chọn</h2>
          <div className="checkout-services-list">
            {cart.map((c) => (
              <div key={c.itemId} className="checkout-service-item">
                <div className="checkout-service-image-container">
                  <img
                    src={
                      service.find((x) => x.serviceId == c.serviceId)?.image ||
                      "/placeholder.svg"
                    }
                    alt={c.serviceName}
                    className="checkout-service-image"
                  />
                </div>
                <div className="checkout-service-details">
                  {c.productName ? (
                    <span className="checkout-service-name">
                      {c.serviceName} - {c.productName}
                    </span>
                  ) : (
                    <span className="checkout-service-name">
                      {c.serviceName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Selection Section */}
        <div className="checkout-section checkout-branch-section">
          <div className="book-choose-branch">
            <p>Chọn cơ sở giặt: </p>
            <div className="dropdown-branch">
              <div className="dropdown-button-branch" ref={branchRef}>
                <button
                  className="dropdown-btn-branch"
                  onClick={toggleBranchDropdown}
                >
                  {branchId !== null ? (
                    <>
                      {
                        branches.find((x) => x.branchId === branchId)
                          ?.branchName
                      }{" "}
                      - {branches.find((x) => x.branchId === branchId)?.address}
                    </>
                  ) : (
                    <>Ấn vào để chọn cơ sở giặt</>
                  )}
                </button>
              </div>
              {isOverloadedModalOpen && (
                <div className="modal-overlay">
                  <div className="modal-content animate-fade-in">
                    <div className="modal-header">
                      <h3>⚠️ Quá tải</h3>
                      <button
                        className="close-btn"
                        onClick={() => setIsOverloadedModalOpen(false)}
                      >
                        ✖
                      </button>
                    </div>
                    <div className="modal-body">
                      <h4>
                        🚨 Chi nhánh này hiện đang quá tải. Vui lòng quay lại
                        sau hoặc chọn một cơ sở khác.
                      </h4>
                      <h5>Chúng tôi thật sự xin lỗi vì sự bất tiện này</h5>
                    </div>
                    <div className="modal-footer">
                      <button
                        className="modal-btn"
                        onClick={() => setIsOverloadedModalOpen(false)}
                      >
                        OK, tôi hiểu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <ul
                className={`dropdown-menu-branch ${isBranchOpen ? "show" : ""}`}
              >
                {branches.map((pt) => {
                  const isClosed = pt.status === "Đóng Cửa";
                  return (
                    <li
                      key={pt.branchId}
                      className={`dropdown-item-branch ${
                        isClosed ? "disabled" : ""
                      }`}
                      onClick={() => {
                        if (!isClosed) {
                          handleClickBranch(pt.branchId, pt.status);
                        }
                      }}
                    >
                      <img
                        src={pt.image || "https://via.placeholder.com/40"}
                        alt="Branch"
                        className="branch-image-branch"
                      />
                      <div className="branch-info-branch">
                        <span>
                          {pt.branchName} - {pt.address}
                        </span>
                        <div
                          className={`status-branch ${
                            pt.status === "Đóng Cửa" && pt.status !== "Bảo Trì"
                              ? "status-closed-branch"
                              : pt.status === "Quá tải"
                              ? "status-overloaded-branch"
                              : "status-open-branch"
                          }`}
                        >
                          {pt.status === "Không hoạt động"
                            ? "🔴 Đã đóng cửa"
                            : pt.status === "Quá tải"
                            ? "🟠 Quá tải"
                            : "🟢 Đang mở cửa"}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Two-column layout for facility and options */}
        <div className="checkout-grid">
          <div className="checkout-section checkout-facility-section">
            <h2 className="checkout-section-title">Chi tiết cơ sở</h2>
            <div className="checkout-facility-details">
              <p className="checkout-facility-name">
                Tên cơ sở: {branch?.branchName}
              </p>
              <p className="checkout-facility-address">
                Địa chỉ: {branch?.address}
              </p>
              <p className="checkout-facility-phone">
                Số điện thoại: {branch?.phoneNumber}
              </p>
            </div>
          </div>

          {/* Store Notifications Section */}
          <div className="checkout-section checkout-notifications-section">
            <h2 className="checkout-section-title">Thông báo</h2>
            <div className="checkout-notifications-list">
              {storeNotifications.map((notification, index) => (
                <div key={index} className="checkout-notification-item">
                  <span className="checkout-notification-icon">ℹ️</span>
                  <p className="checkout-notification-text">{notification}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery and Pickup Options Section */}
        <div className="checkout-section checkout-options-section">
          <h2 className="checkout-section-title">
            Lựa chọn phương thức lấy nhận đồ
          </h2>
          <p className="checkout-message">
            * Phí giao nhận hàng sẽ được nhân viên cập nhập dựa trên khoảng cách
            giữa đỉa chỉ giao nhận hàng và cửa hàng (free ship dưới 2km, trên
            2km tính 5.000/km )
          </p>

          <div className="checkout-form-row">
            <div className="checkout-form-group">
              <label className="checkout-label">Phương thức lấy đồ:</label>
              <select
                className="checkout-select"
                value={pickupType}
                onChange={(e) => setPickupType(e.target.value)}
              >
                <option value="None">Tự mang đến cửa hàng</option>
                <option value="Pickup">Lấy tận nhà</option>
              </select>
            </div>

            <div className="checkout-form-group">
              <label className="checkout-label">Phương thức nhận đồ:</label>
              <select
                className="checkout-select"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
              >
                <option value="None">Tự đến lấy</option>
                <option value="HomeDelivery">Giao tận nhà</option>
              </select>
            </div>
          </div>

          <div className="checkout-form-row">
            {pickupType === "Pickup" && (
              <div className="checkout-form-group" ref={pickupAddressRef}>
                <label className="checkout-label">Địa chỉ lấy đồ:</label>
                <input
                  type="text"
                  className="checkout-textarea"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  onFocus={() => setShowPickupSuggestions(true)}
                  placeholder="Nhập địa chỉ lấy đồ của bạn"
                  required
                />
                {showPickupSuggestions &&
                  filteredPickupSuggestions?.length > 0 && (
                    <div className="address-suggestions">
                      <h4 className="suggestions-title">Địa chỉ gợi ý:</h4>
                      <ul className="suggestions-list">
                        {filteredPickupSuggestions?.map((suggestion, index) => (
                          <li
                            key={index}
                            className="suggestion-item"
                            onClick={() =>
                              selectSuggestion(suggestion.address, "pickup")
                            }
                          >
                            {suggestion.address}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {deliveryType === "HomeDelivery" && (
              <div className="checkout-form-group" ref={deliveryAddressRef}>
                <label className="checkout-label">Địa chỉ giao đồ:</label>
                <input
                  type="text"
                  className="checkout-textarea"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  onFocus={() => setShowDeliverySuggestions(true)}
                  placeholder="Nhập địa chỉ giao đồ của bạn"
                  required
                />
                {showDeliverySuggestions &&
                  filteredDeliverySuggestions?.length > 0 && (
                    <div className="address-suggestions">
                      <h4 className="suggestions-title">Địa chỉ gợi ý:</h4>
                      <ul className="suggestions-list">
                        {filteredDeliverySuggestions?.map(
                          (suggestion, index) => (
                            <li
                              key={index}
                              className="suggestion-item"
                              onClick={() =>
                                selectSuggestion(suggestion.address, "delivery")
                              }
                            >
                              {suggestion.address}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Note Section */}
        <div className="checkout-section checkout-note-section">
          <h2 className="checkout-section-title">Ghi chú</h2>
          <textarea
            className="checkout-textarea checkout-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="⚠ Vui lòng ghi chính xác số đồ khách mang đến. Nếu có mất mát, cửa hàng sẽ không chịu trách nhiệm."
            required
          />
        </div>

        {/* Checkout Button */}
        <div className="checkout-section checkout-submit-section">
          <button
            className="checkout-submit-button"
            onClick={() => handleCheckOut()}
          >
            Xác nhận đặt hàng
          </button>
        </div>
      </div>

      {/* Success Modal with Countdown */}
      {isSuccessModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3>Đặt hàng thành công</h3>
            </div>
            <div className="modal-body">
              <h4>Đơn hàng của bạn đã được tạo thành công!</h4>
              <p>Bạn sẽ được chuyển về trang đơn hàng sau {countdown} giây</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
