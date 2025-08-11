// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import productService from "../Components/productService";
import QRCode from "react-qr-code";
import generatePayload from "promptpay-qr";
import { useNavigate } from "react-router-dom";
import "../Styles/Checkout.css"; // ตรวจสอบให้แน่ใจว่ามี CSS สำหรับ .error-inline

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true); // แก้ไขตรงนี้
  const [generalError, setGeneralError] = useState(null); // เปลี่ยนชื่อจาก 'error' เป็น 'generalError'

  const [orderCreated, setOrderCreated] = useState(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  const merchantPromptPayId = "0613062691"; // เบอร์โทรศัพท์ PromptPay ของร้านค้า (ตัวอย่าง)

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PromptPay QR"); // Default to PromptPay QR
  const [notes, setNotes] = useState("");

  // States สำหรับข้อความ Error ของแต่ละฟิลด์
  const [addressError, setAddressError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [paymentMethodError, setPaymentMethodError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart) {
      console.log("Cart loaded:", cart);
    }
  }, [cart]);

  const fetchCart = async () => {
    setLoading(true);
    setGeneralError(null);
    try {
      const data = await productService.getCart();
      setCart(data.cart);
      if (data.cart && data.cart.items.length === 0) {
        setGeneralError("Your cart is empty. Please add items before checking out.");
      }
    } catch (err) {
      console.error("Error fetching cart for checkout:", err);
      setGeneralError("Failed to load cart details. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    // เคลียร์ error เก่าทั้งหมดก่อนตรวจสอบใหม่
    setGeneralError(null);
    setAddressError(null);
    setPhoneError(null);
    setPaymentMethodError(null);

    let hasError = false; // ตัวแปร flag เพื่อตรวจสอบว่ามี error หรือไม่

    if (!cart || cart.items.length === 0) {
      setGeneralError("Your cart is empty. Cannot create an order.");
      hasError = true;
    }

    if (!deliveryAddress.trim()) {
      setAddressError("กรุณาใส่หมายเลขโต๊ะ.");
      hasError = true;
    }

    if (!contactPhone.trim()) {
      setPhoneError("กรุณาใส่เบอร์โทรศัพท์ติดต่อ.");
      hasError = true;
    } else if (contactPhone.length !== 10) {
      setPhoneError("เบอร์โทรศัพท์ต้องมี 10 หลัก.");
      hasError = true;
    }

    if (!paymentMethod) {
      setPaymentMethodError("กรุณาเลือกวิธีการชำระเงิน.");
      hasError = true;
    }

    // หากมี error ใดๆ เกิดขึ้น ให้หยุดการทำงานของฟังก์ชัน
    if (hasError) {
      return;
    }

    try {
      const orderDetails = {
        delivery_address: deliveryAddress,
        contact_phone: contactPhone,
        payment_method: paymentMethod,
        notes: notes,
        items: cart.items.map((item) => ({
          flavorId: item.flavor_id,
          sizeId: item.size_id,
          quantity: item.quantity,
          selectedToppings: item.toppings
            ? item.toppings.map((topping) => ({
                toppingId: topping.topping_id,
                quantity: topping.topping_quantity,
              }))
            : [],
        })),
      };

      console.log("Sending order details to backend:", orderDetails);

      const responseData = await productService.createOrder(orderDetails);

      console.log("Order creation response from backend:", responseData);

      const createdOrderData = {
        id: responseData.orderId,
        total_amount: responseData.totalAmount,
        payment_method: responseData.paymentMethod,
        notes: responseData.notes,
        order_date: responseData.orderDate,
        delivery_address: deliveryAddress,
        contact_phone: contactPhone,
      };

      let qrCodePayload = "";
      if (responseData.paymentMethod === "PromptPay QR") {
        const amount = responseData.totalAmount;
        if (amount && typeof amount === "number") {
          qrCodePayload = generatePayload(merchantPromptPayId, {
            amount: parseFloat(amount),
            reference1: responseData.orderId.toString(),
            format: "SVG",
          });
          setOrderCreated(createdOrderData);
          setShowQrCode(true);
          setQrCodeData(qrCodePayload);
        } else {
          console.warn(
            "Total amount is missing or invalid from order response, cannot generate QR code."
          );
          setGeneralError("Failed to generate QR Code. Please try again.");
          return;
        }
      }

      console.log(
        "Navigating to confirmation with paymentMethod (from response):",
        responseData.paymentMethod
      );
      console.log("Navigating to confirmation with qrCodeData:", qrCodePayload);

      setCart(null);

      navigate("/order-confirmation", {
        state: {
          order: createdOrderData,
          paymentMethod: responseData.paymentMethod,
          qrCodeData: qrCodePayload,
        },
      });
    } catch (err) {
      console.error("Error creating order:", err);
      setGeneralError(
        `Failed to create order: ${
          err.response?.data?.message || err.message || "Server error"
        }`
      );
    }
  };

  const handleDownloadQrCode = () => {
    const svgElement = document.getElementById("promptpay-qr-code-canvas");
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URL = window.URL || window.webkitURL || window;
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `promptpay-bingsoo-order-${orderCreated?.id || 'new'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      alert("QR Code downloaded to your device!");
      URL.revokeObjectURL(svgUrl);
    } else {
      alert("QR Code not found for download.");
    }
  };

  if (loading) {
    return <div className="checkout-container">Loading cart for checkout...</div>;
  }

  if (generalError && !orderCreated) {
    return (
      <div className="checkout-container">
        <p className="error-text">Error: {generalError}</p>
        <button
          onClick={() => navigate("/checkout")}
          className="back-to-cart-button"
        >
          กลับหน้าชำระเงิน
        </button>
      </div>
    );
  }

  if (orderCreated && showQrCode && paymentMethod === "PromptPay QR") {
    return (
      <div className="checkout-container">
        <h2 className="checkout-title">Order Placed Successfully!</h2>
        <p className="success-message">
          Your Order ID: **{orderCreated.id}**
        </p>
        <p className="success-message">
          ราคารวม **฿
          {orderCreated.total_amount
            ? orderCreated.total_amount.toFixed(2)
            : "0.00"}
          **
        </p>
        <p className="qr-instructions">
          Please scan the QR Code below with your mobile banking app to complete
          the payment.
        </p>

        <div className="qr-code-container">
          {qrCodeData && (
            <QRCode
              id="promptpay-qr-code-canvas"
              value={qrCodeData}
              size={290}
            />
          )}
        </div>
        <button onClick={handleDownloadQrCode} className="download-button">
          Download QR Code
        </button>
        <p className="payment-info">
          After payment, your order status will be updated. You can check your
          order history later.
        </p>
        <button onClick={() => navigate("/")} className="back-to-home-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {generalError && <p className="error-text">{generalError}</p>}

      <div className="cart-summary-section">
        <h3>สรุปคำสั่งซื้อ</h3>
        {cart &&
          cart.items.map((item) => (
            <div key={item.cart_item_id} className="summary-item">
              <span>
                {item.flavor_name} ({item.size_name}) x {item.quantity}
              </span>
              <span>
                ฿
                {item.total_item_price
                  ? item.total_item_price.toFixed(2)
                  : "0.00"}
              </span>
            </div>
          ))}
        <div className="subtotal-line">
          <strong>ราคา</strong>
          <strong>฿{cart?.subtotal ? cart.subtotal.toFixed(2) : "0.00"}</strong>
        </div>
      </div>

      <div className="form-section">
        <label className="form-label">ที่นั่ง {addressError && <span className="error-inline">{addressError}</span>}</label>
        <input
          type="text"
          value={deliveryAddress}
          onChange={(e) => {
            setDeliveryAddress(e.target.value);
            if (addressError) setAddressError(null); // เคลียร์ error เมื่อผู้ใช้เริ่มพิมพ์
          }}
          placeholder="ใส่หมายเลขโต๊ะ"
          rows="3"
          className={`form-textarea ${addressError ? 'input-error' : ''}`} 
          required
        ></input>

        <label className="form-label">เบอร์โทรศัพท์ {phoneError && <span className="error-inline">{phoneError}</span>}</label>
        <input
          type="text"
          value={contactPhone}
          onChange={(e) => {
            const re = /^[0-9\b]+$/;
            if (e.target.value === '' || (re.test(e.target.value) && e.target.value.length <= 10)) {
                setContactPhone(e.target.value);
                if (phoneError) setPhoneError(null); // เคลียร์ error เมื่อผู้ใช้เริ่มพิมพ์
            }
          }}
          placeholder="ใส่เบอร์โทรศัพท์ติดต่อ"
          className={`form-input ${phoneError ? 'input-error' : ''}`} 
          maxLength="10"
          required
        />

        <label className="form-label">ชำระเงินโดย {paymentMethodError && <span className="error-inline">{paymentMethodError}</span>}</label>
        <div className="payment-method-options">
          <button
            type="button"
            className={`payment-method-button ${
              paymentMethod === "PromptPay QR" ? "active" : ""
            }`}
            onClick={() => {
              setPaymentMethod("PromptPay QR");
              if (paymentMethodError) setPaymentMethodError(null); // เคลียร์ error เมื่อเลือก
            }}
          >
            QR พร้อมเพย์
          </button>
          <button
            type="button"
            className={`payment-method-button ${
              paymentMethod === "Cash" ? "active" : ""
            }`}
            onClick={() => {
              setPaymentMethod("Cash");
              if (paymentMethodError) setPaymentMethodError(null); // เคลียร์ error เมื่อเลือก
            }}
          >
            เงินสด
          </button>
        </div>

        <label className="form-label">รายละเอียดเพิ่มเติม</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder=""
          rows="2"
          className="form-textarea"
        ></textarea>
      </div>

      <button onClick={handleCreateOrder} className="checkout-button">
        ยืนยันคำสั่งซื้อ
      </button>
    </div>
  );
};

export default CheckoutPage;