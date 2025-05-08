import { Eye, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { deletePaymentByBooking } from "../../../services/payment";

const CashInvoice = ({
  paymentType,
  subCus,
  subDiscount,
  booking,
  staffInfo,
  shippingFee,
  points,
  membershipDiscount,
  finalAmount,
  phoneNum,
  services,
  qrCode,
  open,
}) => {
  const [showModal, setShowModal] = useState(open);
  const [countdown, setCountdown] = useState(120);
  const timerRef = useRef(null);

  useEffect(() => {
    if (showModal) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);

            if (qrCode === "") {
              setShowModal(false);
            } else {
              deletePaymentByBooking(booking?.bookingId).then(() => {
                setShowModal(false);
                window.location.reload();
              });
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [showModal]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const onCloseModal = async () => {
    if (qrCode === "") {
      setShowModal(false);
    } else {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Bạn có chắc chắn muốn hủy giao dịch không ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Có, hủy giao dịch!",
        cancelButtonText: "Hủy",
        position: "top",
        customClass: {
          popup: "small-swal-popup",
        },
      });

      if (!result.isConfirmed) return;

      await deletePaymentByBooking(booking?.bookingId);
      setShowModal(false);
      window.location.reload();
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const invoiceContent = `
    <html>
      <head>
        <title>Hóa đơn thanh toán - #${booking?.bookingId}</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 12px;
            overflow: hidden;
            height: 100%;
          }

          .invoiceQR {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            height: 100%;
          }

          .invoice-scroll-container {
            width: 300px;
            padding: 5px;
            padding-left: 15px
            padding-right: 15px;
            height: 100%;
            max-height: 450px;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: none; /* For Firefox */
            -ms-overflow-style: none; /* For Internet Explorer and Edge */
          }
          
          .invoice-scroll-container::-webkit-scrollbar {
            width: 0; /* For Chrome, Safari, and Opera */
            display: none;
          }

          .invoice-container {
            width: 100%;
          }

          .payment-scroll-container {
            flex: 1;
            min-width: 400px;
            height: 100%;
            max-height: 450px;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: none; 
            -ms-overflow-style: none; 
            border-left: 1px dashed #ddd;
            margin-left: 20px;
            padding-left: 20px;
          }
          
          .payment-scroll-container::-webkit-scrollbar {
            width: 0; 
            display: none;
          }

          .payment-frame {
            width: 100%;
            height: 600px;
            border: none;
          }

          .invoice-header { 
            text-align: center; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #000; 
            padding-bottom: 5px; 
          }

          .company-name { 
            font-size: 14px; 
            font-weight: bold 
          }

          .invoice-title { 
            font-size: 14px; 
            font-weight: bold; 
            margin: 10px 0; 
            text-align: center; 
          }

          .info-row { 
            margin-bottom: 4px; 
            display: flex; 
            justify-content: space-between; 
          }

          .subscription-info {
                margin-top: 6px;
                border: 1px dashed #ddd;
                padding: 4px;
                font-size: 9px;
              }
              
              .subscription-title {
                font-weight: bold;
                text-align: center;
                margin-bottom: 3px;
              }
              
              .subscription-details {
                display: grid;
                gap: 2px;
              }
              
              .subscription-item {
                display: flex;
              }
              
              .subscription-label {
                font-weight: bold;
              }

          .info-label { 
            font-weight: bold; 
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
            font-size: 11px; 
          }

          th, td { 
            border-bottom: 1px dashed #ddd; 
            padding: 5px 2px; 
            text-align: left; 
          }

          th { 
            background-color: #f2f2f2; 
          }

          .total-section { 
            margin-top: 10px; 
            text-align: right; 
          }

          .total-row { 
            font-weight: bold; 
            margin-top: 5px; 
            font-size: 14px; 
          }

          .payment-method { 
            margin-top: 10px; 
            padding: 5px; 
            border-top: 1px dashed #ddd; 
            border-bottom: 1px dashed #ddd; 
            text-align: center; 
            font-weight: bold; 
          }

          .bank-info { 
            margin-top: 10px; 
            border: 1px dashed #ddd; 
            padding: 5px; 
            font-size: 11px; 
            text-align: center; 
          }

          .bank-title { 
            font-weight: bold; 
            margin-bottom: 3px; 
          }

          .qr-code { 
            text-align: center; 
            margin: 10px auto; 
          }

          .qr-desc { 
            font-size: 10px; 
            margin-top: 5px; 
            text-align: center; 
            font-weight: bold; 
          }

          .invoice-footer { 
            margin-top: 10px; 
            text-align: center; 
            font-style: italic; 
            font-size: 10px; 
          }

          .invoice-footer p { 
            margin: 0;
            padding: 0;
          }

          /* Remove custom scrollbar styles that show scrollbars */
          .invoice-scroll-container::-webkit-scrollbar-track,
          .payment-scroll-container::-webkit-scrollbar-track,
          .invoice-scroll-container::-webkit-scrollbar-thumb,
          .payment-scroll-container::-webkit-scrollbar-thumb {
            display: none;
          }

          /* Responsive styles */
          @media screen and (max-width: 768px) {
            .invoiceQR {
              flex-direction: column;
              height: auto;
            }
            
            .invoice-scroll-container {
              width: 100%;
              max-width: 300px;
              margin: 0 auto 20px;
              border-right: none;
              border-bottom: 1px dashed #ddd;
              padding-bottom: 20px;
              max-height: 300px;
            }
            
            .payment-scroll-container {
              width: 100%;
              margin: 0 auto;
              max-height: 300px;
              
            }
          }

          @media print { 
            body { 
              width: 105mm; 
              height: 148mm; 
              margin: 0; 
              padding: 0; 
              overflow: visible;
            }
            
            .invoiceQR {
              flex-direction: column;
              gap: 6%;
              height: auto;
            }
            
            .invoice-scroll-container { 
              width: 120mm; 
              height: auto; 
              margin: auto; 
              padding: 5mm; 
              overflow: visible;
              border-right: none;
              max-height: none;
            }
            
            .payment-scroll-container {
              display: none;
            }
            
            button { 
              display: none; 
            } 
          }
        </style>
      </head>
      <body>
        <div class="invoiceQR">
          <div class="invoice-scroll-container">
            <div class="invoice-container">
              <div class="invoice-header">
                <div class="company-name">Cơ sở: ${staffInfo?.branchName}</div>
                <div>${staffInfo?.address}</div>
                <div>ĐT: ${staffInfo?.phoneNumber}</div>
              </div>
              
              <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
              
              <div class="info-row"><span class="info-label">Số hóa đơn:</span><span>#${
                booking?.bookingId || "N/A"
              }</span></div>
              <div class="info-row"><span class="info-label">Ngày tạo:</span><span>${new Date().toLocaleDateString(
                "vi-VN"
              )}</span></div>
              <div class="info-row"><span class="info-label">Khách hàng:</span><span>${
                booking?.customerName || booking?.guestName || "N/A"
              }</span></div>
              <div class="info-row"><span class="info-label">Số điện thoại:</span><span>${
                phoneNum || booking?.phoneNumber || "N/A"
              }</span></div>
              <div class="info-row"><span class="info-label">Nhân viên thanh toán:</span><span>${
                booking?.staffName || "N/A"
              }</span></div>
              
              <table>
                <thead>
                  <tr><th>Dịch vụ/Sản phẩm</th><th>SL/KG</th><th>Giá</th><th>T.Tiền</th></tr>
                </thead>
                <tbody>
                  ${booking.details
                    ?.map(
                      (item) => `
                    <tr key=${item?.bookingDetailId}>
                      <td>${item?.serviceName}${
                        item?.productName ? ` - ${item.productName}` : ""
                      }</td>
                      <td>
                        ${
                          item?.weight
                            ? `${item.weight} kg`
                            : item?.quantity
                            ? `${item.quantity} cái`
                            : "N/A"
                        }
                      </td>
                      <td>
                        ${
                          !item?.productId
                            ? item?.weight
                              ? (item.price / item.weight).toLocaleString(
                                  "vi-VN"
                                )
                              : "0"
                            : (
                                item.price -
                                  item.productPrice * item.quantity || 0
                              ).toLocaleString("vi-VN")
                        }
                      </td>
                      <td>${
                        item ? `${item?.price.toLocaleString("vi-VN")}` : "N/A"
                      }</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>

              ${
                subCus
                  ? `
                <div class="subscription-info">
                  <div class="subscription-title">THÔNG TIN GÓI THÁNG</div>
                  <div class="subscription-details">
                    <div class="subscription-item">
                      <span class="subscription-label" style="padding-right: 4px">Gói:</span>
                      <span>${subCus.packageName || "N/A"}</span>
                    </div>
                    <div class="subscription-item">
                      <span class="subscription-label" style="padding-right: 4px" >Cân còn lại trong gói:</span>
                      <span>${subCus.remainingWeight || "N/A"} kg</span>
                    </div>
                  </div>
                  <div class="subscription-item">
                      <span class="subscription-label" style="text-align: center">Hạn sử dụng:</span>
                      <span>${
                        subCus.startDate && subCus.endDate
                          ? `${formatDate(subCus.startDate)} - ${formatDate(
                              subCus.endDate
                            )}`
                          : "N/A"
                      }</span>
                    </div>
                </div>
              `
                  : ""
              }

              <div class="total-section">
               ${`<div class="info-row"><span class="info-label">Tổng giá tiền : </span><span>${booking?.totalAmount.toLocaleString(
                 "vi-VN"
               )} VNĐ</span></div>`}
                ${
                  shippingFee > 0
                    ? `<div class="info-row"><span class="info-label">Phí giao hàng: </span><span>- ${shippingFee.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                    : ""
                }
                ${
                  membershipDiscount
                    ? `<div class="info-row"><span class="info-label">Giảm giá thành viên: </span><span>- ${membershipDiscount.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                    : ""
                }
                ${
                  points
                    ? `<div class="info-row"><span class="info-label">Đã dùng điểm tích lũy:</span><span>- ${points.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                    : ""
                }
                ${
                  subDiscount
                    ? `<div class="info-row"><span class="info-label">Đã dùng gói tháng:</span><span>- ${subDiscount.toLocaleString(
                        "vi-VN"
                      )} VNĐ</span></div>`
                    : ""
                }
                <div class="total-row">
                  <span class="info-label">Thành tiền:</span>
                  <span>${
                    finalAmount
                      ? `${finalAmount.toLocaleString("vi-VN")} VNĐ`
                      : "N/A"
                  }</span>
                </div>
              </div>
              
              <div class="invoice-footer">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                <p>Vui lòng giữ hóa đơn để được hỗ trợ.</p>
              </div>
            </div>
          </div>

          ${
            paymentType === "QRCode" && qrCode !== ""
              ? `
            <div class="payment-scroll-container">
              <iframe class="payment-frame" src="${qrCode}" width="100%" height="600px"></iframe>
            </div>
          `
              : ""
          }

        </div>
        </body>
    </html>
  `;

  return (
    <div className="payment-button">
      <button
        className="pay-now-qr"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <Eye className="payment-icon" /> Xem hóa đơn
      </button>

      {showModal && (
        <div
          className="pay-modal-overlay"
          onClick={() => {
            onCloseModal();
          }}
        >
          <div
            className="pay-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="countdown-timer"
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                fontWeight: "bold",
                color: "red",
                fontSize: "14px",
              }}
            >
              🕒 {formatTime(countdown)} nữa mã sẽ hết hạn.
            </div>
            <div
              className="pay-modal-body"
              dangerouslySetInnerHTML={{ __html: invoiceContent }}
              style={{
                maxHeight: "550px",
                overflowY: "hidden",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashInvoice;
