import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const user = jwtDecode(token);
    return {
      id: user.AccountId,
      name: user.Name,
      email: user.Email,
      role: user[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      exp: user.exp,
    };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

const PublicRoute = ({ children }) => {
  const location = useLocation();

  if (isAuthenticated()) {
    const user = getUser();

    if (!user) return <Navigate to="/" replace />;

    if (user.role === "Admin") {
      return (
        <Navigate to="/admin/dashboard" replace state={{ from: location }} />
      );
    } else if (user.role === "Manager") {
      return (
        <Navigate
          to="/manager/dashboard_manager"
          replace
          state={{ from: location }}
        />
      );
    } else if (user.role === "Staff") {
      return (
        <Navigate
          to="/nhan-vien/trang-chu"
          replace
          state={{ from: location }}
        />
      );
    }

    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default PublicRoute;
