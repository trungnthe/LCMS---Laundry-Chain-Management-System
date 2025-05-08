import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  UnauthorizedPage,
} from "./components/user/ProtectedRoute";
import { useEffect } from "react";

// ====== Authentication ======//
import Login from "./components/common/Login";
import Register from "./components/common/Register";
import Verification from "./components/common/Verification";
import ForgotPassword from "./components/common/ForgotPassword";
import ChangePassword from "./components/common/ChangePassword";

// ====== User ======//
import Services from "./components/user/Services";
import HomePage from "./components/user/HomePage";
import Pricing from "./components/user/Pricing";
import Branches from "./components/user/Branches";
import Blogs from "./components/user/Blogs";
import Profile from "./components/user/Profile";
import MyProfile from "./components/reuse/user/MyProfile";
import LoyaltyPoint from "./components/reuse/user/LoyaltyPoint";
import Notification from "./components/reuse/user/Notification";
import ServicesContent from "./components/reuse/user/ServicesContent";
import ServicesTypeContent from "./components/reuse/user/ServicesTypeContent";
import BookingHistoryDetail from "./components/reuse/user/BookingHistoryDetail";
import BookingHistory from "./components/reuse/user/BookingHistory";
import Booking from "./components/user/Booking";
import CheckoutPage from "./components/user/CheckOut";
import BlogDetail from "./components/user/BlogDetail";

// ====== Admin ======//
import DashBoard from "./components/admin/Dashboard";
import Manage_User from "./components/admin/Manage_User";
import Manage_Branches from "./components/admin/Manage_Branches";
import Manage_Schedule from "./components/admin/Manage_Schedule";
import Manage_Service from "./components/admin/Manage_Service";
import Manage_Service_Type from "./components/admin/Manage_Service_Type";
import Manage_Product_Category from "./components/admin/Manage_Product_Category";
import Manage_Product from "./components/admin/Manage_Product";
import Manage_Employee from "./components/admin/Manage_Employee";
import Manage_Timekeeping from "./components/admin/Manage_Timekeeping";
import Manage_Role_Salary from "./components/admin/Manage_Role_Salary";
import Manage_Inventory from "./components/admin/Manage_Inventory";
import Manage_Inventory_Detail from "./components/admin/Manage_Inventory_Detail";
import Manage_Shift from "./components/admin/Manage_Shift";
import Manage_Blog from "./components/admin/Manage_Blog";
import Manage_Notification from "./components/admin/Manage_Notification";

// ====== Manager ======//
import Dashboard_Manager from "./components/manager/Dashboard_Manager";
import Manager_Order from "./components/manager/Manager_Order";
import Manager_Customer from "./components/manager/Manager_Customer";
import Manager_Time from "./components/manager/Manager_Time";
import Manager_Employee from "./components/manager/Manager_Employee";
import Manager_Inventory from "./components/manager/Manager_Inventory";

// ====== Staff ======//
import DashboardStaff from "./components/staff/DashboardStaff";
import Create_Booking from "./components/staff/Create_Booking";
import InventoryManagement from "./components/staff/ManageInventory";
import StaffSalaryPage from "./components/staff/StaffSalaryPage";
import EmployeeTracker from "./components/staff/EmployeeTracker";
import ListBooking from "./components/staff/ListBooking";
import NotificationsPage from "./components/staff/Notification";

import LaundryMonthlyTicketPage from "./components/staff/LaundrySubscription";
import BrancheDetail from "./components/reuse/user/BrancheDetail";
import SubscriptionPage from "./components/user/Subscription";
import PublicRoute from "./components/user/PublicRoute";
import WeatherSuggestionAdmin from "./components/admin/Manage_Weather_Suggestion";

function App() {
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C")) ||
  //       (e.ctrlKey && e.key === "U")
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   const handleContextMenu = (e) => {
  //     e.preventDefault();
  //   };

  //   document.addEventListener("keydown", handleKeyDown);
  //   document.addEventListener("contextmenu", handleContextMenu);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //   };
  // }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              deniedRoles={["Staff", "Manager"]}
              allowUnauthenticated={true}
            >
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/verification" element={<Verification />} />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <PublicRoute>
              <ChangePassword />
            </PublicRoute>
          }
        />
        <Route
          path="/user/blogDetail"
          element={
            <ProtectedRoute allowedRoles={["Customer", "Admin"]}>
              <BlogDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* User Routes */}
        <Route
          path="/user/services"
          element={
            <ProtectedRoute
              deniedRoles={["Staff", "Manager"]}
              allowUnauthenticated={true}
            >
              <Services />
            </ProtectedRoute>
          }
        >
          <Route index element={<ServicesContent />} />
          <Route
            path="service/:serviceId"
            element={
              <ProtectedRoute
                deniedRoles={["Staff", "Manager"]}
                allowUnauthenticated={true}
              >
                <ServicesContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="service-type/:serviceId"
            element={
              <ProtectedRoute
                deniedRoles={["Staff", "Manager"]}
                allowUnauthenticated={true}
              >
                <ServicesTypeContent />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/user/pricing"
          element={
            <ProtectedRoute
              deniedRoles={["Staff", "Manager"]}
              allowUnauthenticated={true}
            >
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/branches"
          element={
            <ProtectedRoute
              deniedRoles={["Staff", "Manager"]}
              allowUnauthenticated={true}
            >
              <Branches />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute
                deniedRoles={["Staff", "Manager"]}
                allowUnauthenticated={true}
              >
                <BrancheDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path=":branchId"
            element={
              <ProtectedRoute
                deniedRoles={["Staff", "Manager"]}
                allowUnauthenticated={true}
              >
                <BrancheDetail />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/user/blogs"
          element={
            <ProtectedRoute
              deniedRoles={["Staff", "Manager"]}
              allowUnauthenticated={true}
            >
              <Blogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute allowedRoles={["Customer", "Staff"]}>
              <Profile />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyProfile />} />
          <Route path="booking-history" element={<BookingHistory />}>
            <Route path=":bookingId" element={<BookingHistoryDetail />} />
          </Route>
          <Route path="loyalty-point" element={<LoyaltyPoint />} />
          <Route path="notification" element={<Notification />} />
        </Route>
        <Route
          path="/user/booking"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/subscription"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/checkout"
          element={
            <ProtectedRoute allowedRoles={["Customer"]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <DashBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-user"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-branches"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Branches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-schedule"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-service"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Service />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-service-type"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Service_Type />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-product-category"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Product_Category />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-product"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-employee"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Employee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-timekeeping"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Timekeeping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-role-salary"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Role_Salary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-inventory"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-inventory-detail"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Inventory_Detail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-shift"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Shift />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-blog"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Blog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-notify"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Manage_Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-weather-suggestion"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <WeatherSuggestionAdmin />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard_manager"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <Dashboard_Manager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/orders"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <Manager_Order />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/customers"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <Manager_Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/time"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <Manager_Time />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/staff"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <Manager_Employee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/inventory"
          element={
            <ProtectedRoute allowedRoles={["Manager"]}>
              <Manager_Inventory />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/nhan-vien/trang-chu"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <DashboardStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/tao-lich-giat"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <Create_Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/lich-lam-viec-cham-cong"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <EmployeeTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/danh-sach-don-hang"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <ListBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/thong-tin-luong"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <StaffSalaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/thong-bao"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/kho-hang"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <InventoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nhan-vien/ve-thang"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <LaundryMonthlyTicketPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
