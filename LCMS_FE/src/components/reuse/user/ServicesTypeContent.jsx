import React, { useEffect, useState } from "react";
import {
  fetchServiceById,
  fetchServiceTypeById,
} from "../../../admin/manage_service";
import { useParams } from "react-router-dom";

const ServicesContent = () => {
  const [serviceList, setServiceList] = useState([]);
  const [err, setErr] = useState(false);
  const { serviceId } = useParams();

  useEffect(() => {
    if (!serviceId) {
      setErr(true);
      return;
    }

    fetchServiceTypeById(serviceId)
      .then((data) => {
        if (data) {
          setServiceList(Array.isArray(data) ? data : [data]);
          setErr(false);
        } else {
          setErr(true);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải dịch vụ:", err);
        setErr(true);
      });
  }, [serviceId]);

  return (
    <div className="services-right">
      {err ? (
        <>
          <div className="services-content">
            <div className="branches-content">
              <h5>Danh sách các dịch vụ:</h5>
              <h6>Nhấn vào để xem chi tiết</h6>
              <h3>
                Dịch vụ Giặt Là Nhanh - Chất lượng vượt trội, phục vụ nhanh
                chóng! Với đội ngũ nhân viên chuyên nghiệp và công nghệ giặt là
                hiện đại, chúng tôi cam kết mang đến cho bạn những bộ đồ sạch
                sẽ, thơm tho như mới. Đặc biệt, dịch vụ của chúng tôi luôn bảo
                vệ vải vóc, giữ màu sắc lâu bền. Hãy đặt dịch vụ giặt là ngay
                hôm nay để nhận ưu đãi đặc biệt!
              </h3>
              <div className="branches-title">
                <h3>Loại Dịch Vụ</h3>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {serviceList.map((s) => {
            return (
              <div className="services-content" key={s.serviceId}>
                <div className="branches-content">
                  <h5>
                    Dịch vụ {s.serviceTypeName.toLowerCase()} của chúng tôi{" "}
                  </h5>
                  <h6>Ngày cập nhật: 23-02-2023</h6>
                </div>
                <div className="services-detail-img">
                  <img src={s.image} />
                </div>
                <div
                  className="service-detail-content"
                  dangerouslySetInnerHTML={{ __html: s.description }}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default ServicesContent;
