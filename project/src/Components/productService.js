// src/services/productService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ฟังก์ชันนี้จะดึง token จาก localStorage และสร้าง Header
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

const productService = {
    getFlavors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/flavors`); 
      return response.data;
    } catch (error) {
      console.error('Error fetching flavors:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getSizes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sizes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sizes:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  getToppings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/toppings`); 
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
          'Content-Type': 'application/json', 
          ...getAuthHeaders() 
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
        headers: getAuthHeaders() 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cart/item/${itemId}`, { quantity }, {
        headers: getAuthHeaders() 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

    removeItemFromCart: async (cartItemId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_BASE_URL}/cart/item/${cartItemId}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Error removing cart item:", error);
            throw error;
        }
    },

        clearCart: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_BASE_URL}/cart/clear`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    },
  /**
       * สร้างคำสั่งซื้อ
       * @param {object} orderDetails
       * @returns {Promise<object>} 
       */
  createOrder: async (orderDetails) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, orderDetails, {
        headers: {
          'Content-Type': 'application/json', 
          ...getAuthHeaders() 
        },
      });
      return response.data; 
    } catch (error) {
      console.error('Error creating order in productService:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

      getAllOrders: async (filters = {}) => {
        try {
            // สร้าง query string จาก filters object
            const queryString = new URLSearchParams(filters).toString();
            const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;
            
            const response = await axios.get(url, {
                headers: getAuthHeaders() // ต้องส่ง token ของ Admin ไปด้วย
            });
            return response.data; 
        } catch (error) {
            console.error('Error fetching all orders:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    // ดึงรายละเอียดคำสั่งซื้อตาม ID
    getOrderById: async (orderId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
                headers: getAuthHeaders()
            });
            return response.data; 
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    // อัปเดตสถานะคำสั่งซื้อ
    updateOrderStatus: async (orderId, newStatus) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() // ต้องส่ง token ของ Admin
                }
            });
            return response.data; 
        } catch (error) {
            console.error(`Error updating order status for ${orderId} to ${newStatus}:`, error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    },

    // ฟังก์ชันสำหรับดึงคำสั่งซื้อของ User ที่ login อยู่ (ถ้าคุณจะทำหน้า Order History ของ User ด้วย)
    getMyOrders: async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const url = `${API_BASE_URL}/orders/my${queryString ? `?${queryString}` : ''}`;
            const response = await axios.get(url, {
                headers: getAuthHeaders()
            });
            return response.data; 
        } catch (error) {
            console.error('Error fetching my orders:', error.response?.data || error.message);
            throw error.response?.data || error.message;
        }
    }
};

export default productService;