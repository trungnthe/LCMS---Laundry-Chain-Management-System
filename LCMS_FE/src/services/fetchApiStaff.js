// services/staff.js
import { fetchWithRefresh,refreshToken } from "./authHelper";
import {jwtDecode} from 'jwt-decode';

import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchStaffInfo = async () => {
  try {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token trong localStorage");
      return null;
    }

    // Giải mã token để lấy accountId
    const decodedToken = jwtDecode(token);
    const accountId = decodedToken.AccountId; // Giả sử payload token có trường `accountId`

    if (!accountId) {
      console.error("Token không chứa accountId");
      return null;
    }

    // Gọi API với accountId lấy từ token
    const response = await fetch(`${apiUrl}/api/Employee/get-employee-by-id?id=${accountId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token trong header
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhân viên:", error);
    return null;
  }
};



  export const getBranchById = async (branchId, setBranchData) => {
    try {
        const response = await fetch(`${apiUrl}/api/Branch/getById/${branchId}`);
        if (response.ok) {
            const data = await response.json();
            setBranchData(data); // Lưu toàn bộ dữ liệu chi nhánh
        } else {
            console.error("Lỗi khi lấy thông tin chi nhánh:", await response.text());
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }

  }

  
  export const getAttendanceToday = async () => {
    try {
      const response = await fetchWithRefresh(`${apiUrl}/api/Attendance/get-attendance-today`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response) {
        toast.error("❌ Lỗi khi lấy dữ liệu điểm danh!");
        return { error: "❌ Lỗi khi lấy dữ liệu điểm danh!" };
      }

      return response; // Trả về dữ liệu JSON đã được xử lý
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
      toast.error("❌ Lỗi kết nối đến server!");
      return { error: "❌ Lỗi kết nối đến server!" };
    }
  };


  export const GetAttendanceByAccount = async () => {
    try {
      const response = await fetchWithRefresh(`${apiUrl}/api/Attendance/get-attendance-by-employee`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response) {
        toast.error("❌ Lỗi khi lấy dữ liệu điểm danh!");
        return { error: "❌ Lỗi khi lấy dữ liệu điểm danh!" };
      }

      return response; // Trả về dữ liệu JSON đã được xử lý
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
      toast.error("❌ Lỗi kết nối đến server!");
      return { error: "❌ Lỗi kết nối đến server!" };
    }
  };

  export const GetAllInventory = async () => {
    try {
      const response = await fetchWithRefresh(`${apiUrl}/api/Inventory/get-all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response) {
        toast.error("❌ Lỗi khi lấy dữ liệu điểm danh!");
        return { error: "❌ Lỗi khi lấy dữ liệu điểm danh!" };
      }

      return response; // Trả về dữ liệu JSON đã được xử lý
    } catch (error) {
      toast.error("❌ Lỗi kết nối đến server!");
      return { error: "❌ Lỗi kết nối đến server!" };
    }
  };
  export const getAttendanceTodayByTime = async () => {
    try {
      const response = await fetchWithRefresh(`${apiUrl}/api/Attendance/get-attendance-today-by-time`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response) {
        return { error: "❌ Lỗi khi lấy dữ liệu điểm danh!" };
      }

      return response; // Trả về dữ liệu JSON đã được xử lý
    } catch (error) {
      return { error: "❌ Lỗi kết nối đến server!" };
    }
  };

  export const getLowStockWarningsAsync = async (setLowStockData) => {
    try {
      const response = await fetchWithRefresh(`${apiUrl}/api/Inventory/get-low-stock-warnings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response) return { error: "❌ Lỗi khi lấy cảnh báo hàng tồn thấp!" };
  
      setLowStockData(response);
  
      // Kiểm tra nếu có SignalR connection thì gửi update
    
  
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
    }
  };
  


export const getBookingPendingAsync = async (setBookingPendingData) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/Booking/list-all-booking-pending`, {
          method: "GET",
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          console.error("Lỗi API: ", response.status, response.statusText);
          return;
      }

      const data = await response.json();

  
      if (Array.isArray(data)) {
        setBookingPendingData(data);
        return data; // trả về luôn để dùng ở chỗ khác
      }else{
        console.warn("Không có booking pending.");

      }
  } catch (error) {
      console.error("Lỗi khi gọi API:", error); 
  }
};

export const getAllBookingsDeliveringAsync = async (setBookingDeliveringData) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/Booking/list-all-booking-delivering`, {
          method: "GET",
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          console.error("Lỗi API: ", response.status, response.statusText);
          return;
      }

      const data = await response.json();

  
      if (Array.isArray(data)) {
        setBookingDeliveringData(data);
        return data; // trả về luôn để dùng ở chỗ khác
      }else{
        console.warn("Không có booking pending.");

      }
  } catch (error) {
      console.error("Lỗi khi gọi API:", error); 
  }
};

  
  
// fetchApiStaff.js
export const getBookingDetailAsync = async (bookingId) => { // Remove setBookingDetailData parameter
  try {
    const token = localStorage.getItem("token");
    if (!token) return null; // Return null or handle no token case appropriately

    const response = await fetch(`${apiUrl}/api/Booking/${bookingId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Lỗi API: ", response.status, response.statusText);
      return null; // Return null or handle API error appropriately
    }

    const data = await response.json();
    return data; // Return the fetched data

  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Return null or handle error appropriately
  }
};


