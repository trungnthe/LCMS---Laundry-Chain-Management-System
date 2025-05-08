import React, { useEffect, useState } from "react";
import { fetchServiceById, fetchServices } from "../../../admin/manage_service";
import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingSkeleton from "../../reuse/LoadingSkeleton";

const ServicesContent = () => {
  const [serviceList, setServiceList] = useState([]);
  const [err, setErr] = useState(false);
  const { serviceId } = useParams();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingServiceFail, setIsFetchingServiceFail] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });

    if (!serviceId) {
      setErr(true);
      setServiceList([]);
      return;
    }

    setIsLoading(true);
    setErr(false);

    fetchServiceById(serviceId)
      .then((data) => {
        if (data) {
          setServiceList(Array.isArray(data) ? data : [data]);
        } else {
          setErr(true);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải dịch vụ:", err);
        setErr(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [serviceId]);

  useEffect(() => {
    setIsFetchingServiceFail(true);

    fetchServices()
      .then((data) => {
        setServices(data.filter((x) => x.statusDelete !== false));
        setIsFetchingServiceFail(false);
      })
      .catch(() => {
        setIsFetchingServiceFail(true);
      });
  }, []);

  return (
    <div className="services-right">
      {isLoading ? (
        <>
          <div className="services-content">
            <div className="branches-content">
              <h5>Danh sách các dịch vụ:</h5>
              <h6>Nhấn vào để xem chi tiết</h6>
              <h3>
                Dịch vụ Giặt Là ABC - Chất lượng vượt trội, phục vụ nhanh chóng!
                Với đội ngũ nhân viên chuyên nghiệp và công nghệ giặt là hiện
                đại, chúng tôi cam kết mang đến cho bạn những bộ đồ sạch sẽ,
                thơm tho như mới. Đặc biệt, dịch vụ của chúng tôi luôn bảo vệ
                vải vóc, giữ màu sắc lâu bền. Hãy đặt dịch vụ giặt là ngay hôm
                nay để nhận ưu đãi đặc biệt!
              </h3>
              <div className="branches-title">
                <h3>Dịch Vụ</h3>
              </div>
            </div>
            <div className="services-right-content-skeleton">
              <LoadingSkeleton></LoadingSkeleton>
            </div>
          </div>
        </>
      ) : (
        <>
          {err ? (
            <div className="services-content">
              <div className="branches-content">
                <h5>Danh sách các dịch vụ:</h5>
                <h6>Nhấn vào để xem chi tiết</h6>
                <h3>
                  Dịch vụ Giặt Là Nhanh - Chất lượng vượt trội, phục vụ nhanh
                  chóng! Với đội ngũ nhân viên chuyên nghiệp và công nghệ giặt
                  là hiện đại, chúng tôi cam kết mang đến cho bạn những bộ đồ
                  sạch sẽ, thơm tho như mới. Đặc biệt, dịch vụ của chúng tôi
                  luôn bảo vệ vải vóc, giữ màu sắc lâu bền. Hãy đặt dịch vụ giặt
                  là ngay hôm nay để nhận ưu đãi đặc biệt!
                </h3>
                <div className="branches-title">
                  <h3>Dịch Vụ</h3>
                </div>
              </div>
              <div className="services-right-content">
                {isFetchingServiceFail ? (
                  <>
                    <p style={{ padding: "1%" }}>
                      Không thể tải dữ liệu. Vui lòng thử lại sau!
                    </p>
                  </>
                ) : (
                  <>
                    {services
                      .filter((x) => x.serviceTypeId == 1)
                      .map((x) => (
                        <Link
                          className="services-right-detail"
                          key={x.serviceId}
                          to={`/user/services/service/${x.serviceId}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div className="services-right-image">
                            <img src={x.image} alt="" />
                          </div>
                          <div
                            className="services-right-text"
                            style={{ textDecoration: "none" }}
                          >
                            <h3>Dịch vụ {x.serviceName.toLowerCase()}</h3>
                            <div
                              className="services-right-text-p truncate-html-wrapper"
                              style={{
                                textDecoration: "none",
                                textTransform: "none",
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: "400",
                                lineHeight: "1.6",
                              }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  x.description.length > 100
                                    ? x.description.substring(0, 100) + "..."
                                    : x.description,
                              }}
                            ></div>
                          </div>
                        </Link>
                      ))}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {serviceList.map((s) => {
                return (
                  <div className="services-content" key={s.serviceId}>
                    <div className="branches-content">
                      <h5>
                        Dịch vụ {s.serviceName.toLowerCase()} của chúng tôi{" "}
                      </h5>
                      <h6>Ngày cập nhật: 23-02-2023</h6>
                    </div>
                    {/* <div className="services-detail-img">
                  <img src={s.image} />
                </div> */}
                    <div
                      className="service-detail-content"
                      dangerouslySetInnerHTML={{ __html: s.description }}
                    />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ServicesContent;
