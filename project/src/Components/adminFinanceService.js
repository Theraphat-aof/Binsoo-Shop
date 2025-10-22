// src/services/adminFinanceService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminFinanceService = {
  getCategories: async (type = "") => {
    try {
      const url = `${API_BASE_URL}/finance/categories${
        type ? `?type=${type}` : ""
      }`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error(
        "Error in getCategories:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/finance/categories`,
        categoryData,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in createCategory:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/finance/categories/${id}`,
        categoryData,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in updateCategory:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/finance/categories/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in deleteCategory:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  getTransactions: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/finance/transactions?${queryString}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error(
        "Error in getTransactions:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  createTransaction: async (transactionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/finance/transactions`,
        transactionData,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in createTransaction:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  updateTransaction: async (id, transactionData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/finance/transactions/${id}`,
        transactionData,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in updateTransaction:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/finance/transactions/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error in deleteTransaction:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  getFinanceSummary: async (startDate, endDate) => {
    try {
      const url = `${API_BASE_URL}/finance/reports/summary?startDate=${startDate}&endDate=${endDate}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error(
        "Error in getFinanceSummary:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  getCategoryBreakdown: async (type, startDate, endDate) => {
    try {
      const url = `${API_BASE_URL}/finance/reports/category-breakdown?type=${type}&startDate=${startDate}&endDate=${endDate}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error(
        "Error in getCategoryBreakdown:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  getMonthlyFinanceSummary: async (endDate) => {
    try {
      const url = `${API_BASE_URL}/finance/reports/monthly-summary?endDate=${endDate}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      console.error(
        "Error in getMonthlyFinanceSummary:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },
};

export default adminFinanceService;
