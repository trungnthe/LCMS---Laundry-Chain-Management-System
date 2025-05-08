import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

import * as signalR from "@microsoft/signalr";
import "../../assets/css/staff/BookingDetailModal.css"; // Import the CSS file
import "../../assets/css/staff/bookingliststaff.css";
import "../../assets/css/staff/paymentmodal.css";
const apiUrl = import.meta.env.VITE_API_URL;

import {
  getAllBooking,
  getBookingDetailByBookingIdAsync,
  getCustomerByIdlAsync,
  updateBookingDetailStatusAsync,
  UpdateWeightBookingDetailAsync,
  getBookingByBookingIdAsync,
  UpdateShippingFeeBookingAsync,
  updateBookingStatusAsync,
  createPayment,
  getLaundrySubByIdlAsync,
  fetchPaymentSuccessByBoookingId,
} from "../../services/fetchApiStaff.js";
import Header from "../reuse/Header_Staff";
import { Eye, X } from "lucide-react";
import { encryptToShortCode } from "../../utils/crypto.js";

// Map status strings to display values and CSS classes
const statusConfig = {
  Pending: {
    displayName: "Chờ xác nhận",
    cssClass: "status-pending",
  },
  Confirmed: {
    displayName: "Đã xác nhận",
    cssClass: "status-confirmed",
  },
  Received: {
    displayName: "Đã nhận hàng",
    cssClass: "status-received",
  },
  Canceled: {
    displayName: "Đã hủy",
    cssClass: "status-cancelled",
  },
  Rejected: {
    displayName: "Bị từ chối",
    cssClass: "status-rejected",
  },
  InProgress: {
    displayName: "Đang xử lý",
    cssClass: "status-in-progress",
  },
  Completed: {
    displayName: "Đã giặt xong",
    cssClass: "status-completed",
  },
  Delivering: {
    displayName: "Đang giao hàng",
    cssClass: "status-delivery",
  },
  Done: {
    displayName: "Hoàn thành",
    cssClass: "status-delivered",
  },
};

