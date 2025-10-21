// src/pages/AdminUsersPage.jsx
import React, { useEffect, useState } from "react";
import adminUserService from "../Components/adminUserService";
import "../Styles/AdminUser.css";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // กำหนดจำนวนผู้ใช้ต่อหน้า

  // State สำหรับ Modal/Form ในการแก้ไข Role
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // ผู้ใช้ที่กำลังแก้ไข
  const [newRole, setNewRole] = useState(""); // Role ใหม่ที่เลือก
  const [blockStatus, setBlockStatus] = useState(false); // สถานะการบล็อกใหม่

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminUserService.getAllUsers({
        page,
        limit: itemsPerPage,
      });
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        "Failed to load users. Please check your network or server status."
      );
    } finally {
      setLoading(false);
    }
  };

  // เปิด Modal แก้ไขข้อมูลผู้ใช้
  const handleEditUserClick = (user) => {
    setCurrentUser(user);
    setNewRole(user.role); // ตั้งค่า role ปัจจุบัน
    setBlockStatus(user.isBlocked); // ตั้งค่า block status ปัจจุบัน
    setShowEditModal(true);
  };

  // ปิด Modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setCurrentUser(null);
    setNewRole("");
    setBlockStatus(false);
  };

  // ส่งการเปลี่ยนแปลง role หรือ block status ไปยัง Backend
  const handleUpdateUser = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    try {
      await adminUserService.updateUser(currentUser.id, {
        role: newRole,
        isBlocked: blockStatus,
      });
      alert("User updated successfully!");
      handleCloseModal();
      fetchUsers(currentPage); // รีเฟรชข้อมูลผู้ใช้
    } catch (err) {
      console.error("Update user error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  // ลบผู้ใช้
  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      setLoading(true);
      setError(null);
      try {
        await adminUserService.deleteUser(userId);
        alert("User deleted successfully!");
        fetchUsers(currentPage);
      } catch (err) {
        console.error("Delete user error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to delete user.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-user-container">
      <h1>การจัดการผู้ใช้</h1>

      {error && <p className="error-message">{error}</p>}

      {loading && !users.length ? (
        <p>Loading users...</p>
      ) : (
        <table className="admin-table-user">
          <thead>
            <tr>
              <th>ID</th>
              <th>ชื่อผู้ใช้</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              {/* <th>Status</th> */}
              <th>คำสั่ง</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                {/* <td>{user.isBlocked ? "Blocked" : "Active"}</td> */}
                <td className='group-btn-edit-detele'>
                  <button
                    onClick={() => handleEditUserClick(user)}
                    className="edit-button"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
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

      {/* Modal for editing user role and block status */}
      {showEditModal && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>แก้ไขผู้ใช้: {currentUser.username}</h2>
            <div className="form-group">
              <label>บทบาท</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" onClick={handleUpdateUser} disabled={loading}>
                {loading ? "ยืนยัน..." : "ยืนยัน"}
              </button>
              <button type="button" onClick={handleCloseModal} disabled={loading}>
                ยกเลิก
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
