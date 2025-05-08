import { useNavigate } from "react-router-dom";
import { useApi } from "../../services/apiContext";

const ErrorPage = () => {
  const { error } = useApi();
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <h2>Đã có lỗi xảy ra!</h2>
      <p>{error || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."}</p>
      <button onClick={() => navigate("/")}>Quay lại trang chủ</button>
    </div>
  );
};

export default ErrorPage;