export const getCustomerByIdlAsync = async (customerId) => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetchWithRefresh(`${apiUrl}/api/Customer/get-customer-byID?Id=${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không hợp lệ
    if (!response) {
      console.error("Không có phản hồi từ API.");
      return null;
    }

    // Nếu dữ liệu hợp lệ, trả về dữ liệu JSON
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
};
export const getLaundrySubByIdlAsync = async (customerId) => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetch(`${apiUrl}/api/LaundrySub/get-by-account/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không thành công
    if (!response.ok) {
      // Nếu response không thành công (status khác 2xx), trả về null
      return null;
    }

    // Nếu response thành công, trả về dữ liệu JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Nếu có lỗi xảy ra, trả về null
    return null;
  }
};
export const fetchPaymentSuccessByBoookingId = async (bookingId) => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetch(`${apiUrl}/api/Payment/get-paymentsuccess-by-bookingId?bookingId=${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không thành công
    if (!response.ok) {
      // Nếu response không thành công (status khác 2xx), trả về null
      return null;
    }

    // Nếu response thành công, trả về dữ liệu JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Nếu có lỗi xảy ra, trả về null
    return null;
  }
};

export const getBookingDetailByBookingIdAsync = async (bookingId) => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetchWithRefresh(`${apiUrl}/api/Booking/${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không hợp lệ
    if (!response) {
      console.error("Không có phản hồi từ API.");
      return null;
    }

    // Nếu dữ liệu hợp lệ, trả về dữ liệu JSON
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
};

export const fetchAllFeedbacksByBranchAsync = async (setFeedbackData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(`${apiUrl}/api/Feedback/GetAllFeedbacksByBranch`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Lỗi API: ", response.status, response.statusText);
      return;
    }

    const data = await response.json(); // 💥 Bổ sung dòng này để lấy dữ liệu từ response

    if (Array.isArray(data)) {
      setFeedbackData(data);
      return data; // Trả về data để dùng tiếp nếu cần
    } else {
      console.warn("Không có feedback nào.");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API feedback:", error);
  }
};




export const getBookingByBookingIdAsync = async (bookingId) => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetchWithRefresh(`${apiUrl}/api/AdminBooking/get-booking-id?bookingId=${bookingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không hợp lệ
    if (!response) {
      console.error("Không có phản hồi từ API.");
      return null;
    }

    // Nếu dữ liệu hợp lệ, trả về dữ liệu JSON
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
};

  

export const fetchStaffName = async (
  accountId,
  setStaffName,
  setEmployeeRoleName,
  setBranchName
) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/Employee/get-employee-by-id?id=${accountId}`
    );
    if (response.ok) {
      const data = await response.json();
      setStaffName(data.employeeName);
      setEmployeeRoleName(data.employeeRoleName);
      setBranchName(data.branchName);
    } else {
      console.error("Lỗi khi lấy tên nhân viên:", await response.text());
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
  }
};


