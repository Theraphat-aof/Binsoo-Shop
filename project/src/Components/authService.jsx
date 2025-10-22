/* eslint-disable no-useless-catch */
// src/services/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let errorHandlerCallback = null;

const setErrorHandler = (callback) => {
  errorHandlerCallback = callback;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (errorHandlerCallback) {
      const handled = errorHandlerCallback(error);
      if (handled) {
        return new Promise(() => {});
      }
    }

    return Promise.reject(
      error.response ? error.response.data : new Error(error.message)
    );
  }
);

const authService = {
  register: async (username, email, password) => {
    try {
      const response = await axiosInstance.post(`/auth/register`, {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await axiosInstance.post(`/auth/login`, {
        username,
        password,
      });
      const { token } = response.data;

      localStorage.setItem("token", token);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  loginWithFirebase: async ({ idToken, uid, email, displayName, photoURL }) => {
    try {
      const response = await axiosInstance.post(`/auth/login/firebase`, {
        idToken,
        uid,
        email,
        displayName,
        photoURL,
      });
      const { token } = response.data;

      localStorage.setItem("token", token);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  verifyToken: async () => {
    try {
      const response = await axiosInstance.get(`/auth/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  setErrorHandler,
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authService;
