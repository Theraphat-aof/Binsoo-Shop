// src/pages/AdminToppingsPage.jsx
import React, { useEffect, useState } from "react";
import adminProductService from "../Components/productServiceAdmin";
import "../Styles/AdminToppings.css"; // Make sure this CSS file exists and is linked

const AdminToppingsPage = () => {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // State for showing/hiding the modal
  const [showModal, setShowModal] = useState(false);
  const [editingTopping, setEditingTopping] = useState(null); // Holds the topping being edited
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stock_quantity: 0,
    is_available: true,
    image: null,
  });

  // Effect to fetch toppings when page changes or on initial load
  useEffect(() => {
    fetchToppings(currentPage);
  }, [currentPage]);

  // Function to fetch toppings from the backend
  const fetchToppings = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminProductService.getAllToppings({
        page,
        limit: itemsPerPage,
      });
      setToppings(response.toppings);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching toppings:", err);
      setError("Failed to load toppings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : name === "price" || name === "stock_quantity"
          ? parseFloat(value)
          : value,
    }));
  };

  // Handle form submission (add/edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = new FormData();
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("price", formData.price);
    dataToSubmit.append("stock_quantity", formData.stock_quantity);
    dataToSubmit.append("is_available", formData.is_available);
    if (formData.image) {
      dataToSubmit.append("image", formData.image);
    }

    try {
      if (editingTopping) {
        await adminProductService.updateTopping(
          editingTopping.id,
          dataToSubmit
        );
        alert("Topping updated successfully!");
      } else {
        await adminProductService.createTopping(dataToSubmit);
        alert("Topping created successfully!");
      }
      setShowModal(false); // Hide the modal
      setEditingTopping(null); // Clear editing topping data
      setFormData({
        name: "",
        price: 0,
        stock_quantity: 0,
        is_available: true,
        image: null,
      }); // Clear form
      fetchToppings(currentPage); // Refresh topping data
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save topping.");
    } finally {
      setLoading(false);
    }
  };

  // When Edit button is clicked
  const handleEditClick = (topping) => {
    setEditingTopping(topping);
    setFormData({
      name: topping.name,
      price: topping.price,
      stock_quantity: topping.stock_quantity,
      is_available: topping.is_available,
      image: null, // Don't pre-fill image, user can upload new one
    });
    setShowModal(true); // Show the modal
  };

  // When Delete button is clicked
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this topping?")) {
      setLoading(true);
      setError(null);
      try {
        await adminProductService.deleteTopping(id);
        alert("Topping deleted successfully!");
        fetchToppings(currentPage); // Refresh topping data
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to delete topping.");
      } finally {
        setLoading(false);
      }
    }
  };

  // When "Add New Topping" button is clicked
  const handleNewToppingClick = () => {
    setEditingTopping(null); // Set to null to indicate new creation
    setFormData({
      name: "",
      price: 0,
      stock_quantity: 0,
      is_available: true,
      image: null,
    }); // Clear form
    setShowModal(true); // Show the modal
  };

  return (
    <div className="admin-topping-container">
      <h1>การจัดการท็อปปิ้ง</h1>

      <button onClick={handleNewToppingClick} className="add-new-button">
        เพิ่มท็อปปิ้งใหม่
      </button>

      {/* Modal for Add/Edit Topping */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTopping ? "แก้ไขท็อปปิ้ง" : "เพิ่มท็อปปิ้งใหม่"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>ชื่อท็อปปิ้ง</label>
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
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>จำนวนสต๊อก</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              {/* <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                />
                {editingTopping &&
                  editingTopping.image_url &&
                  !formData.image && (
                    <p>
                      Current Image:{" "}
                      <img
                        src={editingTopping.image_url}
                        alt="Current"
                        style={{
                          maxWidth: "50px",
                          maxHeight: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </p>
                  )}
              </div> */}
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
                  onClick={() => setShowModal(false)}
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

      {loading && !toppings.length ? (
        <p>Loading toppings...</p>
      ) : (
        <table className="admin-table-toppings">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>ราคา (บาท)</th>
              <th>สต๊อก</th>
              {/* <th>Image</th> */}
              <th>คำสั่ง</th>
            </tr>
          </thead>
          <tbody>
            {toppings.map((topping) => (
              <tr key={topping.id}>
                <td>{topping.name}</td>
                <td>{topping.price}</td>
                <td>{topping.stock_quantity}</td>
                {/* <td>
                  {topping.image_url ? (
                    <img
                      src={topping.image_url}
                      alt={topping.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td> */}
                <td className="group-btn-edit-detele">
                  <button
                    onClick={() => handleEditClick(topping)}
                    className="edit-button"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteClick(topping.id)}
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

export default AdminToppingsPage;
