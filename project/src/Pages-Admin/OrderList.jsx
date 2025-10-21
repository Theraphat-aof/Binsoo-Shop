// src/pages/OrderListPage.jsx

import React, { useEffect, useState } from "react";
import productService from "../Components/productService";
import { Link } from "react-router-dom";
import "../Styles/OrderList.css";

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    userId: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // เรียกใช้ API เพื่อดึง Order ทั้งหมด
        const response = await productService.getAllOrders(filters);
        setOrders(response.orders);
        setPagination({
          totalItems: response.totalItems,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          itemsPerPage: response.itemsPerPage,
        });
      } catch (err) {
        setError("Failed to fetch orders: " + (err.message || "Unknown error"));
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]); // ให้ fetchOrders ทำงานใหม่เมื่อ filters เปลี่ยนแปลง

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({ ...prevFilters, page: newPage }));
  };

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
      page: 1, // Reset page to 1 when filters change
    }));
  };

  if (loading) {
    return <div className="order-list-container">Loading orders...</div>;
  }

  if (error) {
    return <div className="order-list-container error-message">{error}</div>;
  }

  return (
    <div className="order-list-container">
      {/* Filter Section */}
      <div className="order-filters">
        <h1>การจัดการคำสั่งซื้อ</h1>

        <label>
          สถานะ
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">ทั้งหมด</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="paid">ชำระเงินแล้ว</option> 
            {/* หรือ ready_for_pickup */}
            <option value="completed">สำเร็จ</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </label>
        {/* สามารถเพิ่ม filter อื่นๆ ได้ เช่น user ID, total amount range */}
        {/*
                <label>
                    User ID:
                    <input
                        type="text"
                        name="userId"
                        value={filters.userId}
                        onChange={handleFilterChange}
                        placeholder="Filter by User ID"
                    />
                </label>
                */}
      </div>

      {/* Order Table */}
      {orders.length === 0 ? (
        <p>ไม่มีสินค้าในขณะนี้</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>รายการที่</th>
              {/* <th>ลูกค้า ไอดี</th> */}
              <th>ราคารวม (บาท)</th>
              <th>สถานะ</th>
              <th>วันที่ทำรายการ</th>
              <th>ที่นั่ง</th>
              <th>เบอร์โทรศัพท์</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td data-label="Order ID">{order.id}</td>
                {/* <td data-label="User ID">{order.user_id || "N/A"}</td> */}
                <td data-label="Total Amount">
                  {parseFloat(order.total_amount).toFixed(2)}
                </td>
                <td data-label="Status">
                  <span className={`status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td data-label="Order Date">
                  {new Date(order.order_date).toLocaleString()}
                </td>
                <td data-label="Delivery Address">{order.delivery_address}</td>
                <td data-label="Contact Phone">{order.contact_phone || "-"}</td>
                <td data-label="Actions">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="view-details-btn"
                  >
                    รายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="order-pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            ย้อนกลับ
          </button>
          <span className="page-number">
            หน้า {pagination.currentPage} ถึง {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;
