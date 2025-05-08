import React, { useEffect, useRef, useState } from "react";
import "../../../assets/css/user/profile.css";
import { BsDot, BsShop } from "react-icons/bs";
import {
  fetchBookingHistoryByCustomerId,
  fetchBookingHistoryByCustomerIdAndPayment,
} from "../../../services/bookingHistory";
import { jwtDecode } from "jwt-decode";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchServices } from "../../../admin/manage_service";
import * as signalR from "@microsoft/signalr";
import { fetchProducts } from "../../../admin/manage_product";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { fetchPaymentById } from "../../../services/payment";

const BookingHistory = () => {
  const [bookingHistory, setBookingHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const statusWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const token = localStorage.getItem("token");
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedButton, setSelectedButton] = useState("All");
  const apiUrl = import.meta.env.VITE_API_URL;
  let userId;

  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.AccountId;
  }

  useEffect(() => {
    if (location.state) {
      setSelectedButton(location.state);
    } else {
      setSelectedButton("All");
    }
    fetchBookingHistoryByCustomerIdAndPayment(userId).then(setBookingHistory);
    handleScrollToTopClick();
  }, [location.state, userId]);

  const handleButtonClick = (buttonType) => {
    setSelectedButton(buttonType);
  };

  const handleScrollToTopClick = () => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleBranchView = (branchId) => {
    navigate(`/user/branches/${branchId}`);
  };

  const handleBookingHistoryDetail = (bookingId) => {
    const bookingById = bookingHistory.find(
      (x) => Number(x.bookingId) === Number(bookingId)
    );
    navigate(`/user/profile/booking-history/${bookingId}`, {
      state: { bookingById },
    });
  };

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {});

    fetchBookingHistoryByCustomerIdAndPayment(userId)
      .then(setBookingHistory)
      .catch((err) => {});

    fetchServices().then(setServices).catch(console.error);

    // Kết nối SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/signalHub`)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {})
      .catch();

    // Nhận sự kiện "receiveupdate"
    connection.on("receiveupdate", (event, data) => {
      if (event === "NewBooking" || event === "UpdateBookingDetail") {
        fetchBookingHistoryByCustomerIdAndPayment(userId).then(
          setBookingHistory
        );
      }
    });

    return () => {
      connection.stop();
    };
  }, [userId]);

  const statusButtons = [
    { id: "All", label: "Tất cả" },
    { id: "Pending", label: "Chờ xác nhận" },
    { id: "Confirmed", label: "Đã xác nhận" },
    { id: "InProgress", label: "Đang xử lý" },
    { id: "Completed", label: "Đã giặt xong" },
    { id: "Delivering", label: "Đang giao hàng" },
    { id: "Done", label: "Đã hoàn thành" },
    { id: "Canceled", label: "Đã hủy" },
    { id: "Rejected", label: "Bị từ chối" },
  ];

  const safeBookingHistory = Array.isArray(bookingHistory)
    ? bookingHistory
    : [];

  const filteredBookings =
    selectedButton === "All"
      ? safeBookingHistory
      : safeBookingHistory.filter(
          (bh) =>
            bh.status === statusButtons.find((s) => s.id === selectedButton)?.id
        );

  useEffect(() => {
    if (
      statusWrapperRef.current &&
      containerRef.current &&
      selectedButton !== "All"
    ) {
      const selectedIndex = statusButtons.findIndex(
        (button) => button.id === selectedButton
      );
      if (selectedIndex > 0) {
        const buttonElements = statusWrapperRef.current.children;
        if (buttonElements && buttonElements.length > selectedIndex) {
          let position = 0;
          for (let i = 0; i < selectedIndex; i++) {
            position += buttonElements[i].offsetWidth;
          }

          const containerWidth = containerRef.current.offsetWidth;
          const buttonWidth = buttonElements[selectedIndex].offsetWidth;
          position = Math.max(
            0,
            position - containerWidth / 2 + buttonWidth / 2
          );

          const maxScroll =
            statusWrapperRef.current.offsetWidth -
            containerRef.current.offsetWidth;
          position = Math.min(position, maxScroll);

          setScrollPosition(position);
          statusWrapperRef.current.style.transform = `translateX(-${position}px)`;
        }
      }
    }
  }, [selectedButton]);

  const scrollLeft = () => {
    if (statusWrapperRef.current && containerRef.current) {
      const scrollAmount = containerRef.current.offsetWidth;
      const newPosition = Math.max(scrollPosition - scrollAmount, 0);
      setScrollPosition(newPosition);
      statusWrapperRef.current.style.transform = `translateX(-${newPosition}px)`;
    }
  };

  const scrollRight = () => {
    if (statusWrapperRef.current && containerRef.current) {
      const maxScroll =
        statusWrapperRef.current.offsetWidth - containerRef.current.offsetWidth;
      const scrollAmount = containerRef.current.offsetWidth;
      const newPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
      setScrollPosition(newPosition);
      statusWrapperRef.current.style.transform = `translateX(-${newPosition}px)`;
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight =
    statusWrapperRef.current && containerRef.current
      ? statusWrapperRef.current.offsetWidth -
          containerRef.current.offsetWidth >
        scrollPosition
      : false;

  if (bookingId) {
    return <Outlet></Outlet>;
  }

  return (
    <div>
      <div className="my-profile-header">
        <h5>Đơn hàng của bạn</h5>
        <h3>Xem lịch sử đơn hàng và theo dõi đơn hàng của bạn</h3>
      </div>
      <div className="booking-container">
        <div className="booking-status-header-container">
          <div className="booking-status-header" ref={containerRef}>
            <div className="booking-status-wrapper" ref={statusWrapperRef}>
              {statusButtons.map((button) => (
                <div
                  key={button.id}
                  className={`booking-status ${
                    selectedButton === button.id ? "selected" : ""
                  }`}
                  onClick={() => handleButtonClick(button.id)}
                >
                  <h4>{button.label}</h4>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`nav-button nav-button-left ${
              !canScrollLeft ? "nav-button-disabled" : ""
            }`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <FaChevronLeft />
          </button>

          <button
            className={`nav-button nav-button-right ${
              !canScrollRight ? "nav-button-disabled" : ""
            }`}
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="booking-content">
          <div className="booking-list">
            {filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings
                .sort(
                  (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
                )
                .map((bh) => (
                  <div className="booking-list-content" key={bh.bookingId}>
                    <div className="booking-list-content-header">
                      <div className="booking-list-content-header-left">
                        <BsShop />
                        <h4>Chi nhánh: {bh.branchName}</h4>
                        <button onClick={() => handleBranchView(bh.branchId)}>
                          Xem Cơ Sở
                        </button>
                      </div>
                      <div className="booking-list-content-header-right">
                        <h5>{bh.status}</h5>
                      </div>
                    </div>

                    <div
                      className="booking-detail-list"
                      onClick={() => handleBookingHistoryDetail(bh.bookingId)}
                    >
                      {bh.details.map((d) => (
                        <React.Fragment key={d.bookingDetailId}>
                          <div className="booking-detail-container">
                            <div className="booking-detail-content">
                              <div className="booking-detail-image">
                                <img
                                  src={
                                    services.find(
                                      (x) => x.serviceId == d.serviceId
                                    )?.image || "/placeholderimage.png"
                                  }
                                  alt="Service"
                                />
                              </div>
                              <div className="booking-detail-text">
                                <h3>
                                  Dịch vụ <span>{d.serviceName}</span>
                                </h3>

                                {services.find(
                                  (x) => x.serviceId == d.serviceId
                                )?.serviceTypeId != 2 ? (
                                  <p>
                                    {d.weight
                                      ? d.weight + " kg"
                                      : "Cập nhật sau"}{" "}
                                  </p>
                                ) : (
                                  <p>
                                    {d.productName || "\u00A0"} -
                                    {d.quantity || "\u00A0"} cái{" "}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="booking-detail-price">
                              {services.find((x) => x.serviceId == d.serviceId)
                                ?.serviceTypeId != 2 ? (
                                <p>
                                  {d.weight > 0 ? (
                                    <>
                                      {new Intl.NumberFormat("vi-VN").format(
                                        d?.price || 0
                                      )}{" "}
                                      vnđ
                                    </>
                                  ) : (
                                    "Cập nhật sau"
                                  )}
                                </p>
                              ) : (
                                <p>
                                  {new Intl.NumberFormat("vi-VN").format(
                                    d?.price || 0
                                  )}{" "}
                                  vnđ
                                </p>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>

                    {bh.status == "Completed" ||
                    bh.status == "Done" ||
                    bh.status == "Delivering" ? (
                      <div className="booking-total">
                        <h4
                          style={{
                            color: "green",
                            paddingLeft: "10px",
                            fontSize: "16px",
                            fontWeight: "600",
                          }}
                        >
                          {bh.payment?.paymentStatus == "Success"
                            ? "Đã thanh toán"
                            : ""}
                        </h4>
                        <h4>
                          Thành tiền:{" "}
                          <span>
                            {new Intl.NumberFormat("vi-VN").format(
                              bh.totalAmount
                            )}{" "}
                            vnđ
                          </span>
                        </h4>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                ))
            ) : (
              <p className="empty-booking">🛒 Bạn chưa có đơn hàng nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
