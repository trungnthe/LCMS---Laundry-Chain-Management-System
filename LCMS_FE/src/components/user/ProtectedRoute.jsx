import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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

const hasRole = (allowedRoles, user) => {
  if (!user) return allowedRoles.length === 0;
  return allowedRoles.length === 0 || allowedRoles.includes(user.role);
};

const isDenied = (deniedRoles, user) => {
  if (!user) return false;
  return deniedRoles.includes(user.role);
};

// Component bảo vệ route
const ProtectedRoute = ({
  children,
  allowedRoles = [],
  deniedRoles = [],
  allowUnauthenticated = false,
}) => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const user = getUser();

    if (!allowUnauthenticated && !user) {
      navigate("/unauthorized", { replace: true });
    } else if (isDenied(deniedRoles, user) || !hasRole(allowedRoles, user)) {
      // Nếu bị từ chối quyền truy cập và vào trang chủ, chuyển hướng đến trang dashboard của vai trò tương ứng
      if (user) {
        if (user.role === "Admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (user.role === "Manager") {
          navigate("/manager/dashboard_manager", { replace: true });
        } else if (user.role === "Staff") {
          navigate("/nhan-vien/trang-chu", { replace: true });
        } else {
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/unauthorized", { replace: true });
      }
    }

    setCheckingAuth(false);
  }, [navigate, allowedRoles, deniedRoles, allowUnauthenticated]);

  if (checkingAuth) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return children;
};

// Trang thông báo không có quyền truy cập
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <svg
            style={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>

        <h1 style={styles.title}>Không Có Quyền Truy Cập</h1>

        <p style={styles.message}>
          Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng quay lại
          hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.
        </p>

        <div style={styles.buttonContainer}>
          <button
            style={styles.secondaryButton}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#ebf8ff")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
            onClick={() => navigate(-1)}
          >
            Quay Lại
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS inline styles
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    margin: "16px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: "24px",
  },
  icon: {
    width: "96px",
    height: "96px",
    margin: "0 auto",
    color: "#e53e3e",
  },
  title: {
    marginBottom: "16px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  message: {
    marginBottom: "24px",
    color: "#666",
    lineHeight: "1.5",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  secondaryButton: {
    width: "100%",
    padding: "10px 16px",
    backgroundColor: "white",
    color: "#3182ce",
    border: "1px solid #3182ce",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};

export { ProtectedRoute, getUser, hasRole, isDenied, UnauthorizedPage };
