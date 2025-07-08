// src/services/productService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ฟังก์ชันนี้จะดึง token จาก localStorage และสร้าง Header
const getAuthHeaders = () => {
  // ตรวจสอบว่าคุณเก็บ token ใน localStorage ในรูปแบบไหน
  // ถ้าเก็บตรงๆ เป็น 'token': 'abc...'
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  // ถ้าเก็บในรูป object เช่น 'user': { token: 'abc...' }
  // const user = JSON.parse(localStorage.getItem('user'));
  // if (user && user.token) {
  //   return { Authorization: `Bearer ${user.token}` };
  // }

  // หากไม่มี token ให้คืนค่า object ว่าง
  return {};
};

const productService = {
    getFlavors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/flavors`); // ไม่ต้องใช้ token สำหรับ GET ทั่วไป
      return response.data;
    } catch (error) {
      console.error('Error fetching flavors:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getSizes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sizes`); // ไม่ต้องใช้ token สำหรับ GET ทั่วไป
      return response.data;
    } catch (error) {
      console.error('Error fetching sizes:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getToppings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/toppings`); // ไม่ต้องใช้ token สำหรับ GET ทั่วไป
      return response.data;
    } catch (error) {
      console.error('Error fetching toppings:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  addToCart: async (item) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cart/item`, item, {
        headers: {
          'Content-Type': 'application/json', // แนะนำให้ใส่ Content-Type ด้วย
          ...getAuthHeaders() // ใช้ spread operator เพื่อรวม headers
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getCart: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders() // ใช้ฟังก์ชันนี้เลย
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cart/items/${itemId}`, { quantity }, {
        headers: getAuthHeaders() // ใช้ฟังก์ชันนี้เลย
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  removeCartItem: async (itemId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`, {
        headers: getAuthHeaders() // ใช้ฟังก์ชันนี้เลย
      });
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },
  /**
       * สร้างคำสั่งซื้อ
       * @param {object} orderDetails - รายละเอียดคำสั่งซื้อ
       * @returns {Promise<object>} ข้อมูลคำสั่งซื้อที่สร้างขึ้น
       */
  createOrder: async (orderDetails) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, orderDetails, {
        headers: {
          'Content-Type': 'application/json', // ระบุ Content-Type
          ...getAuthHeaders() // ใช้ฟังก์ชันรวม Header Authentication
        },
      });
      return response.data; // Backend ส่งข้อมูล order ที่สร้างเสร็จกลับมา
    } catch (error) {
      console.error('Error creating order in productService:', error.response?.data || error.message);
      // โยน error ที่ Backend ส่งกลับมาให้ Frontend จัดการต่อ
      throw error.response?.data || error.message;
    }
  },

  // ฟังก์ชันอื่นๆ ที่เกี่ยวข้องกับ Admin (เช่น get all orders, update order status) จะเพิ่มในภายหลัง
};

export default productService;