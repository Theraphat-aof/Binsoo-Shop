import React, { useEffect, useState } from "react";
import adminProductService from "../Components/productServiceAdmin";
import "../Styles/AdminSize.css"; // Make sure this path is correct

const AdminSizesPage = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // State สำหรับ Modal
  const [showModal, setShowModal] = useState(false); // Controls modal visibility
  const [editingSize, setEditingSize] = useState(null); // Stores size data being edited
  const [formData, setFormData] = useState({
    name: "",
    base_price: 0,
    description: "",
  });

  useEffect(() => {
    fetchSizes(currentPage);
  }, [currentPage]);

  const fetchSizes = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminProductService.getAllSizes({
        page,
        limit: itemsPerPage,
      });
      setSizes(response.sizes);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching sizes:", err);
      setError("Failed to load sizes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "base_price" ? parseFloat(value) : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = {
      name: formData.name,
      base_price: formData.base_price,
      description: formData.description,
    };

    try {
      if (editingSize) {
        await adminProductService.updateSize(editingSize.id, dataToSubmit);
        alert("Size updated successfully!");
      } else {
        await adminProductService.createSize(dataToSubmit);
        alert("Size created successfully!");
      }
      setShowModal(false); // Close modal
      setEditingSize(null);
      setFormData({ name: "", base_price: 0, description: "" });
      fetchSizes(currentPage);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save size.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (size) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      base_price: size.base_price,
      description: size.description || "",
    });
    setShowModal(true); // Open modal
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this size?")) {
      setLoading(true);
      setError(null);
      try {
        await adminProductService.deleteSize(id);
        alert("Size deleted successfully!");
        fetchSizes(currentPage);
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to delete size.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewSizeClick = () => {
    setEditingSize(null);
    setFormData({ name: "", base_price: 0, description: "" });
    setShowModal(true); // Open modal
  };

  return (
    <div className="admin-size-container">
      <h1>การจัดการขนาดภาชนะ</h1>
      <button onClick={handleNewSizeClick} className="add-new-button">
        เพิ่มขนาดภาชนะใหม่
      </button>
      {/* Modal Structure */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingSize ? "แก้ไขขนาดภาชนะ" : "เพิ่มขนาดใหม่"}</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>ขนาดภาชนะ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>ราคา</label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>รายละเอียดเพิ่มเติม</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "ยืนยัน..." : "ยืนยัน"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="cancel-button"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {error && !showModal && <p className="error-message">{error}</p>}{" "}
      {/* Show general error outside modal if form is not open */}
      {loading && !sizes.length && !showModal ? (
        <p>Loading sizes...</p>
      ) : (
        <table className="admin-table-size">
          <thead>
            <tr>
              <th>ขนาดภาชนะ</th>
              <th>ราคา (บาท)</th>
              <th>รายละเอียด</th>
              <th>คำสั่ง</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size.id}>
                <td>{size.name}</td>
                <td>{size.base_price}</td>
                <td>{size.description}</td>
                <td className='group-btn-edit-detele'>
                  <button
                    onClick={() => handleEditClick(size)}
                    className="edit-button"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteClick(size.id)}
                    className="delete-button"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            disabled={currentPage === page}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSizesPage;
