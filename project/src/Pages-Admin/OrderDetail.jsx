// src/pages/OrderDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import productService from "../Components/productService";
import "../Styles/OrderDetail.css";

const OrderDetailPage = () => {
  const { id: orderId } = useParams(); // ดึง orderId จาก URL parameters

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [updateStatusError, setUpdateStatusError] = useState(null);
  const [updateStatusSuccess, setUpdateStatusSuccess] = useState(null);

  // สถานะที่ Backend รองรับ (ควรตรงกับ validStatuses ใน Backend Controller)
  const validStatuses = ["pending", "paid", "completed", "cancelled"];

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getOrderById(orderId);
      setOrder(response.order);
      setCurrentStatus(response.order.status); // ตั้งสถานะปัจจุบันจากข้อมูลที่ดึงมา
    } catch (err) {
      setError(
        "Failed to fetch order details: " + (err.message || "Unknown error")
      );
      console.error("Error fetching order details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]); // ดึงข้อมูลใหม่เมื่อ orderId ใน URL เปลี่ยน

  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
    setUpdateStatusSuccess(null); // ล้างข้อความสำเร็จเมื่อเปลี่ยนสถานะ
    setUpdateStatusError(null); // ล้างข้อความ error เมื่อเปลี่ยนสถานะ
  };

  const handleUpdateStatus = async () => {
    setUpdateStatusLoading(true);
    setUpdateStatusError(null);
    setUpdateStatusSuccess(null);
    try {
      const response = await productService.updateOrderStatus(
        orderId,
        currentStatus
      );
      setUpdateStatusSuccess(
        response.message || "Order status updated successfully!"
      );
      // ถ้าอัปเดตสำเร็จ ให้ดึงข้อมูล Order ใหม่เพื่อแสดงสถานะล่าสุด
      await fetchOrderDetails();
    } catch (err) {
      setUpdateStatusError(
        "Failed to update status: " + (err.message || "Unknown error")
      );
      console.error("Error updating order status:", err);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-container">Loading order details...</div>
    );
  }

  if (error) {
    return <div className="order-detail-container error-message">{error}</div>;
  }

  if (!order) {
    return <div className="order-detail-container">Order not found.</div>;
  }

  return (
    <div className="order-detail-container">
      <h2>รายการที่ - {order.id}</h2>

      <div className="order-info-section">
        <h3>ข้อมูลการสั่งซื้อ</h3>
        <p>
          <strong>ผู้ใช้:</strong> {order.username || "N/A"} (ID:{" "}
          {order.user_id || "Guest"})
        </p>
        <p>
          <strong>ราคารวม:</strong>{" "}
          {parseFloat(order.total_amount).toFixed(2)} บาท
        </p>
        <p>
          <strong>วันที่ทำรายการ:</strong>{" "}
          {new Date(order.order_date).toLocaleString()}
        </p>
        <p>
          <strong>ที่นั่ง:</strong> {order.delivery_address}
        </p>
        <p>
          <strong>เบอร์โทรศัพท์:</strong> {order.contact_phone || "N/A"}
        </p>
        <p>
          <strong>ชำระเงินโดย:</strong> {order.payment_method}
        </p>
        <p>
          <strong>รายละเอียดเพิ่มเติม:</strong> {order.notes || "No notes"}
        </p>
        <p>
          <strong>สถานะปัจจุบัน:</strong>
          <span className={`status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </p>
      </div>

      {/* Status Update Section */}
      <div className="status-update-section">
        <h3>อัปเดตสถานะคำสั่งซื้อ</h3>
        <select value={currentStatus} onChange={handleStatusChange}>
          {validStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdateStatus}
          disabled={updateStatusLoading || currentStatus === order.status}
          className="update-status-button"
        >
          {updateStatusLoading ? "Updating..." : "Update Status"}
        </button>
        {updateStatusError && (
          <p className="error-message">{updateStatusError}</p>
        )}
        {updateStatusSuccess && (
          <p className="success-message">{updateStatusSuccess}</p>
        )}
      </div>

      {/* Order Items Section */}
      <div className="order-items-section">
        <h3>รายการ</h3>
        {order.items && order.items.length > 0 ? (
          <table className="order-items-table">
            <thead>
              <tr>
                <th>รสชาติ</th>
                <th>ขนาด</th>
                <th>จำนวน</th>
                <th>ราคา</th>
                <th>ท็อปปิ้ง</th>
                <th>ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.order_item_id}>
                  <td>{item.flavor_name_at_order}</td>
                  <td>{item.size_name_at_order}</td>
                  <td>{item.bingsoo_quantity}</td>
                  <td>{parseFloat(item.base_price_at_order).toFixed(2)} บาท</td>
                  <td>
                    {item.toppings && item.toppings.length > 0 ? (
                      <ul>
                        {item.toppings.map((topping, idx) => (
                          <li key={idx}>
                            {topping.topping_name_at_order} {" "}
                            {parseFloat(topping.topping_price_at_order).toFixed(
                              2
                            )}{" "}
                            บาท
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No toppings"
                    )}
                  </td>
                  <td>{parseFloat(item.total_item_price).toFixed(2)} บาท</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items in this order.</p>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