export const updateBookingStatusAsync = async (bookingId, newStatus) => {
  try {
    const response = await fetchWithRefresh(`${apiUrl}/api/BookingHistory/update-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, newStatus }),
    });

    if (!response.ok) {
      // Kiểm tra nếu response không thành công (status khác 2xx)
      return { error: "❌ Lỗi khi cập nhật trạng thái!" };
    }

    // Lấy dữ liệu JSON từ response
    const data = await response.json();
    
    return data; // Trả về thông báo từ server
  } catch (error) {
    return { error: "❌ Lỗi kết nối đến server!" };
  }
};

export const updateBookingDetailStatusAsync = async (id, newStatus) => {  
  const requestBody = { id, newStatus };  

  try {  
    const response = await fetchWithRefresh(`${apiUrl}/api/BookingHistory/update-statusBookingDetail`, {  
      method: "PUT",  
      headers: { "Content-Type": "application/json" },  
      body: JSON.stringify(requestBody),  
    });  

    if (!response) return { error: "❌ Lỗi khi cập nhật trạng thái!" };

    return response;  
  } catch (error) {  
    return { error: "❌ Lỗi kết nối đến server!" };  
  }  
};


export const UpdateWeightBookingDetailAsync = async (id, weight) => {
  try {
    const requestBody = { id, weight };  
    const response = await fetchWithRefresh(
      `${apiUrl}/api/BookingHistory/update-weightBookingDetail?id=${id}&weight=${weight}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),  
      }
    );

    if (!response) return { error: "❌ Lỗi khi cập nhật trạng thái!" };

    return response;  

  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return { error: error.message || "❌ Lỗi kết nối đến server!" };
  }
};

export const UpdateShippingFeeBookingAsync = async (id, shippingFee) => {
  try {
    const requestBody = { id, shippingFee };

    const response = await fetchWithRefresh(
      `${apiUrl}/api/BookingHistory/update-shippingFee?id=${id}&shippingFee=${shippingFee}`,  // Cập nhật đúng URL API
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),  // Gửi dữ liệu dưới dạng JSON
      }
    );

    if (!response) return { error: "❌ Lỗi khi cập nhật trạng thái!" };

    return response;  

    // Nếu thành công, trả về kết quả
  

  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return { error: error.message || "❌ Lỗi kết nối đến server!" };
  }
};

export const getAllCustomer = async () => {
  try {
      const response = await fetchWithRefresh(`${apiUrl}/api/Customer/get-all-customer`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });

      if (!response) { 
          throw new Error("Không nhận được phản hồi từ server.");
      }

      return response;
  } catch (error) {
      console.error("Lỗi khi gọi API:", error.message, error);
      return null;
  }
};

export const getAllBooking = async () => {
  try {
      const response = await fetchWithRefresh(`${apiUrl}/api/AdminBooking/get-all-booking`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });

      if (!response) { 
          throw new Error("Không nhận được phản hồi từ server.");
      }

      return response;
  } catch (error) {
      console.error("Lỗi khi gọi API:", error.message, error);
      return null;
  }
};

export const getAllDelivery = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/Booking/list-all-Delivery`);
    if (!response.ok) {
      console.error("Lỗi khi lấy thông tin giao hàng:", await response.text());
      return []; // Trả về mảng rỗng nếu lỗi để tránh lỗi khi `map()`
    }

    const data = await response.json();
    return data; // Trả về dữ liệu đúng cách
  } catch (error) {
    return []; // Tránh lỗi undefined khi gọi API thất bại
  }
};

export const getAllPaymentType = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/Booking/list-all-PaymentType`);
    if (!response.ok) {
      console.error("Lỗi khi lấy thông tin giao hàng:", await response.text());
      return []; // Trả về mảng rỗng nếu lỗi để tránh lỗi khi `map()`
    }

    const data = await response.json();
    return data; // Trả về dữ liệu đúng cách
  } catch (error) {
    return []; // Tránh lỗi undefined khi gọi API thất bại
  }
};



export const createBooking = async (bookingData) => {
  try {
    const response = await fetchWithRefresh(`${apiUrl}/api/Booking/direct-booking`, {
      method: "POST",
      body: JSON.stringify(bookingData),
      headers: { "Content-Type": "application/json" },
    });

    if (!response) {
      toast.error("Có lỗi xảy ra khi đặt lịch!");
      return null;
    }

    toast.success("Đặt lịch thành công!");
    return response;
  } catch (error) {
    toast.error("Có lỗi xảy ra khi đặt lịch!");
    return null;
  }
};




export async function createPayment(paymentData) {
    try {
        const response = await fetchWithRefresh(`${apiUrl}/api/payment/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData)
        });
        
        if (!response) {
          toast.error("Có lỗi xảy ra khi đặt tạo thanh toán!");
          return null;
        }
        
        return response;
    } catch (error) {
        return { error: error.message };
    }
}

export async function addDeduct(deductData) {
  try {
    const response = await fetchWithRefresh(`${apiUrl}/api/Inventory/deduct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deductData),
    });

    if (!response) {
      toast.error("Có lỗi xảy ra khi đặt lịch!");
      return null;
    }

    toast.success("Trừ hàng và ghi lịch sử thành công!");
    return response;

  } catch (error) {
    // Bắt lỗi nếu có
    toast.error("Có lỗi xảy ra: " + error.message);
    return { error: error.message };
  }
}




