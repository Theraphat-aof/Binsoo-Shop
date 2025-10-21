// src/pages/AdminCategoriesPage.jsx
import React, { useEffect, useState } from "react";
import adminFinanceService from "../Components/adminFinanceService";
import "../Styles/AdminCategories.css";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the form data (used by both add and edit)
  const [formData, setFormData] = useState({
    id: "", // Used for edit mode
    name: "",
    type: "income", // Default value
    description: "",
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFinanceService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (showEditModal) {
        await adminFinanceService.updateCategory(formData.id, formData);
        alert("Category updated successfully!");
      } else {
        // It's an add operation
        await adminFinanceService.createCategory(formData);
        alert("Category created successfully!");
      }
      closeModals(); // Close the active modal
      fetchCategories(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to save category.");
      console.error("Error saving category:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    resetForm(); // Clear form for new entry
    setShowAddModal(true);
  };

  const handleEditClick = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      type: category.type,
      description: category.description || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setLoading(true);
      setError(null);
      try {
        await adminFinanceService.deleteCategory(id);
        alert("Category deleted successfully!");
        fetchCategories(); // Refresh data
      } catch (err) {
        setError(err.message || "Failed to delete category.");
        console.error("Error deleting category:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      type: "income",
      description: "",
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm(); // Clear form when closing modals
  };

  return (
    <div className="admin-Categories-container">
      <h1>การจัดการหมวดหมู่</h1>

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleAddClick} className="add-new-button">
        เพิ่มหมวดหมู่ใหม่
      </button>

      {/* Add New Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">หมวดหมู่</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
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
                <label htmlFor="description">รายละเอียดเพิ่มเติม</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "ยืนยัน..." : "ยืนยัน"}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
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

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>แก้ไขหมวดหมู่</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">หมวดหมู่</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
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
                <label htmlFor="description">รายละเอียดเพิ่มเติม</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "ยืนยัน..." : "ยืนยัน"}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
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

      {/* Category List Table */}
      <div className="admin-table-section">
        {loading && !categories.length ? (
          <p>Loading categories...</p>
        ) : (
          <table className="admin-table-categories">
            <thead>
              <tr>
                <th>หมวดหมู่</th>
                <th>ประเภท</th>
                <th>รายละเอียด</th>
                <th>คำสั่ง</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.type}</td>
                    <td>{category.description || "-"}</td>
                    <td className="group-btn-edit-detele">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="edit-button"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.id)}
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
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
