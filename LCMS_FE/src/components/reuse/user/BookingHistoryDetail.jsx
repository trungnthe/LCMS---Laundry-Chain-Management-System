import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchBookingHistoryByCustomerId,
  fetchBookingStatusByBookingId,
} from "../../../services/bookingHistory";
import moment from "moment";
import { BsCheckCircle } from "react-icons/bs";
import { fetchCustomerById, getAccountById } from "../../../services/account";
import { jwtDecode } from "jwt-decode";
import { fetchServices } from "../../../admin/manage_service";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateBooking, updateBookingStatus } from "../../../services/booking";
import { fetchBranches } from "../../../admin/manage_branches";
import { fetchProducts } from "../../../admin/manage_product";
import ReviewModal from "./ReviewModal";
import Swal from "sweetalert2";
import { FaQrcode } from "react-icons/fa6";
import CashInvoice from "./CashInvoice";
import { createPayment, fetchPaymentById } from "../../../services/payment";
import { fetchLaundrySubsByAccount } from "../../../services/subscription";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";
import { Ticket } from "lucide-react";

const BookingHistoryDetail = () => {
  const [userData, setUserData] = useState();
  const [statusList, setStatusList] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [branches, setBranches] = useState([]);
  const [sub, setSub] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [payment, setPayment] = useState();
  const [selectedBookingDetailId, setSelectedBookingDetailId] = useState();
  const [customer, setCustomer] = useState();
  const [paymentType, setPaymentType] = useState("");
  const { bookingId } = useParams();
  const location = useLocation();
  const [bookingDetail, setBookingDetail] = useState(
    location.state?.bookingById || location.state?.bookingDetail
  );
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let userId = null;

  const [pointsToUse, setPointsToUse] = useState();

  useEffect(() => {
    if (userId) {
      getAccountById(userId)
        .then((response) => {
          setUserData(response.data);
        })
        .catch((error) => {});

      fetchBookingHistoryByCustomerId(userId).then((response) => {
        const detail = response.find((x) => x.bookingId == bookingId);
        setBookingDetail(detail);
      });
    }

    fetchBookingStatusByBookingId(bookingId).then((response) => {
      if (response) {
        response.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        setStatusList(response);
      }
    });

    fetchServices()
      .then(setServices)
      .catch(() => {});
    fetchBranches()
      .then(setBranches)
      .catch(() => {});
    fetchProducts()
      .then(setProducts)
      .catch(() => {});

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/signalHub`, {
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .build();

    connection
      .start()
      .then(() => {
        connection.on("updatePayment", (action, status) => {
          if (action === "newPayment" && status === "Success") {
            handlePayment();
          }
        });
      })
      .catch((err) => {});

    return () => {
      connection.off("updatePayment");
      connection.stop();
    };
  }, [bookingId, userId]);

  useEffect(() => {
    if (bookingDetail?.customerId && bookingDetail?.bookingId) {
      fetchCustomerById(bookingDetail.customerId)
        .then(setCustomer)
        .catch(() => {});

      fetchPaymentById(bookingDetail.bookingId)
        .then((res) => {
          if (res.paymentStatus == "Pending") {
            return;
          } else if (res.paymentStatus == "Success") {
            setPayment(res);
          }
        })
        .catch(() => {});

      fetchLaundrySubsByAccount(bookingDetail.customerId)
        .then((data) => {
          if (data?.status == 404) {
            return;
          } else {
            setSub(data);
          }
        })
        .catch(() => {});
    }
  }, [bookingDetail]);

  const handlePayment = async () => {
    await fetchPaymentById(bookingDetail.bookingId).then((res) => {
      setTimeout(() => {
        setPayment(res);
        setQrCode("");
        toast.success("Thanh toán thành công", {
          className: "custom_toast",
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          transition: Bounce,
        });
      }, 3000);
    });
  };

  const handlePointsChange = (e) => {
    let value = e.target.value;

    if (value !== "" && !isNaN(value)) {
      value = value.replace(/^0+/, "") || "0";

      // Ngăn số âm
      if (Number(value) < 0) {
        value = "0";
      }
    }

    const maxPointsCanUse = Math.floor(
      (totalAmount -
        totalAmount * membershipDiscount -
        discountValue +
        bookingDetail?.shippingFee) /
        100 -
        1
    );

    const maxAllowedPoints = Math.min(
      customer?.loyaltyPoints || 0,
      maxPointsCanUse
    );

    if (Number(value) > maxAllowedPoints) {
      value = maxAllowedPoints.toString();
    }

    setPointsToUse(value);
  };

  const discountValue = pointsToUse ? Number(pointsToUse) * 100 : 0;

  let totalAmount = 0;

  // if (bookingDetail?.details) {
  //   for (const d of bookingDetail?.details) {
  //     const service = services.find((x) => x.serviceId == d.serviceId);
  //     if (service) {
  //       if (service.serviceTypeId == 2) {
  //         const product = products.find((y) => y.productId == d.productId);
  //         if (product) {
  //           totalAmount += product.price * d.quantity + service.price;
  //         }
  //       } else {
  //         totalAmount += service.price * d.weight;
  //       }
  //     }
  //   }
  // }

  if (bookingDetail?.details) {
    for (const d of bookingDetail?.details) {
      totalAmount += d?.price;
    }
  }

  let membershipDiscount = 0;

  if (userData?.membershipLevel) {
    switch (userData.membershipLevel) {
      case "Gold":
        membershipDiscount = 0.1;
        break;
      case "Silver":
        membershipDiscount = 0.05;
        break;
      case "Diamond":
        membershipDiscount = 0.15;
        break;
      default:
        membershipDiscount = 0;
    }
  }

  const finalAmount =
    bookingDetail?.totalAmount !== undefined &&
    bookingDetail?.shippingFee !== undefined
      ? Math.max(
          0,
          totalAmount -
            totalAmount * membershipDiscount -
            discountValue +
            bookingDetail.shippingFee -
            (sub
              ? calculateMonthlyPassDiscount(
                  bookingDetail.details,
                  sub.remainingWeight
                )
              : 0)
        )
      : null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded?.AccountId || null;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const steps =
    bookingDetail?.deliveryType == "HomeDelivery"
      ? [
          "Lên đơn ",
          "Xác nhận đơn",
          "Nhận đồ",
          "Tiến hành giặt ",
          "Giặt xong",
          "Giao đồ",
          "Hoàn thành",
        ]
      : [
          "Lên đơn ",
          "Xác nhận đơn",
          "Nhận đồ",
          "Tiến hành giặt ",
          "Giặt xong",
          "Chờ nhận đồ",
          "Hoàn thành",
        ];

  const statusToStepMapping =
    bookingDetail?.deliveryType == "HomeDelivery"
      ? {
          Pending: 0, // Chờ xác nhận
          Confirmed: 1, // Đã xác nhận
          Recieved: 2, // Nhận được đồ
          InProgress: 3, // Đang xử lý
          Completed: 4, // Hoàn thành khi giặt xong
          Delivering: 5, // Đang giao hàng
          Done: 6, // Đã nhận hàng
        }
      : {
          Pending: 0, // Chờ xác nhận
          Confirmed: 1, // Đã xác nhận
          Recieved: 2, // Nhận được đồ
          InProgress: 3, // Đang xử lý
          Delivering: 5,
          Completed: 4, // Hoàn thành khi giặt xong
          Done: 6, // Đã nhận hàng
        };

  const statusMessages = {
    Pending: {
      title: "Đơn hàng đang chờ xác nhận",
      message: "Đơn hàng của bạn đang chờ xác nhận từ hệ thống.",
    },
    Confirmed: {
      title: "Xác nhận thành công",
      message: "Đơn giặt của bạn đã được xác nhận thành công.",
    },
    Received: {
      title: "Đã nhận đồ",
      message: "Chúng tôi đã nhận được đồ của bạn.",
    },
    InProgress: {
      title: "Đang xử lý",
      message: "Đơn hàng của bạn đang được tiến hành giặt.",
    },
    Completed: {
      title: "Đơn giặt hoàn tất",
      message:
        "Đơn giặt của bạn đã được hoàn tất, chọn phương thức thanh toán và thanh toán ngay.",
    },
    Delivering: {
      title: "Đơn hàng đang được giao",
      message:
        "Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại.",
    },
    Done: {
      title: "Đơn hàng đã nhận",
      message: "Bạn đã hoàn tất đơn hàng. Cảm ơn bạn đã sử dụng dịch vụ!",
    },
    Canceled: {
      title: "Đơn hàng đã được hủy",
      message: "Đơn hàng của bạn đã được hủy thành công.",
    },
    Rejected: {
      title: "Đơn hàng bị từ chối",
      message: "Rất tiếc, đơn hàng của bạn đã bị từ chối.",
    },
  };

  const [formData, setFormData] = useState({
    customerId: bookingDetail.customerId,
    deliveryType: bookingDetail.deliveryType || "",
    laundryType: bookingDetail.laundryType || "",
    deliveryAddress: bookingDetail.deliveryAddress || "",
    pickupAddress: bookingDetail.pickupAddress || "",
    note: bookingDetail.note || "",
    branchId: bookingDetail.branchId || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.laundryType == "None") {
      setFormData({ ...formData, pickupAddress: "" });
    }
    if (formData.deliveryType == "None") {
      setFormData({ ...formData, deliveryAddress: "" });
    }
    onSave(formData);
  };

  const [showAll, setShowAll] = useState(false);

  const sortedStatusList = statusList.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  const visibleStatusList = showAll
    ? sortedStatusList
    : sortedStatusList.slice(0, 3);

  const onSave = async (data) => {
    const res = await updateBooking(bookingDetail.bookingId, data);

    if (res) {
      toast.success("Cập nhật đơn hàng thành công", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      setIsUpdate(false);
      fetchBookingHistoryByCustomerId(userId).then((response) => {
        setBookingDetail(response.find((x) => x.bookingId == bookingId));
      });
    }
  };

  const onCancel = () => {
    setIsUpdate(false);
  };

  const totalWeight = bookingDetail.details.reduce(
    (sum, item) => sum + (item.weight || 0),
    0
  );

  function calculateMonthlyPassDiscount(details, remainingWeight) {
    let weightLeft = remainingWeight;
    let discount = 0;

    for (const item of details) {
      if (weightLeft <= 0) break;

      const itemWeight = item.weight || 0;

      // Tránh chia cho 0
      const servicePrice = itemWeight !== 0 ? item.price / itemWeight : 0;

      if (itemWeight <= weightLeft) {
        discount += itemWeight * servicePrice;
        weightLeft -= itemWeight;
      } else {
        discount += weightLeft * servicePrice;
        weightLeft = 0;
      }
    }

    return discount;
  }

  const getCurrentStepIndex = () => {
    return statusToStepMapping[bookingDetail?.status] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const onCancelBooking = async () => {
    const result = await Swal.fire({
      title: "Bạn muốn hủy đơn hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa!",
      cancelButtonText: "Hủy",
      position: "top",
      customClass: {
        popup: "small-swal-popup",
      },
    });

    if (!result.isConfirmed) return;

    const res = await updateBookingStatus(bookingDetail.bookingId, "Canceled");
    if (res) {
      toast.success("Hủy đơn thành công", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        transition: Bounce,
      });
      navigate("/user/profile/booking-history", {
        state: "Canceled",
      });
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openReviewModal = (bookingDetailId) => {
    setSelectedBookingDetailId(bookingDetailId);
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
  };

  const handlePaymentQr = async () => {
    if (pointsToUse == null) {
      const res = await createPayment({
        bookingId: bookingDetail.bookingId,
        points: 0,
        paymentType: "QRCode",
      });

      setQrCode(res.qrUrl);
    } else {
      const res = await createPayment({
        bookingId: bookingDetail.bookingId,
        points: pointsToUse,
        paymentType: "QRCode",
      });

      setQrCode(res.qrUrl);
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setPaymentType("QRCode");
    }, 1500);
  };

  const handlePaymentSub = async () => {
    const res = await createPayment({
      bookingId: bookingDetail.bookingId,
      points: 0,
      paymentType: "TienMat",
    });

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      handlePayment();
    }, 1000);
  };

  return (
    <div>
      <div className="my-profile-header">
        <h5>Chi tiết đơn hàng:</h5>
        <h3>Xem chi tiết đơn hàng và theo dõi đơn hàng của bạn</h3>
      </div>
      <div className="bookingDetail-container">
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
        <section className="progress-tracker">
          <h2>Trạng thái đơn hàng</h2>
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`progress-step ${
                  index <= currentStepIndex ? "active" : ""
                } ${index < currentStepIndex ? "completedd" : ""}`}
              >
                <div className="step-indicator">
                  {index < currentStepIndex ? "✓" : index + 1}
                </div>
                <div className="step-label">{step}</div>
                {index < steps.length - 1 && (
                  <div className="step-connector"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div style={{ padding: "3px 0px" }}>
          <div
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgb(111, 166, 214), rgb(111, 166, 214) 33px, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 41px, rgb(241, 141, 155) 0px, rgb(241, 141, 155) 74px, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 82px)",
              backgroundPositionX: "-30px",
              backgroundSize: "116px 3px",
              height: "2.99528px",
              width: "100%",
            }}
          ></div>
        </div>

        <div className="delivery-tracking-container">
          <div className="delivery-content">
            <div className="recipient-info">
              <h2>{bookingDetail.customerName}</h2>
              <p className="phone">Số điện thoại: {userData?.phone}</p>
              <p className="email">Email: {userData?.email}</p>
              <p className="branchs">Cơ sở giặt: {bookingDetail.branchName}</p>
              {bookingDetail.deliveryType === "HomeDelivery" ? (
                <p className="address">
                  Địa chỉ giao hàng: {bookingDetail.deliveryAddress}
                </p>
              ) : (
                <>
                  <p className="address">Tự đưa đồ đến</p>
                </>
              )}
              {bookingDetail.laundryType === "Pickup" ? (
                <p className="address">
                  Địa chỉ lấy đồ: {bookingDetail.pickupAddress}
                </p>
              ) : (
                <>
                  <p className="address">Tự lấy đồ</p>
                </>
              )}
            </div>

            <div className="delivery-timeline">
              {statusList.length > 0 ? (
                <>
                  {visibleStatusList.map((sl) => {
                    const key = `${sl.newStatus}`;
                    const statusInfo = statusMessages[key];

                    return (
                      <div className="timeline-step" key={sl.id}>
                        <div className="timeline-icon">
                          {sl.newStatus === "Delivered" ? (
                            <BsCheckCircle color="green"></BsCheckCircle>
                          ) : (
                            <div className="step-dot"></div>
                          )}
                          <div className="timeline-line"></div>
                        </div>
                        <div className="timeline-contentt">
                          <div className="timeline-time">
                            {moment(sl.updatedAt).format("DD/MM/YYYY HH:mm")}
                          </div>

                          {statusInfo?.title && (
                            <div
                              className={`timeline-status ${
                                sl.newStatus === "Delivered" ? "active" : ""
                              }`}
                            >
                              {statusInfo?.title}
                            </div>
                          )}
                          {statusInfo?.message && (
                            <div className="timeline-description">
                              {statusInfo?.message}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {!showAll && sortedStatusList.length > 3 && (
                    <button
                      className="show-more-btn"
                      onClick={() => setShowAll(true)}
                    >
                      Xem thêm
                    </button>
                  )}

                  {showAll && (
                    <button
                      className="show-more-btn"
                      onClick={() => setShowAll(false)}
                    >
                      Ẩn bớt
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="timeline-step">
                    <div className="timeline-icon">
                      <div className="step-dot"></div>
                      <div className="timeline-line"></div>
                    </div>
                    <div className="timeline-contentt">
                      <div className="timeline-time">
                        {moment(bookingDetail.bookingDate).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </div>

                      <div className="timeline-status">Đang chờ xác nhận</div>
                      <div className="timeline-description">
                        Đơn giặt đang chờ nhân viên xác nhận
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {bookingDetail.status === "Pending" ? (
          <div className="booking-history-detail-button-container">
            <button
              className="booking-history-detail-btn-review"
              onClick={() => {
                setIsUpdate(!isUpdate);
              }}
            >
              Sửa thông tin đơn hàng
            </button>

            <button
              className="booking-history-detail-btn-cancel"
              onClick={() => onCancelBooking()}
            >
              Hủy đơn hàng
            </button>
          </div>
        ) : (
          <></>
        )}

        {bookingDetail.status === "Canceled" ? (
          <div
            className="booking-history-detail-button-container"
            style={{ paddingRight: "2%" }}
          >
            <button
              className="booking-history-detail-btn-support"
              onClick={() => {
                navigate("/user/booking");
              }}
            >
              Đặt lại
            </button>
          </div>
        ) : (
          <></>
        )}

        <h3 className="booking-history-note">
          Ghi chú : <span>{bookingDetail.note}</span>
        </h3>

        {isUpdate ? (
          <>
            <div
              style={{
                margin: "20px",
                padding: "10px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <form onSubmit={handleSubmit}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Hình thức lấy hàng:
                </label>
                <select
                  name="laundryType"
                  value={formData.laundryType}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                >
                  <option value="None">Tự đưa đến cửa hàng</option>
                  <option value="Pickup">
                    Nhân viên đến lấy tận nơi (có phí)
                  </option>
                </select>

                {formData.laundryType == "Pickup" ? (
                  <>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Địa chỉ nhận hàng:
                    </label>
                    <input
                      type="text"
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        marginBottom: "10px",
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}

                <label style={{ display: "block", marginBottom: "5px" }}>
                  Hình thức giao hàng:
                </label>
                <select
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                >
                  <option value="None">Tự lấy ở cửa hàng</option>
                  <option value="HomeDelivery">
                    Nhân viên giao hàng tận nơi (có phí)
                  </option>
                </select>

                {formData.deliveryType == "HomeDelivery" ? (
                  <>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Địa chỉ giao hàng:
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        marginBottom: "10px",
                      }}
                    />
                  </>
                ) : (
                  <></>
                )}

                <label style={{ display: "block", marginBottom: "5px" }}>
                  Note:
                </label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                />

                <label style={{ display: "block", marginBottom: "5px" }}>
                  Branch:
                </label>
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                >
                  {branches
                    .filter((x) => x.status == "Mở Cửa")
                    .map((branch) => (
                      <option key={branch.branchId} value={branch.branchId}>
                        {branch.branchName} - {branch.address}
                      </option>
                    ))}
                </select>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={onCancel}
                    style={{
                      height: "30px",
                      padding: "0px 7px",
                      background: "#ccc",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Thoát
                  </button>
                  <button
                    type="submit"
                    style={{
                      height: "30px",
                      padding: "0px 7px",
                      background: "#007bff",
                      color: "white",
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="booking-history-detail-content">
          <div className="booking-history-detail-list">
            {bookingDetail.details.map((d) => (
              <>
                {services.find((x) => x.serviceId == d.serviceId)
                  ?.serviceTypeId != 2 ? (
                  <div
                    className="booking-detail-container"
                    key={d.bookingDetailId}
                  >
                    <div className="booking-detail-content">
                      <div className="booking-detail-image">
                        <img
                          src={
                            services.find((x) => x.serviceId === d.serviceId)
                              ?.image || "https://via.placeholder.com/100"
                          }
                          alt="Service"
                        />
                      </div>
                      <div className="booking-detail-text">
                        <h3>
                          Dịch vụ <span>{d.serviceName}</span>
                        </h3>

                        <p style={{ fontSize: "12px" }}>
                          {d.weight ? d.weight + " kg" : "Cập nhật sau"}
                        </p>
                      </div>
                    </div>
                    <div className="booking-detail-price">
                      {d.weight ? <p>{d?.price.toLocaleString()} vnđ</p> : ""}
                    </div>
                    {bookingDetail.status == "Done" ? (
                      <button
                        className="review-button"
                        onClick={() => openReviewModal(d.bookingDetailId)}
                      >
                        Đánh Giá
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <div
                    className="booking-detail-container"
                    key={d.bookingDetailId}
                  >
                    <div className="booking-detail-content">
                      <div className="booking-detail-image">
                        <img
                          src={
                            services.find((x) => x.serviceId === d.serviceId)
                              ?.image || "https://via.placeholder.com/100"
                          }
                          alt="Service"
                        />
                      </div>
                      <div className="booking-detail-text">
                        <h3>
                          Dịch vụ <span>{d.serviceName}</span>
                        </h3>

                        <p>
                          {d.productName || "\u00A0"} - {d.quantity || "\u00A0"}{" "}
                          cái
                        </p>
                      </div>
                    </div>
                    <div className="booking-detail-price">
                      <p>{d?.price.toLocaleString()} vnđ</p>
                    </div>
                    {bookingDetail.status == "Done" ? (
                      <button
                        className="review-button"
                        onClick={() => openReviewModal(d.bookingDetailId)}
                      >
                        Đánh Giá
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </>
            ))}
          </div>

          {bookingDetail.status == "Completed" ||
          bookingDetail.status == "Delivering" ? (
            <div className="booking-history-container">
              <div className="booking-history-row">
                <div className="booking-history-label">Tổng giá tiền</div>
                <div className="booking-history-value">
                  {bookingDetail?.totalAmount
                    ? new Intl.NumberFormat("vi-VN").format(totalAmount) +
                      " vnđ"
                    : "Cập nhật sau"}
                </div>
              </div>

              <div className="booking-history-row">
                <div className="booking-history-label">Phí vận chuyển</div>
                <div className="booking-history-value">
                  {bookingDetail?.shippingFee
                    ? new Intl.NumberFormat("vi-VN").format(
                        bookingDetail.shippingFee
                      ) + " vnđ"
                    : "0 vnđ"}
                </div>
              </div>

              {sub && !payment ? (
                <>
                  <div className="booking-history-row">
                    <div className="booking-history-label">
                      Áp dụng gói tháng cho:{" "}
                      {sub?.remainingWeight > totalWeight
                        ? totalWeight
                        : sub?.remainingWeight}{" "}
                      kg
                    </div>

                    <div className="booking-history-value discount">
                      -
                      {calculateMonthlyPassDiscount(
                        bookingDetail.details,
                        sub.remainingWeight
                      ).toLocaleString()}{" "}
                      vnđ
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}

              {payment?.subscriptionUsageHistories?.length > 0 ? (
                <>
                  <div className="booking-history-row">
                    <div className="booking-history-label">
                      Áp dụng gói tháng cho:{" "}
                      {payment?.subscriptionUsageHistories[0].weightUsed} kg
                    </div>

                    <div className="booking-history-value discount">
                      -
                      {calculateMonthlyPassDiscount(
                        bookingDetail.details,
                        payment?.subscriptionUsageHistories[0].weightUsed
                      ).toLocaleString()}{" "}
                      vnđ
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}

              {userData?.membershipLevel ? (
                <div
                  className="booking-history-label"
                  style={{
                    fontWeight: "300",
                    fontSize: "14px",
                    paddingTop: "2%",
                  }}
                >
                  Giảm giá thành viên {userData?.membershipLevel} :{" "}
                  {new Intl.NumberFormat("vi-VN").format(
                    bookingDetail?.totalAmount * membershipDiscount
                  ) + " vnđ"}{" "}
                </div>
              ) : (
                <></>
              )}

              {!sub ? (
                <>
                  {customer?.loyaltyPoints > 0 ? (
                    <>
                      {paymentType == "" && !payment ? (
                        <div
                          className="booking-history-row toggle-container"
                          style={{ border: "none", paddingBottom: "0" }}
                        >
                          <div
                            className="booking-history-label"
                            style={{ fontWeight: "300", fontSize: "14px" }}
                          >
                            Dùng điểm tích lũy (Tối đa:{" "}
                            {customer?.loyaltyPoints})
                          </div>
                          <input
                            type="number"
                            className="loyalty-points-input"
                            value={pointsToUse}
                            min="0"
                            onInput={(e) => {
                              if (e.target.value < 0) e.target.value = 0;
                            }}
                            max={Math.min(
                              customer?.loyaltyPoints,
                              Math.floor(
                                (bookingDetail?.totalAmount +
                                  bookingDetail?.shippingFee) /
                                  100 +
                                  1
                              )
                            )}
                            placeholder="0"
                            onChange={handlePointsChange}
                          />
                        </div>
                      ) : (
                        <></>
                      )}
                      <div className="booking-history-row">
                        <div className="booking-history-label">
                          Đã dùng điểm tích lũy
                        </div>
                        <div className="booking-history-value discount">
                          {pointsToUse > 0
                            ? `-${new Intl.NumberFormat("vi-VN").format(
                                discountValue
                              )} vnđ`
                            : "0 vnđ"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      className="booking-history-label"
                      style={{
                        fontWeight: "300",
                        fontSize: "14px",
                        paddingTop: "2%",
                      }}
                    >
                      Bạn chưa có điểm tích lũy
                    </div>
                  )}
                </>
              ) : (
                <></>
              )}

              {payment?.paymentStatus == "Success" ? (
                <div className="booking-history-row total">
                  <div className="booking-history-label">Thành tiền</div>
                  <div className="booking-history-value total-value">
                    {payment?.amountPaid !== null
                      ? new Intl.NumberFormat("vi-VN").format(
                          payment?.amountPaid
                        ) + " vnđ"
                      : "Cập nhật sau"}
                  </div>
                </div>
              ) : (
                <div className="booking-history-row total">
                  <div className="booking-history-label">Thành tiền</div>
                  <div className="booking-history-value total-value">
                    {finalAmount !== null
                      ? new Intl.NumberFormat("vi-VN").format(finalAmount) +
                        " vnđ"
                      : "Cập nhật sau"}
                  </div>
                </div>
              )}

              {payment ? (
                <>
                  {payment?.paymentType == "QRCode" ? (
                    <div className="booking-history-row total">
                      <div className="booking-history-label">
                        Phương thức thanh toán
                      </div>
                      <div
                        className="booking-history-value"
                        style={{ color: "#1565C0", fontWeight: "400" }}
                      >
                        Thanh toán qua QR
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="booking-history-row total">
                    <div className="booking-history-label">Trạng thái</div>
                    <div
                      className="booking-history-value"
                      style={{
                        color: "green",
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {payment?.paymentStatus == "Pending"
                        ? "Đang chờ"
                        : payment?.paymentStatus == "Success"
                        ? "Thành công"
                        : payment?.paymentStatus == "Fail"
                        ? "Thất bại"
                        : "N/A"}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="payment-method"
                    style={{ fontWeight: "normal" }}
                  >
                    {isLoading ? (
                      <div className="loading">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    ) : (
                      <>
                        {paymentType == "" ? (
                          <>
                            {finalAmount > 0 ? (
                              <div className="payment-button">
                                <button
                                  className="pay-now-qr"
                                  onClick={() => handlePaymentQr()}
                                >
                                  <FaQrcode className="payment-icon" /> Thanh
                                  toán trước (qua QR)
                                </button>
                                <p
                                  style={{
                                    textAlign: "center",
                                    paddingTop: "3%",
                                    color: "gray",
                                    fontSize: "14px",
                                  }}
                                >
                                  hoặc
                                </p>
                                <h5
                                  style={{
                                    textAlign: "center",
                                    color: "#333",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                  }}
                                >
                                  Thanh toán bằng tiền mặt khi nhận hàng
                                </h5>
                              </div>
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <></>
                        )}

                        {sub?.length <= 0 || finalAmount != 0 ? (
                          <></>
                        ) : (
                          <>
                            <div className="payment-button">
                              <button
                                className="pay-now"
                                onClick={() => handlePaymentSub()}
                              >
                                <Ticket className="payment-icon" /> Xác nhận
                                thanh toán bằng gói tháng
                              </button>
                            </div>
                          </>
                        )}

                        {paymentType == "QRCode" ? (
                          <>
                            <CashInvoice
                              paymentType="QRCode"
                              subCus={sub}
                              finalAmount={finalAmount}
                              subDiscount={
                                sub?.remainingWeight !== undefined
                                  ? calculateMonthlyPassDiscount(
                                      bookingDetail.details,
                                      sub.remainingWeight
                                    )
                                  : null
                              }
                              booking={bookingDetail}
                              customerData={userData}
                              staffInfo={branches.find(
                                (b) => b.branchId == bookingDetail.branchId
                              )}
                              phoneNum={userData.phone}
                              shippingFee={bookingDetail.shippingFee}
                              services={services}
                              points={pointsToUse * 100 || 0}
                              membershipDiscount={
                                membershipDiscount * totalAmount
                              }
                              qrCode={qrCode}
                              open={true}
                            />
                          </>
                        ) : (
                          <></>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <></>
          )}

          {bookingDetail.status == "Done" &&
          payment?.paymentStatus == "Success" ? (
            <>
              <div className="booking-history-container">
                <div className="booking-history-row">
                  <div className="booking-history-label">Tổng giá tiền</div>
                  <div className="booking-history-value">
                    {bookingDetail?.totalAmount
                      ? new Intl.NumberFormat("vi-VN").format(
                          bookingDetail?.totalAmount
                        ) + " vnđ"
                      : "Cập nhật sau"}
                  </div>
                </div>

                <div className="booking-history-row">
                  <div className="booking-history-label">Phí vận chuyển</div>
                  <div className="booking-history-value">
                    {bookingDetail?.shippingFee
                      ? new Intl.NumberFormat("vi-VN").format(
                          bookingDetail.shippingFee
                        ) + " vnđ"
                      : "0 vnđ"}
                  </div>
                </div>

                {sub && !payment ? (
                  <>
                    <div className="booking-history-row">
                      <div className="booking-history-label">
                        Áp dụng gói tháng cho:{" "}
                        {sub?.remainingWeight > totalWeight
                          ? totalWeight
                          : sub?.remainingWeight}{" "}
                        kg
                      </div>

                      <div className="booking-history-value discount">
                        -
                        {calculateMonthlyPassDiscount(
                          bookingDetail.details,
                          sub.remainingWeight
                        ).toLocaleString()}{" "}
                        vnđ
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}

                {payment?.subscriptionUsageHistories?.length > 0 ? (
                  <>
                    <div className="booking-history-row">
                      <div className="booking-history-label">
                        Áp dụng gói tháng cho:{" "}
                        {payment?.subscriptionUsageHistories[0].weightUsed} kg
                      </div>

                      <div className="booking-history-value discount">
                        -
                        {calculateMonthlyPassDiscount(
                          bookingDetail.details,
                          payment?.subscriptionUsageHistories[0].weightUsed
                        ).toLocaleString()}{" "}
                        vnđ
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}

                {userData?.membershipLevel ? (
                  <div
                    className="booking-history-label"
                    style={{
                      fontWeight: "300",
                      fontSize: "14px",
                      paddingTop: "2%",
                    }}
                  >
                    Giảm giá thành viên {userData?.membershipLevel} :{" "}
                    {new Intl.NumberFormat("vi-VN").format(
                      bookingDetail?.totalAmount * membershipDiscount
                    ) + " vnđ"}{" "}
                  </div>
                ) : (
                  <></>
                )}

                {!sub ? (
                  <div className="booking-history-row">
                    <div className="booking-history-label">
                      Đã dùng điểm tích lũy
                    </div>
                    <div className="booking-history-value discount">
                      {payment?.points > 0
                        ? `-${new Intl.NumberFormat("vi-VN").format(
                            payment?.points * 100
                          )} vnđ`
                        : "0 vnđ"}
                    </div>
                  </div>
                ) : (
                  <></>
                )}

                <div className="booking-history-row total">
                  <div className="booking-history-label">Thành tiền</div>
                  <div className="booking-history-value total-value">
                    {new Intl.NumberFormat("vi-VN").format(
                      payment?.amountPaid
                    ) + " vnđ"}
                  </div>
                </div>

                {payment?.paymentType == "QRCode" ? (
                  <div className="booking-history-row total">
                    <div className="booking-history-label">
                      Phương thức thanh toán
                    </div>
                    <div
                      className="booking-history-value"
                      style={{ color: "#1565C0", fontWeight: "400" }}
                    >
                      Thanh toán qua QR
                    </div>
                  </div>
                ) : (
                  <></>
                )}

                <div className="booking-history-row total">
                  <div className="booking-history-label">Trạng thái</div>
                  <div
                    className="booking-history-value"
                    style={{
                      color: "green",
                      fontSize: "18px",
                      fontWeight: "600",
                    }}
                  >
                    {payment?.paymentStatus == "Pending"
                      ? "Đang chờ"
                      : payment?.paymentStatus == "Success"
                      ? "Thành công"
                      : payment?.paymentStatus == "Fail"
                      ? "Thất bại"
                      : "N/A"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <ReviewModal
          isOpen={isModalOpen}
          onClose={closeReviewModal}
          productId={selectedBookingDetailId}
          currentUserId={userId}
        />
      </div>
    </div>
  );
};

export default BookingHistoryDetail;