export async function createPaymentSubscription(packageName, currentUserId, paymentType) {
  try {
    const encodedPackageName = encodeURIComponent(packageName);
    const encodedPaymentType = encodeURIComponent(paymentType);

    const url = `${apiUrl}/api/payment/createSubscription?packageName=${encodedPackageName}&currentUserId=${currentUserId}&paymentType=${encodedPaymentType}`;

    // Lấy token từ localStorage hoặc nơi bạn lưu trữ
    const token = localStorage.getItem("token"); // Hoặc sessionStorage.getItem("token")

    const response = await fetch(url, {
      method: "POST", // Giữ POST nếu server cần POST
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Đính kèm token
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || "Có lỗi xảy ra khi tạo thanh toán!");
      return null;
    }

    // Trả về dữ liệu JSON phản hồi từ server
    return await response.json();
  } catch (error) {
    toast.error("Lỗi kết nối đến máy chủ!");
    return { error: error.message };
  }
}


export async function registerForCustomerByEmployee(name, phone, email, password) {
  try {
    const response = await fetchWithRefresh(`${apiUrl}/api/Employee/register-for-customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, phone, email, password }),
    });
        
    if (!response) {
      toast.error("Có lỗi xảy ra khi đặt tạo thanh toán!");
      return null;
    }
    toast.success("Thêm khách hàng thành công!");

  } catch (error) {
    toast.error("Tài khoản đã tồn tại!");
    return { error: error.message };
  }
}



export async function responseFeedback(parentfeedbackId, replyData) {
  try {
    const response = await fetchWithRefresh(`${apiUrl}/api/Feedback/${parentfeedbackId}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(replyData),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

export async function addTicket(packageName, customerId) {
  try {
    // Đảm bảo mã hóa các tham số packageName và customerId trong URL
    const response = await fetchWithRefresh(`${apiUrl}/api/LaundrySub/Add-Sub-By-Staff?packageName=${encodeURIComponent(packageName)}&accountid=${customerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      toast.error("Có lỗi xảy ra khi đặt tạo thanh toán!");
      return null;
    }

    toast.success("Thêm khách hàng thành công!");
  } catch (error) {
    toast.error("Lỗi kết nối đến máy chủ!");
    return { error: error.message };
  }
}

export async function cancelPayment(paymentId) {
  try {
    // Đảm bảo mã hóa các tham số packageName và customerId trong URL
    const response = await fetch(`${apiUrl}/api/Payment/cancel/${paymentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      toast.error("Có lỗi xảy ra khi đặt tạo thanh toán!");
      return null;
    }

    toast.success("Hủy thành công");
  } catch (error) {
    toast.error("Lỗi kết nối đến máy chủ!");
    return { error: error.message };
  }
}

export const getMyNotificationlAsync = async () => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetchWithRefresh(`${apiUrl}/api/Notification/my-notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không hợp lệ
    if (!response) {
      console.error("Không có phản hồi từ API.");
      return null;
    }

    // Nếu dữ liệu hợp lệ, trả về dữ liệu JSON
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
};


export const fetchSalaryStructure = async (empRoleId) => {
  try {
    // Gọi hàm fetch để lấy dữ liệu từ API
    const response = await fetch(`${apiUrl}/api/SalaryStructure/get-salary-by-id/${empRoleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không hợp lệ
    if (!response.ok) {
      console.error("API trả về lỗi:", response.statusText);
      return null;
    }

    // Nếu dữ liệu hợp lệ, trả về dữ liệu JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
};
export const fetchDataTotalHoursWorked = async (year,month) => {
  try {
    // Gọi hàm fetchWithRefresh để lấy dữ liệu từ API
    const response = await fetchWithRefresh(`${apiUrl}/api/Attendance/staff/get-total-hours-worked/${year}/${month}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Kiểm tra nếu response không hợp lệ
    if (!response) {
      console.error("Không có phản hồi từ API.");
      return null;
    }
 
    // Nếu dữ liệu hợp lệ, trả về dữ liệu JSON
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null; // Trả về null nếu có lỗi xảy ra
  }
};