const ListBooking = () => {
  const [toastMessage, setToastMessage] = useState(null);
  const notificationSound = new Audio(
    "/sounds/notification-sound-3-262896.mp3"
  );
  const notificationSoundPayment = new Audio(
    "/sounds/best-notification-9-286665.mp3"
  );

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Pending");
  const scrollPosition = useRef(0); // Dùng useRef để lưu vị trí cuộn

  // New state variables for additional filtering and sorting
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "bookingId",
    direction: "desc",
  });
  const [filterParams, setFilterParams] = useState({
    branch: "all",
    dateFrom: "",
    dateTo: "",
    customerName: "",
    staffName: "",
    minAmount: "",
    maxAmount: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });
  useEffect(() => {
    let isMounted = true;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/signalHub", {
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => localStorage.getItem("token"), // nếu bạn có dùng JWT
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        scrollPosition.current = window.scrollY;

        const data = await getAllBooking();
        if (!Array.isArray(data))
          throw new Error("Invalid data format received");

        if (isMounted) {
          setBookings(data);
        }
      } catch (err) {
        if (isMounted)
          setError("Không thể tải dữ liệu đặt lịch. Vui lòng thử lại sau.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBookings();

    connection
      .start()
      .then(() => {
        connection.on("receiveupdate", (updateType, data) => {
          if (isMounted) {
            switch (updateType) {
              case "NewBooking":
                // Gọi API để lấy thông tin chi tiết booking chỉ khi không có bookingDetails trong dữ liệu SignalR
                if (!data.bookingDetails) {
                  getBookingByBookingIdAsync(data.bookingId)
                    .then((booking) => {
                      if (booking) {
                        setBookings((prevBookings) => [
                          ...prevBookings,
                          { ...booking, bookingDetails: [] }, // Cập nhật thông tin booking vào danh sách
                        ]);
                      }
                    })
                    .catch((error) => {});
                }

                break;

              case "UpdateBookingDetail":
                // Lấy thông tin Booking chi tiết đã được cập nhật từ API
                getBookingDetailByBookingIdAsync(data.bookingId).then(
                  (updatedBookingDetail) => {
                    if (updatedBookingDetail) {
                      // Lấy thông tin Booking cùng với Booking Detail
                      getBookingByBookingIdAsync(data.bookingId).then(
                        (updatedBooking) => {
                          if (updatedBooking) {
                            // Cập nhật cả booking và booking detail trong state
                            setBookings((prevBookings) =>
                              prevBookings.map(
                                (booking) =>
                                  booking.bookingId === data.bookingId
                                    ? {
                                        ...booking, // Cập nhật thông tin booking
                                        ...updatedBooking, // Cập nhật các thuộc tính từ booking
                                        bookingDetail: updatedBookingDetail, // Cập nhật bookingDetail
                                      }
                                    : booking // Nếu không phải booking này thì không thay đổi
                              )
                            );
                          }
                        }
                      );
                    }
                  }
                );
                break;

              case "deleteBooking":
                // Xóa booking
                setBookings((prevBookings) =>
                  prevBookings.filter((booking) => booking.id !== data.id)
                );
                break;
              default:
                break;
            }
          }
        });
      })

      .catch();

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, []);

  // 🔹 Khôi phục vị trí cuộn **sau khi DOM cập nhật**
  useEffect(() => {
    if (bookings.length > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition.current);
      }, 100); // Chờ 100ms để đảm bảo DOM cập nhật xong
    }
  }, [bookings]);

  // Apply filters and sorting whenever bookings, activeTab, or filterParams change
  useEffect(() => {
    let result = [...bookings];

    // Apply status filter (activeTab)
    if (activeTab !== "all") {
      result = result.filter((booking) => booking.status === activeTab);
    }

    // Apply date range filter
    if (filterParams.dateFrom) {
      const fromDate = new Date(filterParams.dateFrom);
      result = result.filter(
        (booking) => new Date(booking.bookingDate) >= fromDate
      );
    }

    if (filterParams.dateTo) {
      const toDate = new Date(filterParams.dateTo);
      toDate.setHours(23, 59, 59); // End of the day
      result = result.filter(
        (booking) => new Date(booking.bookingDate) <= toDate
      );
    }

    // Apply customer name filter
    if (filterParams.customerName) {
      const searchName = filterParams.customerName.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.customerName &&
          booking.customerName.toLowerCase().includes(searchName)
      );
    }

    // Apply staff name filter
    if (filterParams.staffName) {
      const searchStaff = filterParams.staffName.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.staffName &&
          booking.staffName.toLowerCase().includes(searchStaff)
      );
    }

    // Apply amount range filter
    if (filterParams.minAmount) {
      result = result.filter(
        (booking) => booking.totalAmount >= Number(filterParams.minAmount)
      );
    }

    if (filterParams.maxAmount) {
      result = result.filter(
        (booking) => booking.totalAmount <= Number(filterParams.maxAmount)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;

        if (sortConfig.key === "bookingDate") {
          return sortConfig.direction === "asc"
            ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
            : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
        }

        if (typeof a[sortConfig.key] === "string") {
          return sortConfig.direction === "asc"
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        }

        return sortConfig.direction === "asc"
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      });
    }

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalPages: Math.ceil(result.length / prev.itemsPerPage),
      currentPage: 1, // Reset to first page when filters change
    }));

    setFilteredBookings(result);
  }, [bookings, activeTab, filterParams, sortConfig]);

  // Get paginated bookings for current view
  const paginatedBookings = React.useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return filteredBookings.slice(
      startIndex,
      startIndex + pagination.itemsPerPage
    );
  }, [filteredBookings, pagination.currentPage, pagination.itemsPerPage]);

  // Function to handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator for column headers
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Handle booking status changes
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN"); // ví dụ: 08/04/2025
  };

  const handleStatusBookingChange = async (bookingId, newStatus) => {
    setLoading(true); // Bắt đầu loading
    try {
      const success = await updateBookingStatusAsync(bookingId, newStatus);
      notificationSound.play(); // Phát âm thanh thông báo

      if (success) {
        // Lấy thông tin booking mới từ server
        const updatedBooking = await getBookingByBookingIdAsync(bookingId);

        if (updatedBooking) {
          // Cập nhật lại thông tin booking trong state
          setBookings((prevBookings) =>
            prevBookings.map((prevBooking) =>
              prevBooking.bookingId === updatedBooking.bookingId
                ? { ...prevBooking, ...updatedBooking } // Cập nhật booking nếu tìm thấy
                : prevBooking
            )
          );
          // Cập nhật selectedBooking nếu bạn sử dụng modal
          setSelectedBooking(updatedBooking);

          // Thông báo thành công
          toast.success("Cập nhật trạng thái thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
          onCloseModal();
        }
      } else {
        toast.error("Lỗi khi xác nhận đơn hàng, vui lòng thử lại!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false); // Dừng loading khi API hoàn thành
    }
  };

  // Format date and time from ISO string
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: "", time: "" };

    const date = new Date(isoString);

    const dateStr = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date: dateStr, time: timeStr };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterParams((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilterParams({
      dateFrom: "",
      dateTo: "",
      customerName: "",
      staffName: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const BookingDetailStaffModal = ({ isOpen, onClose, booking }) => {
    const [weights, setWeights] = useState([]); // Khởi tạo weights như một mảng
    const [customerData, setCustomerData] = useState(null); // Dùng để lưu dữ liệu khách hàng
    const [subCus, setSubCus] = useState(null); // Dùng để lưu dữ liệu khách hàng
    const [paymentData, setPaymentData] = useState(null); // Dùng để lưu dữ liệu khách hàng

    const [bookingDetailData, setBookingDetailData] = useState(null); // Dùng để lưu dữ liệu khách hàng
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // State để theo dõi khi nào đang chỉnh sửa
    const [isEditingShip, setIsEditingShip] = useState(false); // State để theo dõi khi nào đang chỉnh sửa
    const [shippingFee, setShippingFee] = useState(booking?.shippingFee);
    const [newShippingFee, setNewShippingFee] = useState(shippingFee);
    const [showQRCode, setShowQRCode] = useState(false);
    const [staffInfo, setStaffInfo] = useState(null);

    const handleUpdateShippingFee = async () => {
      try {
        if (
          newShippingFee === "" ||
          isNaN(newShippingFee) ||
          parseFloat(newShippingFee) < 0
        ) {
          toast.error("Phí ship phải là một số dương.");
          return;
        }
        // Cập nhật phí giao hàng qua API
        const response = await UpdateShippingFeeBookingAsync(
          booking.bookingId,
          newShippingFee
        );

        // Cập nhật lại phí giao hàng trong state
        setShippingFee(newShippingFee);
        setIsEditingShip(false); // Đóng input sau khi cập nhật thành công

        // Gọi lại API để lấy lại thông tin Booking đã cập nhật
        const updatedBooking = await getBookingByBookingIdAsync(
          booking.bookingId
        );

        // Kiểm tra xem dữ liệu booking đã được cập nhật chưa
        if (updatedBooking) {
          // Cập nhật lại thông tin booking trong state, bao gồm tổng tiền và phí giao hàng mới
          setBookings((prevBookings) =>
            prevBookings.map((b) =>
              b.bookingId === booking.bookingId
                ? { ...b, ...updatedBooking } // Cập nhật thông tin booking mới
                : b
            )
          );
          console.log(updatedBooking);
          // Cập nhật lại selectedBooking để modal hiển thị thông tin mới
          setSelectedBooking(updatedBooking);

          toast.success("Cập nhật phí giao hàng thành công!");
        }
      } catch (error) {
        console.error("Error updating shipping fee:", error);
        toast.error("Lỗi khi cập nhật phí giao hàng.");
      }
    };

    const handleEditWeight = async (index) => {
      const weight = weights[index];

      // Validate the weight input
      if (weight === "" || isNaN(weight) || parseFloat(weight) <= 0) {
        toast.error("Cân nặng phải là một số dương.");
        return;
      }

      const item = bookingDetailData[index];

      // Check for invalid data
      if (!item || !item.bookingDetailId) {
        toast.error("Dữ liệu không hợp lệ.");
        return;
      }

      try {
        setLoading(true); // Set loading to true before making the request

        // Gọi API để cập nhật cân nặng
        const result = await UpdateWeightBookingDetailAsync(
          item.bookingDetailId,
          weight
        );

        // Sau khi cập nhật thành công, bạn có thể gọi lại API để lấy thông tin Booking và Booking Detail
        const updatedBooking = await getBookingByBookingIdAsync(
          booking?.bookingId
        );
        if (updatedBooking) {
          // Cập nhật lại booking trong state
          setBookings((prevBookings) =>
            prevBookings.map((booking) =>
              booking.bookingId === updatedBooking.bookingId
                ? { ...booking, ...updatedBooking } // Cập nhật thông tin booking mới
                : booking
            )
          );
          // Nếu bạn sử dụng modal, hãy cập nhật lại selectedBooking
          setSelectedBooking(updatedBooking);

          toast.success("Cập nhật cân nặng thành công!");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi cập nhật cân nặng.");
      } finally {
        setLoading(false); // Set loading to false in both success and failure cases
      }
    };

    if (!isOpen) return null;
    const handleStatusChange = (e, index) => {
      setLoading(true); // Bắt đầu loading
      const newStatus = e.target.value;

      // 🟢 Quan trọng: return Promise từ handleUpdateBookingDetailStatus
      return handleUpdateBookingDetailStatus(index, newStatus)
        .then(() => {
          setBookingDetailData((prevData) =>
            prevData.map((item, i) =>
              i === index ? { ...item, status: newStatus } : item
            )
          );
          toast.success("Cập nhật trạng thái thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
        })
        .catch(() => {
          toast.error("Cập nhật thất bại, vui lòng thử lại!", {
            position: "top-right",
            autoClose: 3000,
          });
        })
        .finally(() => {
          setLoading(false); // Kết thúc loading bất kể thành công hay thất bại
        });
    };

    useEffect(() => {
      if (toastMessage) {
        toast.success(toastMessage, {
          position: "top-right",
          autoClose: 3000,
        });
        setToastMessage(null); // Xóa sau khi hiển thị
      }
    }, [toastMessage]);

    // Thêm vào component chính để hiển thị thông báo
    const handleUpdateBookingDetailStatus = async (index) => {
      const item = bookingDetailData[index];
      if (!item || !item.bookingDetailId) {
        return Promise.reject("Dữ liệu không hợp lệ"); // 🛑 Trả về Promise lỗi
      }

      const newStatus = item.statusLaundry; // ✅ Lấy đúng trạng thái

      try {
        const result = await updateBookingDetailStatusAsync(
          item.bookingDetailId,
          newStatus
        );

        // ✅ Phát âm thanh khi thành công
        notificationSound.play();

        // 🟢 Gọi API lấy booking mới cập nhật
        const updatedBooking = await getBookingByBookingIdAsync(
          booking.bookingId
        );

        if (updatedBooking) {
          // 🟢 Cập nhật lại danh sách bookings
          setBookings((prevBookings) =>
            prevBookings.map((b) =>
              b.bookingId === booking.bookingId
                ? { ...b, ...updatedBooking }
                : b
            )
          );

          // 🟢 Cập nhật lại selectedBooking
          setSelectedBooking(updatedBooking);
        }

        // 🛑 Kiểm tra lỗi trả về từ API
        if (result.error) {
          return Promise.reject(result.error);
        }

        return result; // 🟢 Trả về thành công
      } catch (error) {
        return Promise.reject(error); // 🛑 Trả về lỗi để catch() xử lý
      }
    };

    const loadPaymentData = async (bookingId) => {
      try {
        const updatedPaymentData = await fetchPaymentSuccessByBoookingId(
          bookingId
        );
        setPaymentData(updatedPaymentData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thanh toán:", error);
        toast.error("Không thể cập nhật thanh toán");
      }
    };

    useEffect(() => {
      const fetchData = async () => {
        if (isOpen && booking?.bookingId) {
          try {
            let bookingDetailsData = await fetchBookingDetailByBookingIdAsync(
              booking.bookingId
            );
            setBookingDetailData(bookingDetailsData);

            // Nếu có customerId, mới gọi API lấy thông tin khách hàng
            if (booking?.customerId) {
              let customerData = await fetchCustomerById(booking.customerId);
              let subCusdata = await getLaundrySubByIdlAsync(
                booking.customerId
              );
              await loadPaymentData(booking.bookingId); // gọi lại hàm

              setCustomerData(customerData);
              setSubCus(subCusdata ?? null);
            }
          } catch (err) {
            setError(err.message);
            toast.error(err.message, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        }
      };

      fetchData();
    }, [isOpen, booking?.bookingId, booking?.customerId]);

    const fetchCustomerById = async (customerId) => {
      try {
        setError(null); // Reset lỗi trước khi gọi API

        // Gọi API để lấy thông tin khách hàng
        const data = await getCustomerByIdlAsync(customerId);

        // Kiểm tra nếu dữ liệu không hợp lệ hoặc không có dữ liệu
        if (!data) {
          throw new Error(
            "Không thể tải thông tin khách hàng. Vui lòng thử lại sau."
          );
        }

        return data; // Trả về dữ liệu khách hàng
      } catch (err) {
        throw new Error(
          "Không thể tải thông tin khách hàng. Vui lòng thử lại sau."
        ); // Ném ra lỗi
      }
    };
    useEffect(() => {
      const fetchStaffInfoBranch = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("Không tìm thấy token");

          const decodedToken = jwtDecode(token);
          const accountId = decodedToken.AccountId;

          const response = await fetch(
            `${apiUrl}/api/Employee/get-employee-by-id?id=${accountId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!response.ok) throw new Error(await response.text());

          const data = await response.json();
          setStaffInfo(data); // Đảm bảo setState là một hàm
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
        }
      };

      fetchStaffInfoBranch();
    }, []);
    const fetchBookingDetailByBookingIdAsync = async (bookingId) => {
      try {
        setError(null); // Reset lỗi trước khi gọi API

        // Gọi API để lấy thông tin chi tiết đặt chỗ
        const data = await getBookingDetailByBookingIdAsync(bookingId);
        // Kiểm tra nếu dữ liệu không hợp lệ hoặc không có dữ liệu
        if (!data) {
          throw new Error(
            "Không thể tải thông tin đặt chỗ. Vui lòng thử lại sau."
          );
        }

        return data; // Trả về dữ liệu chi tiết đặt chỗ
      } catch (err) {
        throw new Error(
          "Không thể tải thông tin đặt chỗ. Vui lòng thử lại sau."
        ); // Ném ra lỗi
      }
    };

    const statusInfo = statusConfig[booking.status] || {
      displayName: booking.status,
      cssClass: "bookinglist-staff-status-default",
    };
    const isValidPhoneNumber = (phone) => {
      const phoneRegex = /^(0[1-9][0-9]{8,9})$/; // Kiểm tra số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0)
      return phoneRegex.test(phone);
    };

    // Hàm xử lý in hóa đơn tiền mặt

    const generateInvoiceContent = (
      booking,
      bookingDetailData,
      customerData,
      staffInfo,
      paymentData,
      shippingFee = 0
    ) => {
      // Check if payment data exists
      if (!paymentData) {
        return `
          <html>
            <head>
              <title>Thông báo</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .message-container { max-width: 500px; margin: 100px auto; text-align: center; }
                .message { font-size: 18px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .back-button { margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="message-container">
                <div class="message">
                  <h2>Không thể in hóa đơn</h2>
                  <p>Đơn hàng chưa thanh toán nên chưa thể in hóa đơn.</p>
                  <button class="back-button" onclick="window.close()">Đóng</button>
                </div>
              </div>
            </body>
          </html>
        `;
      }

      // Format date function
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
      };

      // If payment data exists, generate the invoice
      return `
        <html>
          <head>
            <title>Hóa đơn thanh toán - #${encryptToShortCode(
              booking?.bookingId
            )}</title>
            <meta charset="UTF-8">
            <style>
              @page {
                size: A6;
                margin: 5mm;
              }
              
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 10px;
                width: 105mm;
                height: 148mm;
                box-sizing: border-box;
              }
              
              .invoice-container {
                width: 95mm;
                padding: 5mm;
                margin: 0 auto;
              }
              
              .invoice-header {
                text-align: center;
                margin-bottom: 8px;
                border-bottom: 1px solid #000;
                padding-bottom: 4px;
              }
              
              .company-name {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              
              .invoice-title {
                font-size: 12px;
                font-weight: bold;
                margin: 8px 0;
                text-align: center;
              }
              
              .info-row {
                margin-bottom: 3px;
                display: flex;
                justify-content: space-between;
                font-size: 9px;
              }
              
              .info-label {
                font-weight: bold;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 6px 0;
                font-size: 9px;
              }
              
              th, td {
                border-bottom: 1px dashed #ddd;
                padding: 3px 2px;
                text-align: left;
              }
              
              th {
                background-color: #f2f2f2;
                font-size: 9px;
              }
              
              .total-section {
                margin-top: 8px;
                text-align: right;
              }
              
              .total-row {
                font-weight: bold;
                margin-top: 4px;
                font-size: 11px;
              }
              
              .payment-method {
                margin-top: 8px;
                padding: 3px;
                border-top: 1px dashed #ddd;
                border-bottom: 1px dashed #ddd;
                text-align: center;
                font-weight: bold;
              }
              
              .payment-info {
                margin-top: 8px;
                border: 1px dashed #ddd;
                padding: 4px;
                font-size: 9px;
                text-align: center;
              }
              
              .payment-title {
                font-weight: bold;
                margin-bottom: 2px;
              }
              
              .subscription-info {
                margin-top: 6px;
                border: 1px dashed #ddd;
                padding: 4px;
                font-size: 9px;
              }
              
              .subscription-title {
                font-weight: bold;
                text-align: center;
                margin-bottom: 3px;
              }
              
              .subscription-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 3px;
              }
              
              .subscription-item {
                display: flex;
                justify-content: space-between;
              }
              
              .subscription-label {
                font-weight: bold;
              }
              
              .invoice-footer {
                margin-top: 8px;
                text-align: center;
                font-style: italic;
                font-size: 8px;
              }
              
              .invoice-footer p {
                margin: 2px 0;
              }
              
              @media print {
                html, body {
                  width: 105mm;
                  height: 148mm;
                  margin: 0;
                  padding: 0;
                }
                
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="invoice-header">
                <div class="company-name">${staffInfo.branchName}</div>
                <div>${staffInfo.branchAddress}</div>
                <div>ĐT: ${staffInfo.branchPhoneNumber}</div>
              </div>
              
              <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
              
              <div class="info-row"><span class="info-label">Số hóa đơn:</span><span>#${
                encryptToShortCode(booking?.bookingId) || "N/A"
              }</span></div>
              <div class="info-row"><span class="info-label">Ngày tạo:</span><span>${new Date().toLocaleDateString(
                "vi-VN"
              )}</span></div>
              <div class="info-row"><span class="info-label">Khách hàng:</span><span>${
                customerData?.customerName || booking?.guestName || "N/A"
              }</span></div>
              <div class="info-row"><span class="info-label">Số điện thoại:</span><span>${
                customerData?.phoneNumber || booking?.guestPhoneNumber || "N/A"
              }</span></div>
              <div class="info-row"><span class="info-label">Nhân viên thanh toán:</span><span>${
                booking?.staffName || "N/A"
              }</span></div>
    
              <table>
                <thead>
                  <tr><th>Dịch vụ/Sản phẩm</th><th>SL/KG</th><th>Loại giặt</th><th>Giá</th><th>T.Tiền</th></tr>
                </thead>
                <tbody>
                ${bookingDetailData
                  ?.map(
                    (item) => `
                      <tr>
                        <td>${item.serviceName}  - ${item.servicePrice}</td>
                        <td>${
                          item.weight
                            ? `${item.weight} kg`
                            : item.quantity || "N/A"
                        }</td>
                               <td>
                          ${
                            item.productName
                              ? `${
                                  item.productName
                                } - ${item.productPrice.toLocaleString(
                                  "vi-VN"
                                )}`
                              : "Giặt theo cân"
                          }
                        </td>
                        <td>
                          ${
                            item.productName
                              ? (item.servicePrice + item.productPrice).toFixed(
                                  2
                                )
                              : item.servicePrice || "N/A"
                          }
                        </td>
                        <td>${
                          item.price
                            ? `${item.price.toLocaleString("vi-VN")}`
                            : "N/A"
                        }</td>
                 
                      </tr>
                    `
                  )
                  .join("")}
                
                </tbody>
              </table>
    
              ${
                subCus
                  ? `
                <div class="subscription-info">
                  <div class="subscription-title">THÔNG TIN GÓI THÁNG</div>
                  <div class="subscription-details">
                    <div class="subscription-item">
                      <span class="subscription-label">Gói:</span>
                      <span>${subCus.packageName || "N/A"}</span>
                    </div>
                    <div class="subscription-item">
                      <span class="subscription-label">Cân tối đa:</span>
                      <span>${subCus.maxWeight || "N/A"} kg</span>
                    </div>
               
               
                    <div class="subscription-item">
                      <span class="subscription-label">Hạn sử dụng:</span>
                      <span>${
                        subCus.startDate && subCus.endDate
                          ? `${formatDate(subCus.startDate)} - ${formatDate(
                              subCus.endDate
                            )}`
                          : "N/A"
                      }</span>
                    </div>
                  </div>
                </div>
              `
                  : ""
              }
    
              <div class="total-section">
                <div class="info-row"><span class="info-label">Phí giao hàng:</span><span>${shippingFee.toLocaleString(
                  "vi-VN"
                )} VNĐ</span></div>
                ${
                  paymentData.discount
                    ? `<div class="info-row"><span class="info-label">Giảm giá:</span><span>${paymentData.discount.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                    : ""
                }
                ${
                  subCus && paymentData.amountPaid === 0
                    ? `<div class="info-row"><span class="info-label">Áp dụng gói tháng:</span><span>-${booking.totalAmount.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                    : `<div class="info-row"><span class="info-label">Tổng tiền:</span><span>${booking.totalAmount.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                }
                <div class="total-row"><span class="info-label">Số tiền thanh toán:</span><span>${paymentData.amountPaid.toLocaleString(
                  "vi-VN"
                )} VNĐ</span></div>
              </div>
        
              <div class="payment-info">
                <div class="payment-title">THÔNG TIN THANH TOÁN</div>
                <div>Phương thức: ${
                  paymentData.paymentType === "TienMat"
                    ? "Tiền Mặt"
                    : paymentData.paymentType === "QRCode"
                    ? "Thanh toán qua QR Code"
                    : paymentData.paymentType || "N/A"
                }</div>
                <div>Ngày thanh toán: ${new Date(
                  paymentData.paymentDate
                ).toLocaleDateString("vi-VN")}</div>
                <div>Trạng thái: ${
                  paymentData.paymentStatus === "Success"
                    ? "Đã thanh toán"
                    : paymentData.paymentStatus
                }</div>
              </div>
    
              <div class="invoice-footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p>Vui lòng giữ hóa đơn để làm bằng chứng.</p>
              </div>
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() { window.close(); };
                }, 800);
              };
            </script>
          </body>
        </html>
      `;
    };

    // Example usage:
    const invoiceContent = generateInvoiceContent(
      booking,
      bookingDetailData,
      customerData,
      staffInfo,
      paymentData,
      shippingFee
    );

    // Thêm hàm này vào component của bạn

    // Hàm xử lý hiển thị hóa đơn chuyển khoản và QR code
    const showTransferInvoice = () => {
      // Hiển thị modal hoặc component chứa QR code
      setShowQRCode(true);
      // Thêm code để hiển thị QR code và in hóa đơn
    };

    const [points, setPoints] = useState("");
    const [discount, setDiscount] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [qrUrl, setQrUrl] = useState(""); // State lưu URL thanh toán
    const [loadingModalPayment, setLoadingModalPayment] = useState(false);

    const calculateTotalAmount = () => {
      // Base values - đảm bảo tách phí giao hàng ra khỏi totalAmount
      const baseAmount =
        (booking?.totalAmount || 0) - (booking?.shippingFee || 0); // Base amount không có phí giao hàng
      const shippingFee = booking?.shippingFee || 0; // Phí giao hàng
      let finalAmount = baseAmount; // Sử dụng baseAmount để tính các khoản giảm giá và chiết khấu

      // Tính tổng số kg và tổng tiền giặt theo cân
      let totalBookingWeight = 0;
      let totalWeightAmount = 0;

      bookingDetailData?.forEach((detail) => {
        const weight = detail.weight || 0;
        const price = detail.price || 0;

        if (weight > 0) {
          totalBookingWeight += weight;
          totalWeightAmount += price; // Tổng tiền phần giặt theo cân
        }
      });

      // Chiết khấu khuyến mãi

      // Sau khi trừ chiết khấu, cộng lại phí giao hàng vào cuối cùng

      // Giảm giá thành viên
      let membershipDiscount = 0;
      let membershipDiscountValue = 0;
      if (customerData?.membershipLevel) {
        if (customerData.membershipLevel === "Silver") {
          membershipDiscount = 5;
        } else if (customerData.membershipLevel === "Gold") {
          membershipDiscount = 10;
        } else if (customerData.membershipLevel === "Diamond") {
          membershipDiscount = 15;
        }

        membershipDiscountValue = (membershipDiscount / 100) * finalAmount;
        finalAmount -= membershipDiscountValue;
      }

      // Áp dụng gói tháng (chỉ áp dụng cho phần giặt theo cân)
      let subscriptionDiscount = 0;
      let weightDeduction = 0;
      let excessWeight = 0;

      if (subCus && subCus.remainingWeight !== undefined) {
        const remainingAfterBooking =
          subCus.remainingWeight - totalBookingWeight;

        if (remainingAfterBooking >= 0) {
          // Không vượt quá gói, miễn toàn bộ phần giặt theo cân
          subscriptionDiscount = totalWeightAmount;
          finalAmount -= totalWeightAmount;
        } else {
          // Vượt quá, miễn phần trong gói và tính tiền phần vượt
          excessWeight = Math.abs(remainingAfterBooking);
          const weightCovered = subCus.remainingWeight;
          const coveredAmount =
            (weightCovered / totalBookingWeight) * totalWeightAmount;
          weightDeduction = excessWeight * (subCus.pricePerKg || 0);

          subscriptionDiscount = coveredAmount;
          finalAmount -= coveredAmount;
          finalAmount += weightDeduction;
        }
      }
      let discountAmount = 0;
      if (discount) {
        const discountPercentage = parseFloat(discount) || 0;

        // Áp dụng chiết khấu chỉ cho phần vượt
        const discountBaseAmount = finalAmount + shippingFee; // Lúc này finalAmount chỉ gồm tiền vượt (nếu có)
        discountAmount = (discountPercentage / 100) * discountBaseAmount;

        finalAmount -= discountAmount;
      }

      // Quy đổi điểm thưởng
      let pointsValue = 0;
      if (points) {
        const availablePoints = customerData?.loyaltyPoints || 0;
        const parsedPoints = parseFloat(points) || 0;

        // Không dùng quá số điểm có sẵn
        const appliedPoints = Math.min(parsedPoints, availablePoints);

        // Quy đổi điểm thành tiền: 1 điểm = 100 VNĐ
        pointsValue = appliedPoints * 100;

        // Trừ tiền từ điểm vào tổng
        finalAmount = Math.max(finalAmount - pointsValue, 0);
      }

      // Thêm phí giao hàng vào cuối - chỉ thêm một lần duy nhất
      finalAmount += shippingFee;

      // Format hiển thị
      const formatCurrency = (value) => {
        return value > 0 ? `${value.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ";
      };

      return {
        totalAmount: formatCurrency(booking?.totalAmount), // Tổng tiền ban đầu
        rawTotalAmount: booking?.totalAmount,

        shippingFee: formatCurrency(shippingFee),
        rawShippingFee: shippingFee,

        discountAmount: formatCurrency(discountAmount),
        rawDiscountAmount: discountAmount,

        membershipDiscount,
        membershipDiscountValue: formatCurrency(membershipDiscountValue),
        rawMembershipDiscountValue: membershipDiscountValue,

        subscriptionDiscount: formatCurrency(subscriptionDiscount),
        rawSubscriptionDiscount: subscriptionDiscount,

        totalBookingWeight,
        remainingWeight: subCus?.remainingWeight || 0,
        excessWeight,
        weightDeduction: formatCurrency(weightDeduction),
        rawWeightDeduction: weightDeduction,

        pointsValue: formatCurrency(pointsValue),
        rawPointsValue: pointsValue,

        finalAmount: formatCurrency(finalAmount), // Tổng tiền cuối cùng sau khi áp dụng tất cả chiết khấu
        rawFinalAmount: finalAmount,
      };
    };

    // Example usage in the payment display component

    useEffect(() => {
      // Create the connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/signalHub", {
          transport: signalR.HttpTransportType.WebSockets,
          withCredentials: true,
        })
        .build();

      // Start connection
      connection
        .start()
        .then(() => {
          console.log("SignalR Connected");

          // Set up the event handler for payment updates
          connection.on("updatePayment", (action, status) => {
            console.log(`Payment update received: ${action}, ${status}`);
            if (action === "newPayment" && status === "Success") {
              toast.success("Thanh toán thành công!");
              loadPaymentData(booking.bookingId); // Gọi lại API cập nhật
              notificationSoundPayment.play(); // Phát âm thanh thông báo
              setTimeout(() => {
                setQrUrl("");
              }, 0);
            }
          });
        })
        .catch((err) => console.error("SignalR Connection Error: ", err));

      // Cleanup function to stop connection and remove handlers
      return () => {
        connection.off("updatePayment");
        connection.stop();
        console.log("SignalR Disconnected");
      };
    }, []); // Empty dependency array means this runs once on component mount

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoadingModalPayment(true); // Bắt đầu loading

      const paymentData = {
        bookingId: booking?.bookingId,
        points: points ? parseInt(points, 10) : 0,
        discount: discount ? parseFloat(discount) / 100 : 0,
        paymentType: paymentType === "TienMat" ? "TienMat" : "QRCode",
      };

      try {
        const result = await createPayment(paymentData);
        console.log(paymentData);
        if (result.error) {
          toast.error(result.error);
        } else {
          // Kiểm tra loại thanh toán và hiển thị thông báo thành công
          if (paymentType === "QRCode") {
            setQrUrl(result.qrUrl);
          } else {
            notificationSoundPayment.play(); // Phát âm thanh thông báo

            toast.success("Thanh toán thành công!");
          }

          // Cập nhật lại paymentData sau khi thanh toán thành công
          const updatedPaymentData = await fetchPaymentSuccessByBoookingId(
            booking.bookingId
          );

          // Cập nhật state với dữ liệu mới
          setPaymentData(updatedPaymentData);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tạo thanh toán.");
      } finally {
        setLoadingModalPayment(false); // Kết thúc loading dù có lỗi hay không
      }
    };
    const [rawPoints, setRawPoints] = useState(""); // giữ giá trị gõ tạm thời
    console.log(calculateTotalAmount().finalAmount);
    return (
      <div className="booking-detail-staff-modal-overlay">
        <div className="booking-detail-staff-modal-container">
          <div className="booking-detail-staff-modal-header">
            <h3 className="booking-detail-staff-modal-title">
              Chi tiết đơn hàng #{encryptToShortCode(booking?.bookingId)}
              <span
                className={`bookinglist-staff-status-badge ${statusInfo.cssClass}`}
              >
                {statusInfo.displayName}
              </span>
            </h3>
            <button
              onClick={onClose}
              className="booking-detail-staff-modal-close-button"
            >
              <X size={24} />
            </button>
          </div>
          <div className="booking-detail-staff-modal-content">
            {/* Customer Information Section */}
            <div className="booking-detail-staff-modal-section">
              <h4 className="booking-detail-staff-modal-section-title">
                Thông tin khách hàng
              </h4>
              <div className="booking-detail-staff-modal-info-panel">
                <div className="booking-detail-staff-modal-info-grid">
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Tên khách hàng:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {customerData?.customerName ||
                        booking?.guestName ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Thứ hạng:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {customerData?.membershipLevel}{" "}
                      {customerData?.loyaltyPoints
                        ? `${customerData.loyaltyPoints} điểm`
                        : "N/A"}
                    </p>
                  </div>

                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Số điện thoại:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {(() => {
                        const phone =
                          customerData?.phoneNumber ||
                          booking?.phoneNumber ||
                          "";
                        return phone && isValidPhoneNumber(phone)
                          ? phone
                          : "Số điện thoại không hợp lệ";
                      })()}
                    </p>
                  </div>
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Email:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {customerData?.email || "N/A"}
                    </p>
                  </div>
                  {/* Hiển thị thêm thông tin nếu subCus tồn tại */}
                  {subCus && (
                    <>
                      <div className="booking-detail-staff-modal-info-item">
                        <p className="booking-detail-staff-modal-info-label">
                          Gói:
                        </p>
                        <p className="booking-detail-staff-modal-info-value">
                          {subCus?.packageName || "N/A"}
                        </p>
                      </div>
                      <div className="booking-detail-staff-modal-info-item">
                        <p className="booking-detail-staff-modal-info-label">
                          Cân nặng tối đa:(kg)
                        </p>
                        <p className="booking-detail-staff-modal-info-value">
                          {subCus?.maxWeight || "N/A"}
                        </p>
                      </div>{" "}
                      <div className="booking-detail-staff-modal-info-item">
                        <p className="booking-detail-staff-modal-info-label">
                          Số cân còn lại: (kg)
                        </p>
                        <p className="booking-detail-staff-modal-info-value">
                          {subCus?.remainingWeight || "N/A"}
                        </p>
                      </div>
                      <div className="booking-detail-staff-modal-info-item">
                        <p className="booking-detail-staff-modal-info-label">
                          Trạng thái:
                        </p>
                        <p className="booking-detail-staff-modal-info-value">
                          {subCus?.status === "Active"
                            ? "Còn hạn"
                            : subCus?.status === "Expired"
                            ? "Hết hạn"
                            : "N/A"}
                        </p>
                      </div>
                      <div className="booking-detail-staff-modal-info-item">
                        <p className="booking-detail-staff-modal-info-label">
                          Hạn sử dụng:
                        </p>
                        <p className="booking-detail-staff-modal-info-value">
                          {subCus?.startDate && subCus?.endDate
                            ? `${formatDate(subCus.startDate)} đến ${formatDate(
                                subCus.endDate
                              )}`
                            : "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Information Section */}
            <div className="booking-detail-staff-modal-section">
              <h4 className="booking-detail-staff-modal-section-title">
                Thông tin đơn hàng
              </h4>
              <div className="booking-detail-staff-modal-info-panel">
                <div className="booking-detail-staff-modal-info-grid">
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Mã đơn hàng:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {booking?.bookingId || "N/A"}
                    </p>
                  </div>
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Ngày đặt:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {new Date(booking?.bookingDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Địa chỉ lấy hàng:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {booking?.pickupAddress || "Không có"}
                    </p>
                  </div>{" "}
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Địa chỉ giao hàng
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {booking?.deliveryAddress || "Không có"}
                    </p>
                  </div>{" "}
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Hình thức nhận hàng:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {booking?.laundryType || "Không có"}
                    </p>
                  </div>{" "}
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Hình thức giao hàng:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {booking?.deliveryType || "Không có"}
                    </p>
                  </div>
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Thời gian dự kiến hoàn thành:
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {" "}
                      {formatDateTime(booking?.finishTime)?.time ||
                        "Chờ giặt"}{" "}
                      {formatDateTime(booking?.finishTime)?.date || ""}
                    </p>
                  </div>
                  <div className="booking-detail-staff-modal-infonote-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Phí giao hàng:
                    </p>
                    {booking?.totalAmount
                      ? `${shippingFee.toLocaleString("vi-VN")} VNĐ`
                      : "0"}{" "}
                    {""}
                    {booking?.status !== "Done" &&
                    booking?.status !== "Delivering" &&
                    !(
                      (booking?.laundryType === "None" ||
                        booking?.laundryType === null ||
                        booking?.laundryType === "") &&
                      (booking?.deliveryType === "None" ||
                        booking?.deliveryType === null ||
                        booking?.deliveryType === "")
                    ) ? (
                      isEditingShip ? (
                        <div>
                          <input
                            type="number"
                            min="0"
                            value={newShippingFee || ""}
                            onChange={(e) => setNewShippingFee(e.target.value)}
                            className="booking-detail-staff-modal-status-input"
                          />
                          <button
                            className="booking-detail-staff-modal-update-button"
                            onClick={handleUpdateShippingFee}
                          >
                            Cập nhật
                          </button>
                        </div>
                      ) : (
                        <button
                          className="booking-detail-staff-modal-update-button"
                          onClick={() => setIsEditingShip(true)}
                        >
                          Chỉnh sửa
                        </button>
                      )
                    ) : (
                      <p></p>
                    )}
                  </div>
                  <div className="booking-detail-staff-modal-infonote-item">
                    <p className="booking-detail-staff-modal-info-label">
                      Ghi chú:
                    </p>
                    <span className={`${statusInfo.cssClass}`}>
                      {booking?.note}
                    </span>
                  </div>
                  <div className="booking-detail-staff-modal-info-item">
                    <p className="booking-detail-staff-modal-info-label">
                      {booking?.status === "Done"
                        ? "Tổng tiền:"
                        : "Tổng tiền tạm tính:"}
                    </p>
                    <p className="booking-detail-staff-modal-info-value">
                      {booking?.totalAmount
                        ? `${booking.totalAmount.toLocaleString("vi-VN")} VNĐ`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details Table Section */}
            <div className="booking-detail-staff-modal-section">
              <h4 className="booking-detail-staff-modal-section-title">
                Chi tiết dịch vụ
              </h4>{" "}
              <div className="booking-detail-staff-modal-table-container">
                <table className="booking-detail-staff-modal-table">
                  <thead>
                    <tr>
                      <th>Mã giặt</th>
                      <th>Dịch vụ</th>
                      <th>Loại đồ giặt</th>
                      <th>Số lượng/Cân nặng</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                      <th
                        onClick={
                          ["InProgress"].includes(booking?.status)
                            ? () => handleSort("status")
                            : undefined
                        }
                      >
                        {["InProgress"].includes(booking?.status) ? (
                          <>Thao tác {getSortIndicator("status")}</>
                        ) : (
                          <></> // Hoặc để trống nếu bạn muốn
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingDetailData?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <span>{item?.bookingDetailId}</span>
                        </td>
                        <td>
                          {item.serviceName || "N/A"} -{" "}
                          {item.servicePrice
                            ? `${item.servicePrice.toLocaleString("vi-VN")} VNĐ`
                            : "N/A"}
                        </td>
                        <td>
                          {item.productName ? (
                            <>
                              {item.productName} -{" "}
                              {item.productPrice
                                ? `${item.productPrice.toLocaleString(
                                    "vi-VN"
                                  )} VNĐ`
                                : "N/A"}
                            </>
                          ) : (
                            "Giặt theo cân"
                          )}
                        </td>

                        <td>
                          {booking?.status === "InProgress" &&
                          item?.statusLaundry !== "Pending" ? (
                            item.productId && item.quantity ? ( // Kiểm tra nếu có productId và quantity
                              <div className="booking-detail-staff-modal-product-quantity">
                                Số lượng: {item.quantity}
                              </div>
                            ) : item.weight === null || item.weight === 0 ? (
                              <>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    weights[index] !== undefined
                                      ? weights[index] // Lấy giá trị từ mảng weights theo index
                                      : ""
                                  }
                                  className="booking-detail-staff-modal-status-input"
                                  placeholder="Nhập cân nặng"
                                  onChange={(e) => {
                                    const newWeights = [...weights]; // Sao chép mảng weights cũ
                                    newWeights[index] = e.target.value; // Cập nhật giá trị cho index tương ứng
                                    setWeights(newWeights); // Cập nhật lại state
                                  }}
                                />

                                <button
                                  className="booking-detail-staff-modal-update-button"
                                  onClick={() => {
                                    if (weights[index] !== undefined) {
                                      handleEditWeight(index); // Gọi hàm chỉnh sửa cân nặng nếu hợp lệ
                                    } else {
                                      toast.error(
                                        "Vui lòng nhập cân nặng trước khi lưu!"
                                      );
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  {loading ? "Đang lưu..." : "Lưu"}
                                </button>
                              </>
                            ) : (
                              <>
                                <span>
                                  {item.weight ? `${item.weight} kg` : "kg"}{" "}
                                  {/* Hiển thị cân nặng nếu có */}
                                </span>
                                {isEditing ? (
                                  <div>
                                    <input
                                      type="number"
                                      min="0"
                                      value={weights[index] ?? ""}
                                      className="booking-detail-staff-modal-status-input"
                                      placeholder="Nhập cân nặng"
                                      onChange={(e) => {
                                        const newWeights = [...weights]; // Sao chép mảng weights cũ
                                        newWeights[index] = e.target.value; // Cập nhật giá trị cho index tương ứng
                                        setWeights(newWeights); // Cập nhật lại state
                                      }}
                                    />

                                    <button
                                      className="booking-detail-staff-modal-update-button"
                                      onClick={() => {
                                        if (weights[index] !== undefined) {
                                          handleEditWeight(index); // Gọi hàm chỉnh sửa cân nặng nếu hợp lệ
                                          setIsEditing(false); // Ẩn input sau khi cập nhật
                                        } else {
                                          toast.error(
                                            "Vui lòng nhập cân nặng trước khi cập nhật!"
                                          );
                                        }
                                      }}
                                      disabled={loading}
                                    >
                                      {loading
                                        ? "Đang cập nhật..."
                                        : "Cập nhật"}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="booking-detail-staff-modal-update-button"
                                    onClick={() => setIsEditing(true)} // Hiển thị thẻ input khi nhấn nút sửa
                                  >
                                    Chỉnh sửa
                                  </button>
                                )}
                              </>
                            )
                          ) : (
                            // Hiển thị weight hoặc quantity hoặc "kg"
                            <div className="booking-detail-staff-modal-product-quantity">
                              {
                                item.weight
                                  ? `${item.weight} kg` // Hiển thị cân nếu có
                                  : item.quantity
                                  ? `Số lượng: ${item.quantity}` // Hiển thị số lượng nếu có cân
                                  : "0 kg" // Hiển thị "kg" nếu không có cân và số lượng
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {item.price
                            ? `${item.price.toLocaleString("vi-VN")} VNĐ`
                            : "N/A"}
                        </td>
                        <td>
                          {["InProgress"].includes(booking?.status) ? (
                            <select
                              value={item?.statusLaundry || "Pending"}
                              onChange={(e) => {
                                const updatedStatus = e.target.value;
                                const currentStatus =
                                  item?.statusLaundry || "Pending";

                                // Prevent moving backward in status
                                if (
                                  (currentStatus === "Washing" &&
                                    updatedStatus === "Pending") ||
                                  (currentStatus === "Completed" &&
                                    (updatedStatus === "Pending" ||
                                      updatedStatus === "Washing"))
                                ) {
                                  toast.error(
                                    "Không thể quay lại trạng thái trước đó!"
                                  );
                                  return;
                                }

                                // Validate before setting to Completed
                                if (
                                  updatedStatus === "Completed" &&
                                  (!item.weight || item.weight <= 0) &&
                                  item.productId === null
                                ) {
                                  toast.error(
                                    "Cần nhập cân nặng trước khi hoàn thành!"
                                  );
                                  return;
                                }

                                setBookingDetailData((prevData) =>
                                  prevData.map((itm, i) =>
                                    i === index
                                      ? {
                                          ...itm,
                                          statusLaundry: updatedStatus,
                                          isStatusChanged: true,
                                        }
                                      : itm
                                  )
                                );
                                toast.info(
                                  "Trạng thái đã thay đổi. Nhấn Lưu để cập nhật vào cơ sở dữ liệu."
                                );
                              }}
                              className="booking-detail-staff-modal-status-select"
                            >
                              <option value="Pending">Đang đợi giặt</option>
                              <option value="Washing">Đang giặt</option>
                              <option value="Completed">Đã giặt xong</option>
                            </select>
                          ) : ["Pending", "Confirmed", "Received"].includes(
                              booking?.status
                            ) ? (
                            <span className={`${statusInfo.cssClass}`}>
                              Đang đợi giặt
                            </span>
                          ) : (
                            <span className={`${statusInfo.cssClass}`}>
                              Hoàn thành
                            </span>
                          )}
                        </td>
                        <td>
                          {["InProgress"].includes(booking?.status) ? (
                            <button
                              onClick={(e) => handleStatusChange(e, index)} // Truyền sự kiện e và index
                              className="booking-detail-staff-modal-update-button"
                            >
                              Cập nhật
                            </button>
                          ) : (
                            <span></span> // Chỉ hiển thị nếu không thể sửa
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="booking-detail-staff-modal-footer">
            <div className="booking-detail-staff-modal-footer">
              {booking.status === "Pending" && (
                <>
                  <button
                    className="booking-detail-staff-modal-button transfer-invoice"
                    onClick={() =>
                      handleStatusBookingChange(booking.bookingId, "Confirmed")
                    }
                  >
                    Xác nhận
                  </button>

                  <button
                    className="booking-detail-staff-modal-button transfer-invoice"
                    onClick={() =>
                      handleStatusBookingChange(booking.bookingId, "Rejected")
                    }
                  >
                    Từ chối
                  </button>
                </>
              )}

              {booking.status === "Confirmed" && (
                <>
                  <button
                    className="booking-detail-staff-modal-button transfer-invoice"
                    onClick={() =>
                      handleStatusBookingChange(booking.bookingId, "Received")
                    }
                  >
                    Đã nhận hàng
                  </button>
                </>
              )}
              {booking.status === "Received" && (
                <>
                  <button
                    className="booking-detail-staff-modal-button transfer-invoice"
                    onClick={() =>
                      handleStatusBookingChange(booking.bookingId, "InProgress")
                    }
                  >
                    Xử lý ngay
                  </button>
                </>
              )}
              {(booking.status === "Completed" ||
                booking.status === "Delivering") && (
                <>
                  <button
                    onClick={() => showTransferInvoice()}
                    className="booking-detail-staff-modal-button transfer-invoice"
                  >
                    Thanh toán và in hóa đơn
                  </button>
                </>
              )}
              {booking.status === "Completed" && (
                <>
                  {booking.deliveryAddress ? (
                    <button
                      className="bookinglist-staff-btn-delivery"
                      onClick={() =>
                        handleStatusBookingChange(
                          booking.bookingId,
                          "Delivering"
                        )
                      }
                      style={{
                        backgroundColor: "#4f46e5", // Màu nền xanh lá
                        color: "white", // Màu chữ trắng
                        padding: "10px 20px", // Khoảng cách trong nút
                        marginRight: "10px",
                        border: "none", // Bỏ viền
                        borderRadius: "5px", // Bo góc
                        cursor: "pointer", // Thay đổi con trỏ khi di chuột
                        fontSize: "16px", // Kích thước chữ
                        transition: "background-color 0.3s ease", // Hiệu ứng chuyển màu nền
                      }}
                    >
                      Bắt đầu giao hàng
                    </button>
                  ) : (
                    <button
                      className="bookinglist-staff-btn-delivery"
                      onClick={() =>
                        handleStatusBookingChange(
                          booking.bookingId,
                          "Delivering"
                        )
                      }
                      style={{
                        backgroundColor: "#4f46e5", // Màu nền xanh lá
                        color: "white", // Màu chữ trắng
                        padding: "10px 20px", // Khoảng cách trong nút
                        marginRight: "10px",
                        border: "none", // Bỏ viền
                        borderRadius: "5px", // Bo góc
                        cursor: "pointer", // Thay đổi con trỏ khi di chuột
                        fontSize: "16px", // Kích thước chữ
                        transition: "background-color 0.3s ease", // Hiệu ứng chuyển màu nền
                      }}
                    >
                      Chờ khách đến nhận
                    </button>
                  )}
                </>
              )}

              {paymentData?.bookingId && booking?.status !== "Done" && (
                <button
                  className="bookinglist-staff-btn-delivery"
                  style={{
                    backgroundColor: "#4CAF50", // Màu nền xanh
                    color: "white", // Màu chữ trắng
                    padding: "10px 20px", // Khoảng cách trong nút
                    border: "none", // Bỏ viền
                    borderRadius: "5px", // Bo góc
                    cursor: "pointer", // Thay đổi con trỏ khi di chuột
                    fontSize: "16px", // Kích thước chữ
                    transition: "background-color 0.3s ease", // Hiệu ứng chuyển màu nền
                  }}
                  onClick={() =>
                    handleStatusBookingChange(booking.bookingId, "Done")
                  }
                >
                  Hoàn thành
                </button>
              )}
            </div>

            {/* Sửa lại điều kiện ở đây */}
            {booking.status === "Done" && (
              <>
                <button
                  onClick={() => {
                    const invoiceContent = generateInvoiceContent(
                      booking,
                      bookingDetailData,
                      customerData,
                      staffInfo,
                      paymentData,
                      shippingFee
                    );

                    // Create a new window and write the invoice content to it
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(invoiceContent);
                      printWindow.document.close();
                    } else {
                      alert(
                        "Vui lòng cho phép trình duyệt mở cửa sổ pop-up để in hóa đơn."
                      );
                    }
                  }}
                  className="booking-detail-staff-modal-button transfer-invoice"
                >
                  In hóa đơn
                </button>
              </>
            )}
          </div>

          {showQRCode && (
            <div className="payment-modal-overlay">
              <div className="payment-modal-container">
                {/* Header */}
                <div className="payment-modal-header">
                  <h3 className="payment-modal-title">Xử lý thanh toán</h3>
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="payment-modal-close-btn"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="payment-modal-content">
                  <form onSubmit={handleSubmit} className="payment-modal-form">
                    {customerData &&
                      paymentData?.paymentStatus !== "Success" && (
                        <>
                          <div className="payment-form-group">
                            <label className="payment-form-label">
                              Khách hàng hiện có:{" "}
                              {customerData?.loyaltyPoints || 0} điểm{" "}
                            </label>
                            <label className="payment-form-label">
                              Điểm tích lũy: 100 điểm = 10.000 VND
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={customerData?.loyaltyPoints}
                              step={10}
                              value={rawPoints}
                              onChange={(e) => {
                                // Chỉ thay đổi giá trị trong state mà không xử lý logic ở đây
                                setRawPoints(e.target.value);
                                setPoints(e.target.value);
                              }}
                              onBlur={(e) => {
                                // Xử lý logic sau khi người dùng rời khỏi trường input
                                let value = Number(e.target.value);
                                if (value < 0) {
                                  setRawPoints(0);
                                } else if (
                                  value > customerData?.loyaltyPoints
                                ) {
                                  setRawPoints(customerData?.loyaltyPoints);
                                  setPoints(customerData?.loyaltyPoints);
                                } else {
                                  setRawPoints(value);
                                  setPoints(customerData?.loyaltyPoints);
                                }
                              }}
                              onFocus={(e) => e.target.select()}
                              placeholder="Nhập điểm"
                              className="payment-form-input"
                              disabled={
                                parseFloat(
                                  calculateTotalAmount().finalAmount.replace(
                                    " VNĐ",
                                    ""
                                  )
                                ) === 0
                              }
                            />
                          </div>
                          <div className="payment-form-group">
                            <label className="payment-form-label">
                              Giảm giá (%):
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              value={discount}
                              onChange={(e) => setDiscount(e.target.value)}
                              placeholder="Nhập giảm giá"
                              className="payment-form-input"
                            />
                          </div>
                          {/* Kiểm tra tổng tiền và điểm tích lũy */}
                          {calculateTotalAmount().finalAmount !== 0 && (
                            <div>
                              {/* Thực hiện so sánh giữa điểm tích lũy và tổng tiền nếu tổng tiền khác 0 */}
                              {rawPoints > 0 &&
                              rawPoints <= customerData?.loyaltyPoints ? (
                                <p>Điểm đã được áp dụng vào tổng tiền.</p>
                              ) : (
                                <p>
                                  Điểm không hợp lệ hoặc không đủ để áp dụng.
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    <div className="payment-form-group">
                      <label className="payment-form-label">
                        Phương thức thanh toán:
                      </label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="payment-form-select"
                        required
                      >
                        <option value="" disabled>
                          Chọn phương thức thanh toán
                        </option>
                        <option value="TienMat">Tiền mặt</option>
                        {parseFloat(
                          calculateTotalAmount().finalAmount.replace(
                            /[^\d]/g,
                            ""
                          )
                        ) > 0 && <option value="QRCode">QR Code</option>}
                      </select>
                    </div>
                    <label className="payment-form-label">
                      {/* Hiển thị giảm giá theo hạng khách hàng */}
                      {calculateTotalAmount().membershipDiscountValue !==
                        "0 VNĐ" && (
                        <p className="payment-form-label">
                          Giảm giá theo hạng (
                          {calculateTotalAmount().membershipDiscount}%) với Hạng{" "}
                          {customerData?.membershipLevel}:{" "}
                          {calculateTotalAmount().membershipDiscountValue}
                        </p>
                      )}

                      {/* Hiển thị chiết khấu thông thường */}
                      {calculateTotalAmount().discountAmount !== "0 %" && (
                        <p className="payment-form-label">
                          Chiết khấu khuyến mãi:{" "}
                          {calculateTotalAmount().discountAmount}
                        </p>
                      )}

                      {/* Hiển thị trừ điểm tích lũy */}
                      {calculateTotalAmount().pointsValue !== "0 VNĐ" && (
                        <p className="payment-form-label">
                          Đã trừ điểm tích lũy:{" "}
                          {calculateTotalAmount().pointsValue}
                        </p>
                      )}

                      {/* Hiển thị phí vượt cân nếu có */}
                      {calculateTotalAmount().weightDeduction !== "0 VNĐ" && (
                        <p className="payment-form-label">
                          Phí vượt cân ({calculateTotalAmount().excessWeight}{" "}
                          kg): {calculateTotalAmount().weightDeduction}
                        </p>
                      )}

                      {/* Hiển thị áp dụng gói tháng nếu có */}
                      {calculateTotalAmount().subscriptionDiscount !==
                        "0 VNĐ" && (
                        <p className="payment-form-label">
                          Áp dụng gói tháng: -
                          {calculateTotalAmount().subscriptionDiscount}
                        </p>
                      )}

                      {/* Hiển thị phí giao hàng nếu có */}
                      {calculateTotalAmount().shippingFee !== "0 VNĐ" && (
                        <p className="payment-form-label">
                          Phí giao hàng: {calculateTotalAmount().shippingFee}
                        </p>
                      )}

                      {/* Hiển thị tổng tiền cuối cùng */}
                      <p className="payment-form-label">
                        <strong>
                          Tổng tiền: {calculateTotalAmount().finalAmount}
                        </strong>
                      </p>
                    </label>

                    <button
                      type="submit"
                      className={`payment-form-submit-btn ${
                        paymentData?.paymentStatus === "Success"
                          ? "payment-success"
                          : ""
                      }`}
                      disabled={
                        loadingModalPayment ||
                        paymentData?.paymentStatus === "Success"
                      }
                    >
                      {loadingModalPayment
                        ? "Đang xử lý..."
                        : paymentData?.paymentStatus === "Success"
                        ? "Đã hoàn thành"
                        : "Xác nhận"}
                    </button>
                  </form>

                  <div className="payment-modal-actions">
                    <button
                      onClick={() => {
                        const invoiceContent = generateInvoiceContent(
                          booking,
                          bookingDetailData,
                          customerData,
                          staffInfo,
                          paymentData,
                          shippingFee
                        );

                        // Create a new window and write the invoice content to it
                        const printWindow = window.open("", "_blank");
                        if (printWindow) {
                          printWindow.document.write(invoiceContent);
                          printWindow.document.close();
                        } else {
                          alert(
                            "Vui lòng cho phép trình duyệt mở cửa sổ pop-up để in hóa đơn."
                          );
                        }
                      }}
                      className="booking-detail-staff-modal-button transfer-invoice"
                    >
                      In hóa đơn
                    </button>

                    <button
                      onClick={() => setShowQRCode(false)}
                      className="payment-close-btn"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
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
                <button onClick={() => setQrUrl("")}>Đóng</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to store the selected booking data
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Function to open the modal with booking data
  const onOpenModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    // Optional: Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
  };
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onCloseModal();
      }
    };

    // Add event listener for ESC key
    window.addEventListener("keydown", handleEscKey);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, []);
  // Function to close the modal
  const onCloseModal = () => {
    setIsModalOpen(false);
    // Re-enable body scrolling when modal closes
    document.body.style.overflow = "auto";
  };

  // Example data - replace this with your actual data source

  return (
    <>
      <Header />
      <div className="bookinglist-staff-container">
        <h1 className="bookinglist-staff-title">Quản lý đặt lịch giặt</h1>

        {/* Tabs */}
        <div className="bookinglist-staff-tabs">
          <ul className="bookinglist-staff-tab-list">
            <li>
              <button
                onClick={() => setActiveTab("Pending")}
                className={activeTab === "Pending" ? "active" : ""}
              >
                Chờ xác nhận
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Confirmed")}
                className={activeTab === "Confirmed" ? "active" : ""}
              >
                Đã xác nhận
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Received")}
                className={activeTab === "Received" ? "active" : ""}
              >
                Đã nhận hàng
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("InProgress")}
                className={activeTab === "InProgress" ? "active" : ""}
              >
                Đang xử lý
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Completed")}
                className={activeTab === "Completed" ? "active" : ""}
              >
                Đã giặt xong
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Delivering")}
                className={activeTab === "Delivering" ? "active" : ""}
              >
                Đang giao hàng/ Chờ khách đến nhận
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Done")}
                className={activeTab === "Done" ? "active" : ""}
              >
                Hoàn thành
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Canceled")}
                className={activeTab === "Canceled" ? "active" : ""}
              >
                Đã hủy
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("Rejected")}
                className={activeTab === "Rejected" ? "active" : ""}
              >
                Từ chối
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "active" : ""}
              >
                Tất cả
              </button>
            </li>
          </ul>
        </div>

        {/* Advanced Filter Toggle */}
        <div className="bookinglist-staff-filter-toggle">
          <button
            className="bookinglist-staff-btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc nâng cao"}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bookinglist-staff-advanced-filters">
            <div className="bookinglist-staff-filter-row">
              <div className="bookinglist-staff-filter-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filterParams.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="bookinglist-staff-filter-group">
                <label>Đến ngày:</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filterParams.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="bookinglist-staff-filter-row">
              <div className="bookinglist-staff-filter-group">
                <label>Tên khách hàng:</label>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Tìm theo tên khách hàng"
                  value={filterParams.customerName}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="bookinglist-staff-filter-group">
                <label>Nhân viên:</label>
                <input
                  type="text"
                  name="staffName"
                  placeholder="Tìm theo tên nhân viên"
                  value={filterParams.staffName}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="bookinglist-staff-filter-row">
              <div className="bookinglist-staff-filter-group">
                <label>Giá từ:</label>
                <input
                  type="number"
                  name="minAmount"
                  placeholder="Giá tối thiểu"
                  value={filterParams.minAmount}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="bookinglist-staff-filter-group">
                <label>Giá đến:</label>
                <input
                  type="number"
                  name="maxAmount"
                  placeholder="Giá tối đa"
                  value={filterParams.maxAmount}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="bookinglist-staff-filter-actions">
                <button
                  className="bookinglist-staff-btn-reset-filter"
                  onClick={resetFilters}
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bookinglist-staff-loading-container">
            <div className="bookinglist-staff-loading-spinner"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bookinglist-staff-error-message">
            <span>{error}</span>
            <button
              className="bookinglist-staff-retry-button"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Bookings table */}
        {!loading && !error && (
          <>
            <div className="bookinglist-staff-table-container">
              <table className="bookinglist-staff-booking-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("bookingId")}>
                      ID {getSortIndicator("bookingId")}
                    </th>
                    <th onClick={() => handleSort("bookingId")}>
                      Mã giặt {getSortIndicator("bookingId")}
                    </th>
                    <th onClick={() => handleSort("customerName")}>
                      Khách hàng {getSortIndicator("customerName")}
                    </th>
                    <th onClick={() => handleSort("branchName")}>
                      Thứ hạng {getSortIndicator("branchName")}
                    </th>
                    <th onClick={() => handleSort("bookingDate")}>
                      Ngày đặt {getSortIndicator("bookingDate")}
                    </th>
                    <th onClick={() => handleSort("staffName")}>
                      Nhân viên {getSortIndicator("staffName")}
                    </th>
                    <th onClick={() => handleSort("totalAmount")}>
                      Tổng tiền {getSortIndicator("totalAmount")}
                    </th>
                    <th onClick={() => handleSort("status")}>
                      Trạng thái {getSortIndicator("status")}
                    </th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="bookinglist-staff-no-bookings">
                        Không có lịch đặt nào phù hợp với điều kiện tìm kiếm
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking) => {
                      const { date, time } = formatDateTime(
                        booking.bookingDate
                      );
                      const statusInfo = statusConfig[booking.status] || {
                        displayName: booking.status,
                        cssClass: "bookinglist-staff-status-default",
                      };

                      return (
                        <tr key={booking.bookingId}>
                          <td>#{booking.bookingId}</td>
                          <td>
                            {booking.bookingDetailIds?.length
                              ? booking.bookingDetailIds.join(", ")
                              : "N/A"}
                          </td>

                          <td
                            className="booking-name"
                            onClick={() => onOpenModal(booking)}
                          >
                            {booking.customerName ||
                              `${booking.guestName} (Guest)`}
                          </td>

                          <td>
                            {booking.membershipLevel ? (
                              <span
                                className={`bookinglist-staff-membership-badge bookinglist-staff-${booking.membershipLevel.toLowerCase()}`}
                              >
                                {booking.membershipLevel}
                              </span>
                            ) : (
                              <span className="bookinglist-staff-membership-default">
                                Chưa có hạng
                              </span>
                            )}
                          </td>

                          <td>
                            {date} {time}
                          </td>
                          <td>{booking.staffName || "Chưa xác định"}</td>
                          <td>{formatCurrency(booking.totalAmount)}</td>
                          {booking.deliveryAddress ? (
                            <td>
                              <span
                                className={`bookinglist-staff-status-badge ${statusInfo.cssClass}`}
                              >
                                {statusInfo.displayName}
                              </span>
                            </td>
                          ) : (
                            <>
                              <>
                                {booking.status == "Delivering" ? (
                                  <td>
                                    <span
                                      style={{
                                        color: "#4a3f8c",
                                        border: "0px solid #4a3f8c",
                                        backgroundColor: "#f3e8ff",
                                      }}
                                      className={`bookinglist-staff-status-badge bookinglist-staff-status-default`}
                                    >
                                      Chờ khách nhận hàng
                                    </span>
                                  </td>
                                ) : (
                                  <td>
                                    <span
                                      className={`bookinglist-staff-status-badge ${statusInfo.cssClass}`}
                                    >
                                      {statusInfo.displayName}
                                    </span>
                                  </td>
                                )}
                              </>
                            </>
                          )}

                          <td className="bookinglist-staff-action-buttons">
                            <button
                              className="bookinglist-staff-btn-detail"
                              onClick={() => onOpenModal(booking)}
                            >
                              <Eye size={20} />
                            </button>
                            {booking.status === "Pending" && (
                              <>
                                <button
                                  className="bookinglist-staff-btn-confirm"
                                  onClick={() =>
                                    handleStatusBookingChange(
                                      booking.bookingId,
                                      "Confirmed"
                                    )
                                  }
                                >
                                  Xác nhận
                                </button>

                                <button
                                  className="bookinglist-staff-btn-reject"
                                  onClick={() =>
                                    handleStatusBookingChange(
                                      booking.bookingId,
                                      "Rejected"
                                    )
                                  }
                                >
                                  Từ chối
                                </button>
                              </>
                            )}
                            {booking.status === "Confirmed" && (
                              <button
                                className="bookinglist-staff-btn-progress"
                                onClick={() =>
                                  handleStatusBookingChange(
                                    booking.bookingId,
                                    "Received"
                                  )
                                }
                              >
                                Đã nhận được hàng
                              </button>
                            )}

                            {booking.status === "Completed" && (
                              <>
                                {booking.deliveryAddress ? (
                                  <button
                                    className="bookinglist-staff-btn-delivery"
                                    onClick={() =>
                                      handleStatusBookingChange(
                                        booking.bookingId,
                                        "Delivering"
                                      )
                                    }
                                  >
                                    Bắt đầu giao hàng
                                  </button>
                                ) : (
                                  <button
                                    className="bookinglist-staff-btn-waiting"
                                    onClick={() =>
                                      handleStatusBookingChange(
                                        booking.bookingId,
                                        "Delivering"
                                      )
                                    }
                                  >
                                    Chờ khách đến nhận
                                  </button>
                                )}
                              </>
                            )}

                            {booking.status === "Received" && (
                              <button
                                className="bookinglist-staff-btn-complete"
                                onClick={() =>
                                  handleStatusBookingChange(
                                    booking.bookingId,
                                    "InProgress"
                                  )
                                }
                              >
                                Bắt đầu xử lý
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {/* The modal component */}
              <BookingDetailStaffModal
                isOpen={isModalOpen}
                onClose={onCloseModal}
                booking={selectedBooking}
              />
            </div>

            <div className="bookinglist-staff-pagination-container">
              <div className="bookinglist-staff-booking-count">
                Hiển thị{" "}
                <span className="bookinglist-staff-count">
                  {filteredBookings.length}
                </span>{" "}
                lịch đặt
                {pagination.totalPages > 1 && (
                  <span className="bookinglist-staff-pagination-info">
                    (Trang {pagination.currentPage}/{pagination.totalPages})
                  </span>
                )}
              </div>
              <div className="bookinglist-staff-pagination-controls">
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      itemsPerPage: Number(e.target.value),
                      currentPage: 1,
                    }))
                  }
                >
                  <option value={5}>5 mục/trang</option>
                  <option value={10}>10 mục/trang</option>
                  <option value={20}>20 mục/trang</option>
                  <option value={50}>50 mục/trang</option>
                </select>
              </div>
              <div className="bookinglist-staff-pagination-buttons">
                <button
                  className="bookinglist-staff-btn-prev"
                  disabled={pagination.currentPage === 1}
                  onClick={handlePrevPage}
                >
                  Trước
                </button>
                {pagination.totalPages > 1 &&
                  Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const start = Math.max(1, pagination.currentPage - 2);
                        const end = Math.min(pagination.totalPages, start + 4);
                        pageNum = start + i;
                        if (pageNum > end) return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          className={`bookinglist-staff-page-number ${
                            pagination.currentPage === pageNum
                              ? "bookinglist-staff-page-number active"
                              : ""
                          }`}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              currentPage: pageNum,
                            }))
                          }
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                <button
                  className="bookinglist-staff-btn-next"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={handleNextPage}
                >
                  Tiếp
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />;
    </>
  );
};

export default ListBooking;
