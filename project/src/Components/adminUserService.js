// src/services/adminUserService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ฟังก์ชันนี้จะดึง token จาก localStorage และสร้าง Header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    // ถ้าไม่มี token อาจจะ throw error หรือ return empty object แล้วให้ backend จัดการ authorization
    return {};
};

const adminUserService = {
    /**
     * ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ Admin)
     * @param {object} filters - ตัวกรอง เช่น { page, limit, role, search }
     * @returns {Promise<object>} ข้อมูลผู้ใช้, totalPages, currentPage
     */
    getAllUsers: async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const url = `${API_BASE_URL}/users${queryString ? `?${queryString}` : ''}`;
            const response = await axios.get(url, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * อัปเดตข้อมูลผู้ใช้ (เช่น role หรือ isBlocked status)
     * @param {string} userId - ID ของผู้ใช้
     * @param {object} updates - ออบเจกต์ที่มีข้อมูลที่ต้องการอัปเดต เช่น { role: 'admin', isBlocked: true }
     * @returns {Promise<object>} ข้อมูลผู้ใช้ที่ถูกอัปเดต
     */
    updateUser: async (userId, updates) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${userId}`, updates, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * ลบผู้ใช้ (สำหรับ Admin)
     * @param {string} userId - ID ของผู้ใช้
     * @returns {Promise<object>} ข้อความยืนยันการลบ
     */
    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    }
};

export default adminUserService;