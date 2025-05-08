import { useState, useEffect } from "react";
import * as jwt_decode from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;
// Custom hook to manage the dashboard data and API requests
export const useDashboardData = (branchId, date, customerId) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [branchRevenue, setBranchRevenue] = useState(null);
  const [serviceRevenue, setServiceRevenue] = useState(null);
  const [customerRevenue, setCustomerRevenue] = useState(null);
  const [paymentRevenue, setPaymentRevenue] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);

  // Get the JWT token from local storage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setErrorMessage(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwt_decode(token);
    } catch (error) {
      setErrorMessage("Token không hợp lệ. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    fetchData(token);
  }, [branchId, date, customerId]);

  const fetchData = async (token) => {
    setLoading(true);
    try {
      // Fetch total revenue
      const totalRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/total-revenue`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const totalRevenueData = await totalRevenueResponse.json();
      setTotalRevenue(totalRevenueData);

      // Fetch branch revenue using dynamic branchId and date
      const branchRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/branch-revenue/${branchId}?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const branchRevenueData = await branchRevenueResponse.json();
      setBranchRevenue(branchRevenueData);

      // Fetch all branch revenue by month and year using dynamic date
      const allBranchRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/all-branch-revenue-by-month-and-year?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const allBranchRevenueData = await allBranchRevenueResponse.json();
      setBranchRevenue(allBranchRevenueData);

      // Fetch service revenue
      const serviceRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/service-revenue?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const serviceRevenueData = await serviceRevenueResponse.json();
      setServiceRevenue(serviceRevenueData);

      // Fetch customer revenue using dynamic customerId and date
      const customerRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/customer-revenue/${customerId}?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const customerRevenueData = await customerRevenueResponse.json();
      setCustomerRevenue(customerRevenueData);

      // Fetch all customer revenue
      const allCustomerRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/all-customer-revenue?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const allCustomerRevenueData = await allCustomerRevenueResponse.json();
      setCustomerRevenue(allCustomerRevenueData);

      // Fetch payment revenue
      const paymentRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/payment-revenue`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const paymentRevenueData = await paymentRevenueResponse.json();
      setPaymentRevenue(paymentRevenueData);

      // Fetch order statistics
      const orderStatsResponse = await fetch(
        `${apiUrl}/api/Order/order-statistics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const orderStatsData = await orderStatsResponse.json();
      setOrderStats(orderStatsData);

      // Fetch ongoing orders
      const ongoingOrdersResponse = await fetch(
        `${apiUrl}/api/Order/ongoing-orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const ongoingOrdersData = await ongoingOrdersResponse.json();
      setOngoingOrders(ongoingOrdersData);

      // Fetch branch list for dropdown
      const branchesResponse = await fetch(`${apiUrl}/api/Branch/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const branchesData = await branchesResponse.json();
      setBranches(branchesData || []);

      // Fetch services list for dropdown
      const servicesResponse = await fetch(`${apiUrl}/api/Service/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const servicesData = await servicesResponse.json();
      setServices(servicesData || []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMessage(
        "Failed to fetch data. Please check your connection or try again later."
      );
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    loading,
    errorMessage,
    totalRevenue,
    branchRevenue,
    serviceRevenue,
    customerRevenue,
    paymentRevenue,
    orderStats,
    ongoingOrders,
    branches,
    services,
  };
};
