// src/services/adminFinanceService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function สำหรับดึง Token จาก localStorage เพื่อใช้ในการยืนยันตัวตน
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // สมมติว่า Token ถูกเก็บใน localStorage ด้วย key 'token'
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminFinanceService = {
    // --- Category API Calls ---

    /**
     * ดึงหมวดหมู่รายรับ/รายจ่ายทั้งหมด (สามารถ filter ด้วย type ได้)
     * @param {string} type - 'income' หรือ 'expense' (optional)
     * @returns {Promise<Array>} รายการหมวดหมู่
     */
    getCategories: async (type = '') => {
        try {
            const url = `${API_BASE_URL}/finance/categories${type ? `?type=${type}` : ''}`;
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Error in getCategories:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * สร้างหมวดหมู่ใหม่
     * @param {object} categoryData - ข้อมูลหมวดหมู่ ({ name, type, description })
     * @returns {Promise<object>} หมวดหมู่ที่ถูกสร้าง
     */
    createCategory: async (categoryData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/finance/categories`, categoryData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in createCategory:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * อัปเดตหมวดหมู่
     * @param {string} id - ID ของหมวดหมู่
     * @param {object} categoryData - ข้อมูลหมวดหมู่ที่ต้องการอัปเดต ({ name, type, description })
     * @returns {Promise<object>} หมวดหมู่ที่ถูกอัปเดต
     */
    updateCategory: async (id, categoryData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/finance/categories/${id}`, categoryData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in updateCategory:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * ลบหมวดหมู่
     * @param {string} id - ID ของหมวดหมู่
     * @returns {Promise<object>} ข้อความยืนยันการลบ
     */
    deleteCategory: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/finance/categories/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error in deleteCategory:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    // --- Transaction API Calls ---

    /**
     * ดึงรายการรายรับ/รายจ่ายทั้งหมด (พร้อม filter และ pagination)
     * @param {object} filters - Object ที่มี properties เช่น { type, category_id, startDate, endDate, page, limit }
     * @returns {Promise<object>} Object ที่มี transactions, currentPage, totalPages, totalItems
     */
    getTransactions: async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const url = `${API_BASE_URL}/finance/transactions?${queryString}`;
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Error in getTransactions:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * สร้างรายการรายรับ/รายจ่ายใหม่
     * @param {object} transactionData - ข้อมูลรายการ ({ type, category_id, amount, description, transaction_date, order_id })
     * @returns {Promise<object>} รายการที่ถูกสร้าง
     */
    createTransaction: async (transactionData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/finance/transactions`, transactionData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in createTransaction:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * อัปเดตรายการรายรับ/รายจ่าย
     * @param {string} id - ID ของรายการ
     * @param {object} transactionData - ข้อมูลรายการที่ต้องการอัปเดต
     * @returns {Promise<object>} รายการที่ถูกอัปเดต
     */
    updateTransaction: async (id, transactionData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/finance/transactions/${id}`, transactionData, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in updateTransaction:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * ลบรายการรายรับ/รายจ่าย
     * @param {string} id - ID ของรายการ
     * @returns {Promise<object>} ข้อความยืนยันการลบ
     */
    deleteTransaction: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/finance/transactions/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error in deleteTransaction:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    // --- Report API Calls ---

    /**
     * ดึงสรุปรายรับรายจ่าย (Total Income, Total Expense, Net Profit)
     * @param {string} startDate - วันที่เริ่มต้น (รูปแบบ YYYY-MM-DD)
     * @param {string} endDate - วันที่สิ้นสุด (รูปแบบ YYYY-MM-DD)
     * @returns {Promise<object>} สรุปข้อมูลการเงิน
     */
    getFinanceSummary: async (startDate, endDate) => {
        try {
            const url = `${API_BASE_URL}/finance/reports/summary?startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Error in getFinanceSummary:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * ดึงข้อมูลรายรับ/รายจ่ายแยกตามหมวดหมู่
     * @param {string} type - 'income' หรือ 'expense'
     * @param {string} startDate - วันที่เริ่มต้น (รูปแบบ YYYY-MM-DD)
     * @param {string} endDate - วันที่สิ้นสุด (รูปแบบ YYYY-MM-DD)
     * @returns {Promise<Array>} รายการสรุปยอดรวมแต่ละหมวดหมู่
     */
    getCategoryBreakdown: async (type, startDate, endDate) => {
        try {
            const url = `${API_BASE_URL}/finance/reports/category-breakdown?type=${type}&startDate=${startDate}&endDate=${endDate}`;
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Error in getCategoryBreakdown:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    /**
     * [NEW FUNCTION]
     * ดึงสรุปรายรับและรายจ่ายรายเดือนย้อนหลัง 12 เดือนจากวันที่ที่กำหนด
     * @param {string} endDate - วันที่สิ้นสุดสำหรับช่วง 12 เดือน (รูปแบบ YYYY-MM-DD)
     * @returns {Promise<Array>} Array ของ Object ที่มี { month: string, total_income: number, total_expense: number }
     */
    getMonthlyFinanceSummary: async (endDate) => {
        try {
            // เราจะส่ง endDate ไปให้ Backend เพื่อคำนวณช่วง 12 เดือนย้อนหลังจากวันที่นั้น
            const url = `${API_BASE_URL}/finance/reports/monthly-summary?endDate=${endDate}`;
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Error in getMonthlyFinanceSummary:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },
};

export default adminFinanceService;