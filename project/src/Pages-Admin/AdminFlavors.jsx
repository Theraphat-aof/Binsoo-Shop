import React, { useEffect, useState } from "react";
import adminProductService from "../Components/productServiceAdmin";
import "../Styles/AdminFlavors.css"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminFlavorsPage = () => {
  const [flavors, setFlavors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false); // Changed from showForm to showModal
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_available: true,
    image: null,
  });

  useEffect(() => {
    fetchFlavors(currentPage);
  }, [currentPage]);

  const fetchFlavors = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminProductService.getAllFlavors({
        page,
        limit: itemsPerPage,
      });
      setFlavors(response.flavors);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching flavors:", err);
      setError("Failed to load flavors.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = new FormData();
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("description", formData.description);
    dataToSubmit.append("is_available", formData.is_available);
    if (formData.image) {
      dataToSubmit.append("productImage", formData.image);
    }

    try {
      if (editingFlavor) {
        await adminProductService.updateFlavor(editingFlavor.id, dataToSubmit);
        alert("Flavor updated successfully!");
      } else {
        await adminProductService.createFlavor(dataToSubmit);
        alert("Flavor created successfully!");
      }
      setShowModal(false); // Close the modal
      setEditingFlavor(null);
      setFormData({
        name: "",
        description: "",
        is_available: true,
        image: null,
      });
      fetchFlavors(currentPage);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save flavor.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (flavor) => {
    setEditingFlavor(flavor);
    setFormData({
      name: flavor.name,
      description: flavor.description || "",
      is_available: flavor.is_available,
      image: null, // Image input should be cleared for new selection
    });
    setShowModal(true); // Open the modal
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this flavor?")) {
      setLoading(true);
      setError(null);
      try {
        await adminProductService.deleteFlavor(id);
        alert("Flavor deleted successfully!");
        fetchFlavors(currentPage);
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to delete flavor.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewFlavorClick = () => {
    setEditingFlavor(null);
    setFormData({ name: "", description: "", is_available: true, image: null });
    setShowModal(true); // Open the modal
  };

  return (
    <div className="admin-page-container">
      <h1>การจัดการรสชาติ</h1>

      <button onClick={handleNewFlavorClick} className="add-new-button">
        เพิ่มรสชาติใหม่
      </button>

      {/* Modal for Add/Edit Flavor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingFlavor ? "แก้ไขรสชาติ" : "เพิ่มรสชาติใหม่"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>รสชาติ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
              <div className="form-group">
                <label>เพิ่มไฟล์ภาพ</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                />
                {editingFlavor && editingFlavor.image_url && !formData.image && (
                  <p className="current-image-preview">
                    ไฟล์ภาพที่เลือก:{" "}
                    <img
                      src={`${API_BASE_URL}${editingFlavor.image_url}`}
                      alt="Current"
                      style={{ maxWidth: "50px", maxHeight: "50px" }}
                    />
                  </p>
                )}
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleInputChange}
                  />
                  พร้อมใช้งาน
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "ยืนยัน..." : "ยืนยัน"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)} // Close modal
                  disabled={loading}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {loading && !flavors.length ? (
        <p>Loading flavors...</p>
      ) : (
        <div className="flavor-cards-container">
          {flavors.map((flavor) => (
            <div className="flavor-card" key={flavor.id}>
              <div className="flavor-card-image-container">
                {flavor.image_url ? (
                  <img
                    src={`${API_BASE_URL}${flavor.image_url}`}
                    alt={flavor.name}
                    className="flavor-card-image"
                  />
                ) : (
                  <span className="flavor-card-image-placeholder">ไม่มีไฟล์ภาพ</span>
                )}
              </div>
              <div className="flavor-card-content">
                <h3 className="flavor-card-title">{flavor.name}</h3>
                <p className="flavor-card-description">
                  {flavor.description || "No description."}
                </p>
                <div className="flavor-card-actions">
                  <button
                    onClick={() => handleEditClick(flavor)}
                    className="edit-button"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteClick(flavor.id)}
                    className="delete-button"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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

export default AdminFlavorsPage;