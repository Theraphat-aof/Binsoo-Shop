// src/services/adminUserService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

const adminUserService = {
  getAllUsers: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/users${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching all users:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        updates,
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
        `Error updating user ${userId}:`,
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting user ${userId}:`,
        error.response?.data || error.message
      );
      throw error.response?.data || error.message;
    }
  },
};

export default adminUserService;
