// src/pages/MyOrdersPage.jsx

import React, { useEffect, useState } from 'react';
import productService from '../Components/productService';
import { Link } from 'react-router-dom';
import '../Styles/MyOrder.css'

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // สถานะสำหรับ Filter และ Pagination (ถ้าต้องการให้ User Filter Order ตัวเองได้)
    const [filters, setFilters] = useState({
        status: '', 
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        totalItems: 0,
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 10
    });

    useEffect(() => {
        const fetchMyOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // เรียกใช้ API เพื่อดึง Order ของ User ที่ Login อยู่
                const response = await productService.getMyOrders(filters);
                setOrders(response.orders);
                setPagination({
                    totalItems: response.totalItems,
                    currentPage: response.currentPage,
                    totalPages: response.totalPages,
                    itemsPerPage: response.itemsPerPage
                });
            } catch (err) {
                // ตรวจสอบ error.response?.status เพื่อจัดการการไม่อนุญาต (เช่น ถ้า token หมดอายุ)
                if (err.response && err.response.status === 401) {
                    setError('Please log in to view your orders.');
                } else {
                    setError('Failed to fetch your orders: ' + (err.message || 'Unknown error'));
                }
                console.error('Error fetching my orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [filters]); // ให้ fetchMyOrders ทำงานใหม่เมื่อ filters เปลี่ยนแปลง

    const handlePageChange = (newPage) => {
        setFilters(prevFilters => ({ ...prevFilters, page: newPage }));
    };

    const handleFilterChange = (e) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [e.target.name]: e.target.value,
            page: 1 // Reset page to 1 when filters change
        }));
    };

    if (loading) {
        return <div className="my-orders-container">Loading your orders...</div>;
    }

    if (error) {
        return <div className="my-orders-container error-message">{error}</div>;
    }

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>

            {/* Filter Section (Optional for user page) */}
            <div className="my-orders-filters">
                <label>
                    Status:
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="preparing">Preparing</option>
                        <option value="shipping">Shipping</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </label>
            </div>

            {/* Orders Table */}
            {orders.length === 0 ? (
                <p>You have no orders yet.</p>
            ) : (
                <table className="my-orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Order Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{parseFloat(order.total_amount).toFixed(2)} THB</td>
                                <td><span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                <td>{new Date(order.order_date).toLocaleString()}</td>
                                <td>
                                    {/* User สามารถดูรายละเอียด Order ของตัวเองได้ */}
                                    <Link to={`/my-orders/${order.id}`} className="view-details-btn">View Details</Link>
                                    {/* ตัวอย่างปุ่มยกเลิก (ต้องมี logic ใน Backend รองรับด้วย) */}
                                    {/* {order.status === 'pending' && (
                                        <button className="cancel-order-btn" onClick={() => handleCancelOrder(order.id)}>Cancel</button>
                                    )} */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="my-orders-pagination">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;