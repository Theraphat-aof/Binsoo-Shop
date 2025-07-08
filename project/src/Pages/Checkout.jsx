// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import productService from "../Components/productService";
import QRCode from "react-qr-code";
import generatePayload from "promptpay-qr";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate(); // ใช้สำหรับ redirect
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null); // สำหรับเก็บข้อมูล Order ที่สร้างขึ้น
  const [showQrCode, setShowQrCode] = useState(false); // สถานะสำหรับแสดง QR Code
  const [qrCodeData, setQrCodeData] = useState(""); // ข้อมูลที่จะเข้ารหัสใน QR Code

  const merchantPromptPayId = "0613062691"; // เบอร์โทรศัพท์ PromptPay ของร้านค้า (ตัวอย่าง)

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PromptPay QR"); // เลือก PromptPay เป็น default
  const [notes, setNotes] = useState("");

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
    setError(null);
    try {
      const data = await productService.getCart();
      setCart(data.cart);
      if (data.cart && data.cart.items.length === 0) {
        setError("Your cart is empty. Please add items before checking out.");
      }
    } catch (err) {
      console.error("Error fetching cart for checkout:", err);
      setError("Failed to load cart details. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setError(null);

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty. Cannot create an order.");
      return;
    }

    if (!deliveryAddress || !paymentMethod) {
      setError("Please fill in all required delivery and payment details.");
      return;
    }

    try {
      const orderDetails = {
        delivery_address: deliveryAddress,
        contact_phone: contactPhone,
        payment_method: paymentMethod,
        notes: notes,
        items: cart.items.map((item) => ({
          flavorId: item.flavor_id, // เปลี่ยนจาก item.product_id/item.flavor_id เป็น flavorId (ไม่มี underscore)
          sizeId: item.size_id, // เปลี่ยนจาก item.size_id เป็น sizeId (ไม่มี underscore)
          quantity: item.quantity,
          selectedToppings: item.topping_ids
            ? item.topping_ids.map((topping) => ({
                toppingId: topping.id, // สมมติว่าใน cart.items.topping_ids เป็น array of objects ที่มี { id: ..., quantity: ... }
                quantity: topping.quantity, // หรือถ้าเป็นแค่ array of IDs ให้คุณปรับ logic การสร้าง topping object ที่ Frontend
              }))
            : [],
        })),
      };

      console.log("Sending order details to backend:", orderDetails); // เพิ่ม log เพื่อตรวจสอบข้อมูลก่อนส่ง

      const responseData = await productService.createOrder(orderDetails);

      console.log("Order creation response:", responseData);

      setOrderCreated({
        id: responseData.orderId, // ใช้ orderId จาก response
        total_amount: responseData.totalAmount, // ใช้ totalAmount จาก response
        payment_method: responseData.paymentMethod,
        notes: responseData.notes,
        order_date: responseData.orderDate,
      });

      const amount = responseData.totalAmount;
      if (amount && typeof amount === "number") {
        const payload = generatePayload(merchantPromptPayId, {
          amount: parseFloat(amount),
          reference1: responseData.orderId.toString(), 
          format: "SVG",
        });
        setQrCodeData(payload);
        setShowQrCode(true); // แสดง QR Code
      } else {
        console.warn(
          "Total amount is missing or invalid from order response, cannot generate QR code."
        );
      }

      setCart(null); // ล้างตะกร้าหลังจากสร้าง Order สำเร็จ
    } catch (err) {
      console.error("Error creating order:", err);

      setError(
        `Failed to create order: ${
          err.response?.data?.message || err.message || "Server error"
        }`
      );
    }
  };

  const handleDownloadQrCode = () => {
    const svgElement = document.getElementById("promptpay-qr-code-canvas"); // เปลี่ยนไปหา SVG element
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const URL = window.URL || window.webkitURL || window;
      const svgUrl = URL.createObjectURL(svgBlob);

      // สร้าง canvas เพื่อแปลง SVG เป็น PNG (ถ้าต้องการ PNG)
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
        downloadLink.download = `promptpay-bingsoo-order-${orderCreated.id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        alert("QR Code downloaded to your device!");
        URL.revokeObjectURL(svgUrl); // ลบ URL ชั่วคราว
      };
      img.src = svgUrl;
    } else {
      alert("QR Code not found for download.");
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading cart for checkout...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>Error: {error}</p>
        <button
          onClick={() => navigate("/cart")}
          style={styles.backToCartButton}
        >
          Back to Cart
        </button>
      </div>
    );
  }

  if (orderCreated && showQrCode) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Order Placed Successfully!</h2>
        <p style={styles.successMessage}>
          Your Order ID: **{orderCreated.id}**
        </p>
        <p style={styles.successMessage}>
          Total Amount: **฿
          {orderCreated.total_amount
            ? orderCreated.total_amount.toFixed(2)
            : "0.00"}
          **
        </p>
        <p style={styles.qrInstructions}>
          Please scan the QR Code below with your mobile banking app to complete
          the payment.
        </p>

        <div style={styles.qrCodeContainer}>
          {qrCodeData && (
            <QRCode
              id="promptpay-qr-code-canvas" // ใช้ ID นี้สำหรับดาวน์โหลด
              value={qrCodeData}
              size={290}
            />
          )}
        </div>
        <button onClick={handleDownloadQrCode} style={styles.downloadButton}>
          Download QR Code
        </button>
        <p style={styles.paymentInfo}>
          After payment, your order status will be updated. You can check your
          order history later.
        </p>
        <button onClick={() => navigate("/")} style={styles.backToHomeButton}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Checkout</h2>
      <div style={styles.cartSummarySection}>
        <h3>Order Summary</h3>
        {cart &&
          cart.items.map((item) => (
            <div key={item.cart_item_id} style={styles.summaryItem}>
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
        <div style={styles.subtotalLine}>
          <strong>Total:</strong>
          <strong>฿{cart?.subtotal ? cart.subtotal.toFixed(2) : "0.00"}</strong>
        </div>
      </div>

      <div style={styles.formSection}>
        <h3>Delivery & Payment Details</h3>
        <label style={styles.label}>Delivery Address:</label>
        <textarea
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="เพิ่มที่นั่งโต๊ะ"
          rows="3"
          style={styles.textarea}
          required
        ></textarea>

        <label style={styles.label}>Contact Phone:</label>
        <input
          type="text"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          placeholder="e.g., 0812345678"
          style={styles.input}
          required
        />

        <label style={styles.label}>Payment Method:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={styles.select}
          required
        >
          <option value="PromptPay QR">PromptPay QR</option>
          {/* <option value="Cash on Delivery">Cash on Delivery</option> */}
        </select>

        <label style={styles.label}>Notes (Optional):</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., No peanuts, deliver after 5 PM"
          rows="2"
          style={styles.textarea}
        ></textarea>
      </div>

      <button onClick={handleCreateOrder} style={styles.checkoutButton}>
        Confirm Order & Get QR Code
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "700px",
    margin: "20px auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "30px",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: "15px",
  },
  successMessage: {
    color: "green",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  cartSummarySection: {
    marginBottom: "30px",
    border: "1px solid #eee",
    padding: "15px",
    borderRadius: "5px",
    backgroundColor: "#fff",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
    borderBottom: "1px dotted #eee",
  },
  subtotalLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    fontSize: "1.2em",
    borderTop: "1px solid #ddd",
    marginTop: "10px",
  },
  formSection: {
    marginBottom: "30px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#555",
  },
  input: {
    width: "calc(100% - 22px)",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  textarea: {
    width: "calc(100% - 22px)",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
  },
  checkoutButton: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.2em",
    cursor: "pointer",
    marginTop: "20px",
  },
  qrCodeContainer: {
    textAlign: "center",
    margin: "30px 0",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "center",
  },
  downloadButton: {
    display: "block",
    width: "fit-content",
    margin: "20px auto",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1em",
    cursor: "pointer",
  },
  qrInstructions: {
    textAlign: "center",
    fontSize: "1.1em",
    color: "#555",
    marginBottom: "20px",
  },
  paymentInfo: {
    textAlign: "center",
    fontSize: "0.9em",
    color: "#777",
    marginTop: "20px",
  },
  backToHomeButton: {
    display: "block",
    width: "fit-content",
    margin: "20px auto",
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1em",
    cursor: "pointer",
  },
  backToCartButton: {
    display: "block",
    width: "fit-content",
    margin: "20px auto",
    padding: "10px 20px",
    backgroundColor: "#f0ad4e",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1em",
    cursor: "pointer",
  },
};

export default CheckoutPage;
