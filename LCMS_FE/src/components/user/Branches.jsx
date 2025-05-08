import React, { useEffect, useState } from "react";
import Header from "../reuse/Header";
import "../../assets/css/user/branches.css";
import Footer from "../reuse/Footer";
import LoadingSkeleton from "../reuse/LoadingSkeleton";
import { fetchBranches } from "../../admin/manage_branches";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [isFetchingBranchesFail, setIsFetchingBranchesFail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { branchId } = useParams();

  const handleBranchDetail = (id) => {
    if (id) {
      document.getElementById("branch-detail").scrollIntoView({
        behavior: "smooth",
      });
      navigate(`/user/branches/${id}`);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchBranches()
      .then((data) => {
        setBranches(data.filter((x) => x.statusDelete !== false));
        setIsFetchingBranchesFail(false);
      })
      .catch((error) => {
        setIsFetchingBranchesFail(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="wrapper-container">
      <Header></Header>
      {isLoading ? (
        <>
          <div className="content-header">
            <div className="content-header-content">
              <div className="content-header-image">
                <img src="/branches.svg" alt="Service" />
              </div>
              <h2>Chi Nhánh</h2>
            </div>
          </div>
          <div className="branches-container">
            <ToastContainer />
            <div className="branches-content">
              <h5>Giặt Là Nhanh - Giặt sạch hoàn hảo, dịch vụ tận tâm!</h5>
              <h6>Ngày cập nhật: 23-02-2023</h6>
              <h3>
                Dịch vụ Giặt Là Nhanh - Chất lượng vượt trội, phục vụ nhanh
                chóng! Với đội ngũ nhân viên chuyên nghiệp và công nghệ giặt là
                hiện đại, chúng tôi cam kết mang đến cho bạn những bộ đồ sạch
                sẽ, thơm tho như mới. Đặc biệt, dịch vụ của chúng tôi luôn bảo
                vệ vải vóc, giữ màu sắc lâu bền. Hãy đặt dịch vụ giặt là ngay
                hôm nay để nhận ưu đãi đặc biệt!
              </h3>
              <div className="branches-mini-info-list">
                <div className="branches-mini-info">
                  <img src="../../../../public/pin.webp" alt="" />
                  <h3>0</h3>
                </div>
                <div className="branches-mini-info">
                  <img src="../../../../public/star.webp" alt="" />
                  <h3>4.9</h3>
                </div>
                <div className="branches-mini-info">
                  <img src="../../../../public/time.webp" alt="" />
                  <h3>23-02-2003</h3>
                </div>
              </div>
              <div className="branches-title">
                <h3>Chi Nhánh</h3>
              </div>
              <div className="branches-info-list">
                <LoadingSkeleton></LoadingSkeleton>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="content-header">
            <div className="content-header-content">
              <div className="content-header-image">
                <img src="/branches.svg" alt="Service" />
              </div>
              <h2>Chi Nhánh</h2>
            </div>
          </div>
          <div className="branches-container">
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
            <div className="branches-content">
              <h5>Giặt Là Nhanh - Giặt sạch hoàn hảo, dịch vụ tận tâm!</h5>
              <h6>Ngày cập nhật: 23-02-2023</h6>
              <h3>
                Dịch vụ Giặt Là Nhanh - Chất lượng vượt trội, phục vụ nhanh
                chóng! Với đội ngũ nhân viên chuyên nghiệp và công nghệ giặt là
                hiện đại, chúng tôi cam kết mang đến cho bạn những bộ đồ sạch
                sẽ, thơm tho như mới. Đặc biệt, dịch vụ của chúng tôi luôn bảo
                vệ vải vóc, giữ màu sắc lâu bền. Hãy đặt dịch vụ giặt là ngay
                hôm nay để nhận ưu đãi đặc biệt!
              </h3>
              <div className="branches-mini-info-list">
                <div className="branches-mini-info">
                  <img src="../../../../public/pin.webp" alt="" />
                  <h3>{branches?.length}</h3>
                </div>
                <div className="branches-mini-info">
                  <img src="../../../../public/star.webp" alt="" />
                  <h3>0949948848</h3>
                </div>
                <div className="branches-mini-info">
                  <img src="../../../../public/time.webp" alt="" />
                  <h3>giatlanhanh@gmail.com</h3>
                </div>
              </div>
              <div className="branches-title">
                <h3>Chi Nhánh</h3>
              </div>
              <div className="branches-info-list">
                {isFetchingBranchesFail ? (
                  <p>Không thể tải dữ liệu. Vui lòng thử lại sau!</p>
                ) : (
                  branches.map((b) => (
                    <div className="branches-info" key={b.branchId}>
                      <a className="branches-img">
                        <img src={b.image}></img>
                      </a>
                      <div className="branches-info-left">
                        <div className="branches-info-left-text">
                          <h3>Giat La Nhanh - {b.branchName}</h3>
                          <div className="branches-info-left-location">
                            <span></span>
                            {b.address}
                          </div>
                        </div>
                        <div className="branches-info-left-button">
                          <a
                            className="branches-info-left-button-a"
                            onClick={() => handleBranchDetail(b.branchId)}
                          >
                            Xem chi tiết
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div id="branch-detail">
                {isFetchingBranchesFail ? (
                  <></>
                ) : (
                  <>
                    {" "}
                    <Outlet></Outlet>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Branches;
