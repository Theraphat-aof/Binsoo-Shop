// src/pages/OrderConfirmationPage.jsx

import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import "../Styles/OrderConfirmation.css";

const OrderConfirmationPage = () => {
  const location = useLocation(); // ใช้สำหรับเข้าถึง state ที่ส่งมาจาก navigate
  const navigate = useNavigate();

  // ดึงข้อมูล order, paymentMethod, qrCodeData จาก state ของ navigate
  const { order, paymentMethod, qrCodeData } = location.state || {};

  // หากไม่มีข้อมูล order (เช่น เข้าหน้านี้โดยตรง ไม่ได้มาจาก Checkout) ให้ redirect กลับ
  useEffect(() => {
    if (!order) {
      navigate("/"); // หรือไปยังหน้า Cart/Home
    }
  }, [order, navigate]);

  const handleDownloadQrCode = () => {
    const svgElement = document.getElementById("promptpay-qr-code-canvas");
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URL = window.URL || window.webkitURL || window;
      const svgUrl = URL.createObjectURL(svgBlob);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        downloadLink.download = `promptpay-bingsoo-order-${order.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        alert("QR Code downloaded to your device!");
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } else {
      alert("QR Code not found for download.");
    }
  };

  if (!order) {
    return <div className="confirmation-container">Redirecting...</div>;
  }

  return (
    <div className="confirmation-container">
      {/* <div className="order-summary-box">
        <h3>สรุปคำสั่งซื้อ</h3>
        <p>
          <strong>ราคารวม</strong> ฿{" "}
          {order.total_amount ? order.total_amount.toFixed(2) : "0.00"}
        </p>
        <p>
          <strong>ชำระเงินโดย</strong> {order.payment_method}
        </p>
        <p>
          <strong>ที่นั่ง</strong> {order.delivery_address}
        </p>
        <p>
          <strong>เบอร์โทรศัพท์</strong> {order.contact_phone || "N/A"}
        </p>
        {order.notes && (
          <p>
            <strong>รายละเอียดเพิ่มเติม</strong> {order.notes}
          </p>
        )}
      </div> */}

      {paymentMethod === "PromptPay QR" && qrCodeData ? (
        <div className="payment-qr-section">
          <p className="payment-instructions">
            โปรดสแกนคิวอาร์โค้ดด้านล่างด้วยแอปธนาคารของคุณเพื่อดำเนินการชำระเงินจำนวน
            ฿{order.total_amount.toFixed(2)}
          </p>
          <div className="qr-code-display">
            <QRCode
              id="promptpay-qr-code-canvas"
              value={qrCodeData}
              size={256}
              level="H" // ระดับการแก้ไขข้อผิดพลาด
            />
          </div>
          <button onClick={handleDownloadQrCode} className="download-qr-button">
            ดาวน์โหลดคิวอาร์โค้ด
          </button>
          <p className="status-note">
            สถานะการสั่งซื้อของคุณในขณะนี้ <br /> "รอดำเนินการ" จะถูกปรับเป็น
            "ชำระเงินแล้ว" เมื่อตรวจสอบการชำระเงินของคุณโดยเจ้าหน้าที่ของเรา
            ขอบคุณที่ใช้บริการ
          </p>
        </div>
      ) : (
        <div className="payment-cash-section">
          <p className="payment-instructions">
            คำสั่งซื้อของคุณได้รับเรียบร้อยแล้ว
            <br />
            และกำลังรอการชำระเงินสด
          </p>
          <p className="cash-instructions">
            กรุณาชำระเงินสดที่เคาน์เตอร์ ฿{order.total_amount.toFixed(2)}
          </p>
        </div>
      )}

      <div className="next-steps-section">
        {/* <p>
          You can track your order status in your <Link to="/my-orders">My Orders</Link> section.
        </p> */}
        <button
          onClick={() => navigate("/order-bingsoo")}
          className="back-to-home-button"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
