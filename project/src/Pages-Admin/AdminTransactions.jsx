// src/pages/AdminTransactionsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import adminFinanceService from "../Components/adminFinanceService";
import "../Styles/AdminTransactions.css";

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // สำหรับ dropdown เลือกหมวดหมู่
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State สำหรับ Filter และ Pagination
  const [filters, setFilters] = useState({
    type: "", // 'income', 'expense', หรือว่างเปล่าสำหรับทั้งหมด
    category_id: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State สำหรับฟอร์มการเพิ่ม/แก้ไขรายการ
  const [formData, setFormData] = useState({
    id: "", // ใช้สำหรับโหมดแก้ไข
    type: "income", // ค่าเริ่มต้น
    category_id: "",
    amount: "",
    description: "",
    transaction_date: "",
    order_id: "", // อาจจะใส่ค่าว่างหรือ null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // New state for modal visibility

  // Effect สำหรับดึงรายการ Transaction และ Categories
  useEffect(() => {
    fetchTransactions();
  }, [filters]); // ดึงข้อมูลใหม่เมื่อ filters เปลี่ยน

  useEffect(() => {
    fetchCategoriesForDropdown();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFinanceService.getTransactions(filters);
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      setError(err.message || "Failed to load transactions.");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchCategoriesForDropdown = async () => {
    try {
      const data = await adminFinanceService.getCategories();
      setCategories(data);
      // ตั้งค่า category_id เริ่มต้น หากมี
      if (data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load categories for dropdown:", err);
      // ไม่ต้องแสดง error message ใหญ่โต ถ้าแค่ dropdown โหลดไม่ได้
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 })); // Reset page to 1 on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount), // แปลงเป็นตัวเลข
        order_id: formData.order_id === "" ? null : formData.order_id, // แปลงเป็น null ถ้าว่างเปล่า
      };

      if (isEditing) {
        await adminFinanceService.updateTransaction(
          formData.id,
          transactionData
        );
        alert("Transaction updated successfully!");
      } else {
        await adminFinanceService.createTransaction(transactionData);
        alert("Transaction created successfully!");
      }
      resetForm();
      fetchTransactions(); // รีเฟรชข้อมูล
      setIsModalOpen(false); // Close modal after successful submission
    } catch (err) {
      setError(err.message || "Failed to save transaction.");
      console.error("Error saving transaction:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    resetForm(); // Ensure form is clear for new entry
    setIsModalOpen(true);
  };

  const handleEditClick = (transaction) => {
    setFormData({
      id: transaction.id,
      type: transaction.type,
      category_id: transaction.category_id,
      amount: transaction.amount,
      description: transaction.description || "",
      transaction_date: new Date(transaction.transaction_date)
        .toISOString()
        .split("T")[0], // แปลงเป็น YYYY-MM-DD
      order_id: transaction.order_id || "",
    });
    setIsEditing(true);
    setIsModalOpen(true); // Open modal for editing
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setLoading(true);
      setError(null);
      try {
        await adminFinanceService.deleteTransaction(id);
        alert("Transaction deleted successfully!");
        fetchTransactions(); // รีเฟรชข้อมูล
      } catch (err) {
        setError(err.message || "Failed to delete transaction.");
        console.error("Error deleting transaction:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      type: "income",
      category_id: categories.length > 0 ? categories[0].id : "",
      amount: "",
      description: "",
      transaction_date: "",
      order_id: "",
    });
    setIsEditing(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm(); // Clear form when closing modal
  };

  // Filter categories based on selected transaction type for the form
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );
  // Filter options for the main transaction list filter
  const filterOptionsCategories = categories.filter((cat) => {
    if (!filters.type) return true; // Show all if no type filter
    return cat.type === filters.type;
  });

  return (
    <div className="admin-transaction-container">
      <h1>จัดการธุรกรรม</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Button to open the Add/Edit Transaction Modal */}
      <button className="add-new-button" onClick={handleAddClick}>
        เพิ่มธุรกรรมใหม่
      </button>

      {/* Form for adding/editing transaction - now in a modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? "แก้ไขธุรกรรม" : "เพิ่มธุรกรรมใหม่"}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="type">ประเภท</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="income">รายรับ</option>
                  <option value="expense">รายจ่าย</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="category_id">หมวดหมู่</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="amount">ราคา</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="transaction_date">วันที่</label>
                <input
                  type="date"
                  id="transaction_date"
                  name="transaction_date"
                  value={formData.transaction_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">รายละเอียด</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="order_id">หมายเลขคำสั่งซื้อ</label>
                <input
                  type="text"
                  id="order_id"
                  name="order_id"
                  value={formData.order_id}
                  onChange={handleChange}
                  placeholder="ใส่หมายเลขคำสั่งซื้อ"
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {isEditing
                    ? loading
                      ? "ยืนยัน..."
                      : "ยืนยัน"
                    : loading
                    ? "ยืนยัน..."
                    : "ยืนยัน"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-button"
                  disabled={loading}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ส่วน Filter รายการ */}
      <div className="admin-filters-section">
        <h2>กรองข้อมูลธุรกรรม</h2>
        <div className="filter-group">
          <label htmlFor="filterType">ประเภท</label>
          <select
            id="filterType"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">ทั้งหมด</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filterCategory">หมวดหมู่</label>
          <select
            id="filterCategory"
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
          >
            <option value="">หมวดหมู่ทั้งหมด</option>
            {filterOptionsCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filterStartDate">จากวันที่</label>
          <input
            type="date"
            id="filterStartDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filterEndDate">ถึงวันที่</label>
          <input
            type="date"
            id="filterEndDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* ตารางแสดงรายการ Transaction */}
      <div className="admin-table-section">
        {loading && !transactions.length ? (
          <p>Loading transactions...</p>
        ) : (
          <table className="admin-table-transactions">
            <thead>
              <tr>
                <th>ประเภท</th>
                <th>หมวดหมู่</th>
                <th>ราคา</th>
                <th>วันที่</th>
                <th>รายละเอียด</th>
                <th>คำสั่งซื้อ</th>
                <th>คำสั่ง</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td style={{ textAlign: "center" }} colSpan="7">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.type}</td>
                    <td>{t.category_name}</td>
                    <td>{parseFloat(t.amount).toFixed(2)}</td>
                    <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                    <td>{t.description || "-"}</td>
                    <td>{t.order_id || "-"}</td>
                    <td className="group-btn-edit-detele">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="edit-button"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteClick(t.id)}
                        className="delete-button"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={filters.page === page}
              className={filters.page === page ? "active" : ""}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
