import React, { useEffect, useState } from "react";
import "../../../assets/css/user/services.css";
import { fetchServiceTypes } from "../../../admin/manage_service_type";
import { useNavigate } from "react-router-dom";
import { fetchServices } from "../../../admin/manage_service";

const MiniService = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [serviceList, setServiceList] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServiceList(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});

    fetchServiceTypes()
      .then((data) => {
        setServiceTypes(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});
  }, []);

  const services = [
    { name: "Các Loại Dịch Vụ", id: 1 },
    { name: "Các Dịch Vụ", id: 2 },
  ];

  // Handle click for service
  const handleServiceClick = (serviceId) => {
    if (selectedService === serviceId) {
      setSelectedService(null);
    } else {
      setSelectedService(serviceId);
    }
  };

  const handleServiceTypeContentClick = (serviceTypeId) => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });
    navigate(`/user/services/service-type/${serviceTypeId}`);
  };

  const handleServiceContentClick = (serviceId) => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });
    navigate(`/user/services/service/${serviceId}`);
  };

  return (
    <div>
      <div className="services-list">
        <h4>Dịch Vụ</h4>
        {services.map((service) => (
          <div key={service.id}>
            <div
              className={`services-name ${
                selectedService === service.id ? "selected" : ""
              }`}
              onClick={() => handleServiceClick(service.id)}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6697 12.5788L8.48825 20.7602C8.41224 20.8363 8.322 20.8965 8.22268 20.9377C8.12336 20.9788 8.01692 21 7.90942 21C7.80192 21 7.69547 20.9788 7.59615 20.9377C7.49684 20.8965 7.40659 20.8363 7.33058 20.7602C7.25457 20.6842 7.19427 20.594 7.15313 20.4947C7.11199 20.3953 7.09082 20.2889 7.09082 20.1814C7.09082 20.0739 7.11199 19.9675 7.15313 19.8681C7.19427 19.7688 7.25457 19.6786 7.33058 19.6026L14.9342 12L7.33058 4.39743C7.17706 4.24391 7.09082 4.0357 7.09082 3.8186C7.09082 3.60149 7.17706 3.39328 7.33058 3.23976C7.4841 3.08624 7.69231 3 7.90942 3C8.12652 3 8.33473 3.08624 8.48825 3.23976L16.6697 11.4212C16.7457 11.4971 16.8061 11.5874 16.8472 11.6867C16.8884 11.786 16.9096 11.8925 16.9096 12C16.9096 12.1075 16.8884 12.214 16.8472 12.3133C16.8061 12.4126 16.7457 12.5029 16.6697 12.5788Z"
                  fill="rgb(243, 103, 61)"
                />
              </svg>
              <p>{service.name}</p>
            </div>

            {selectedService === service.id && (
              <div className="sub-services">
                {service.id === 1 &&
                  serviceTypes.map((subService) => (
                    <p
                      onClick={() =>
                        handleServiceTypeContentClick(subService.serviceTypeId)
                      }
                      key={subService.serviceTypeId}
                      className={`subServices-name ${
                        subService === subService.serviceTypeId
                          ? "selected"
                          : ""
                      }`}
                    >
                      {subService.serviceTypeName}
                    </p>
                  ))}
                {service.id === 2 &&
                  serviceList
                    .filter((x) => x.serviceTypeId == 1)
                    .map((subService) => (
                      <p
                        onClick={() =>
                          handleServiceContentClick(subService.serviceId)
                        }
                        key={subService.serviceId}
                        className={`subServices-name ${
                          subService === subService.serviceId ? "selected" : ""
                        }`}
                      >
                        {subService.serviceName}
                      </p>
                    ))}
                {service.id === 3 &&
                  subServices3.map((subService) => (
                    <p
                      key={subService.id}
                      className={`subServices-name ${
                        subService === subService.id ? "selected" : ""
                      }`}
                    >
                      {subService.name}
                    </p>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniService;
