import { useState, useEffect } from "react";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import "../Styles/POS.css";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState(""); // สถานะการสั่งซื้อ

  const STRAPI_API_URL = "http://localhost:1337/api";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${STRAPI_API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data from Strapi:", data); // <-- เพิ่มบรรทัดนี้
        setProducts(data.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ฟังก์ชันสำหรับจำลองการสั่งซื้อ
  const handlePlaceOrder = async () => {
    setOrderStatus("กำลังดำเนินการสั่งซื้อ...");
    try {
      // 1. สร้าง Order
      const orderResponse = await fetch(`${STRAPI_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            orderDate: new Date().toISOString(),
            totalAmount: 0, // จะอัปเดตทีหลัง
            statusOrder: "pending", // ชื่อ field ที่ถูกต้อง
            paymentMethod: "Cash",
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(
          `Failed to create order: ${
            errorData.error.message || orderResponse.statusText
          }`
        );
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.data.id;
      console.log("Order created with ID:", orderId);

      // 2. เพิ่ม Order Items (ตัวอย่าง: นม 2 กล่อง, ขนมปัง 1 แผ่น)
      const orderItemsToCreate = [
        { productId: 3, quantity: 2, unitPrice: 45.0 }, // สมมติว่า ID ของนมคือ 3
        { productId: 5, quantity: 1, unitPrice: 30.5 }, // สมมติว่า ID ของขนมปังคือ 5
      ];

      let calculatedTotal = 0;
      for (const item of orderItemsToCreate) {
        const itemSubtotal = item.quantity * item.unitPrice;
        calculatedTotal += itemSubtotal;

        const orderItemResponse = await fetch(`${STRAPI_API_URL}/order-items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: itemSubtotal,
              order: orderId,
              product: item.productId,
            },
          }),
        });

        if (!orderItemResponse.ok) {
          const errorData = await orderItemResponse.json();
          throw new Error(
            `Failed to create order item: ${
              errorData.error.message || orderItemResponse.statusText
            }`
          );
        }
        console.log("Order Item created:", await orderItemResponse.json());
      }

      // 3. อัปเดต Total Amount ของ Order
      const updateOrderResponse = await fetch(
        `${STRAPI_API_URL}/orders/${orderId}`,
        {
          method: "PUT", // ใช้ PUT เพื่ออัปเดต
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              totalAmount: calculatedTotal,
              statusOrder: "completed", // เปลี่ยนสถานะเป็น completed
            },
          }),
        }
      );

      if (!updateOrderResponse.ok) {
        const errorData = await updateOrderResponse.json();
        throw new Error(
          `Failed to update order total: ${
            errorData.error.message || updateOrderResponse.statusText
          }`
        );
      }
      console.log("Order updated:", await updateOrderResponse.json());

      setOrderStatus("สั่งซื้อสำเร็จ! โปรดตรวจสอบใน Strapi Admin.");
    } catch (err) {
      console.error("Error placing order:", err);
      setOrderStatus(`สั่งซื้อล้มเหลว: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">กำลังโหลดสินค้า...</div>;
  if (error)
    return <div className="error">เกิดข้อผิดพลาด: {error.message}</div>;

  return (
    <div className="container">
      <h1>รายการสินค้า</h1>
      <div className="product-list">
        {products.length === 0 ? (
          <p>ไม่พบสินค้าในระบบ.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <h2>{product.name}</h2>
              <p>SKU: {product.sku}</p>
              <p>ราคา: {product.price} บาท</p>
              <p>สต็อก: {product.stock} ชิ้น</p>
              {/* แก้ไขตรงนี้: ใช้ BlocksRenderer */}
              {product.description && product.description.length > 0 ? (
                <BlocksRenderer content={product.description} />
              ) : (
                <p>ไม่มีคำอธิบาย</p>
              )}
            </div>
          ))
        )}
      </div>

      <hr style={{ margin: "40px 0" }} />

      <h2>จำลองการสั่งซื้อ</h2>
      <button
        onClick={handlePlaceOrder}
        disabled={
          orderStatus.includes("กำลัง") || orderStatus.includes("สำเร็จ")
        }
      >
        {orderStatus || "กดเพื่อสั่งซื้อสินค้าตัวอย่าง"}
      </button>
      {orderStatus && (
        <p
          style={{
            marginTop: "10px",
            color: orderStatus.includes("สำเร็จ") ? "green" : "red",
          }}
        >
          {orderStatus}
        </p>
      )}

      <p style={{ marginTop: "20px", fontSize: "0.8em", color: "#777" }}>
        * ตรวจสอบ ID ของสินค้าในโค้ด `handlePlaceOrder` ให้ตรงกับ ID ใน Strapi
        ของคุณ (เช่น ID 3 และ 5)
      </p>
    </div>
  );
};

export default POS;
