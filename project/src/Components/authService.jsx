/* eslint-disable no-useless-catch */
// src/services/authService.js
import axios from 'axios';

// ดึง Base URL ของ API จาก Environment Variables
// ตรวจสอบให้แน่ใจว่า VITE_API_BASE_URL ถูกตั้งค่าอย่างถูกต้องในไฟล์ .env ของคุณ
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// สร้าง Axios instance เพื่อใช้สำหรับ API calls ทั้งหมด
// ทำให้ง่ายต่อการตั้งค่าและจัดการ interceptor เพียงครั้งเดียว
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ตัวแปรสำหรับเก็บ reference ของฟังก์ชัน handleApiError จาก AuthProvider
// ฟังก์ชันนี้จะถูกเรียกเมื่อเกิดข้อผิดพลาดจาก API
let errorHandlerCallback = null;

/**
 * ฟังก์ชันสำหรับตั้งค่า callback จาก AuthProvider
 * @param {function} callback - ฟังก์ชันที่จะถูกเรียกเมื่อเกิดข้อผิดพลาดจาก API
 */
const setErrorHandler = (callback) => {
  errorHandlerCallback = callback;
};

// เพิ่ม Axios Interceptor สำหรับ Response
// Interceptor นี้จะดักจับ Response ที่มี Error ก่อนที่จะส่งต่อไปยัง Component ที่เรียกใช้
axiosInstance.interceptors.response.use(
  (response) => response, // ถ้า Response สำเร็จ ให้ส่ง Response นั้นกลับไป
  (error) => {
    // ถ้า Response มี Error
    if (errorHandlerCallback) {
      // เรียกใช้ฟังก์ชัน handleApiError ที่ส่งมาจาก AuthProvider
      // หาก handleApiError จัดการ Error แล้ว (เช่น redirect หน้า, แสดงข้อความ) จะคืนค่า true
      const handled = errorHandlerCallback(error);
      if (handled) {
        // ถ้า error ถูกจัดการแล้ว ไม่ต้อง throw error ซ้ำ
        // การคืนค่า Promise ที่ไม่ resolve/reject จะหยุดการประมวลผล Error ต่อไป
        return new Promise(() => {});
      }
    }
    // ถ้า error ไม่ได้ถูกจัดการโดย errorHandlerCallback หรือไม่มี callback
    // ให้ throw error นั้นกลับไป เพื่อให้ Component หรือ Hook ที่เรียกใช้จัดการต่อ
    // โดยจะพยายามส่ง error.response.data กลับไปก่อน (ซึ่งมักจะมีข้อความ error จาก Backend)
    // หากไม่มี ก็จะใช้ error.message ทั่วไป
    return Promise.reject(error.response ? error.response.data : new Error(error.message));
  }
);

const authService = {
  /**
   * ฟังก์ชันสำหรับลงทะเบียนผู้ใช้ใหม่
   * @param {string} username - ชื่อผู้ใช้
   * @param {string} email - อีเมล
   * @param {string} password - รหัสผ่าน
   * @returns {Promise<object>} ข้อมูล Response จาก Backend
   * @throws {object} Error object จาก Backend หากมีข้อผิดพลาด
   */
  register: async (username, email, password) => {
    try {
      // ใช้ `/auth/register` เพื่อความสอดคล้องกับโครงสร้าง API ทั่วไป
      const response = await axiosInstance.post(`/auth/register`, { 
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // error จะถูกจัดการโดย interceptor หรือถูกโยนต่อไปยัง AuthProvider
      throw error;
    }
  },

  /**
   * ฟังก์ชันสำหรับเข้าสู่ระบบผู้ใช้ (local account)
   * @param {string} username - ชื่อผู้ใช้หรืออีเมล
   * @param {string} password - รหัสผ่าน
   * @returns {Promise<object>} ข้อมูล Response จาก Backend (รวมถึง token และ user info)
   * @throws {object} Error object จาก Backend หากมีข้อผิดพลาด
   */
  login: async (username, password) => {
    try {
      const response = await axiosInstance.post(`/auth/login`, { 
        username,
        password,
      });
      const { token, user } = response.data;

      // เก็บ token และข้อมูลผู้ใช้ใน Local Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      // error จะถูกจัดการโดย interceptor หรือถูกโยนต่อไปยัง AuthProvider
      throw error;
    }
  },

  /**
   * ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Firebase (เช่น Google Sign-in)
   * @param {object} firebaseUserData - ข้อมูลผู้ใช้จาก Firebase (idToken, uid, email, displayName, photoURL)
   * @returns {Promise<object>} ข้อมูล Response จาก Backend (รวมถึง token และ user info)
   * @throws {object} Error object จาก Backend หากมีข้อผิดพลาด
   */
  loginWithFirebase: async ({ idToken, uid, email, displayName, photoURL }) => {
    try {
      const response = await axiosInstance.post(`/auth/login/firebase`, { 
        idToken,
        uid,
        email,
        displayName,
        photoURL,
      });
      const { token, user } = response.data;

      // เก็บ token และข้อมูลผู้ใช้ใน Local Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      // error จะถูกจัดการโดย interceptor หรือถูกโยนต่อไปยัง AuthProvider
      throw error;
    }
  },

  /**
   * ฟังก์ชันสำหรับออกจากระบบ (ลบ token และข้อมูลผู้ใช้ออกจาก localStorage)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * ฟังก์ชันสำหรับดึง token ที่เก็บไว้ใน Local Storage
   * @returns {string|null} JWT token หรือ null ถ้าไม่มี
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้ Login อยู่หรือไม่
   * (เป็นการตรวจสอบ token ใน localStorage เบื้องต้น ไม่ได้ยืนยันกับ Backend)
   * @returns {boolean} true ถ้ามี token, false ถ้าไม่มี
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ที่เก็บไว้ใน Local Storage (ถ้ามี)
   * @returns {object|null} ข้อมูลผู้ใช้ หรือ null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        return null;
      }
    }
    return null;
  },

  /**
   * ฟังก์ชันสำหรับตรวจสอบความถูกต้องของ token กับ Backend
   * Endpoint นี้มักจะใช้เพื่อดึงข้อมูลผู้ใช้ปัจจุบันและยืนยัน token
   * @returns {Promise<object>} ข้อมูล user จาก Backend หาก token ยังถูกต้อง
   * @throws {object} Error object หาก token ไม่ถูกต้องหรือหมดอายุ (ซึ่งจะถูก interceptor จัดการ)
   */
  verifyToken: async () => {
    try {
      // Endpoint สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน (เช่น /auth/me หรือ /users/me)
      const response = await axiosInstance.get(`/auth/me`); 
      return response.data; 
    } catch (error) {
      // error จะถูกจัดการโดย interceptor หรือถูกโยนต่อไปยัง AuthProvider
      throw error;
    }
  },

  // ส่งออกฟังก์ชัน setErrorHandler เพื่อให้ AuthProvider สามารถตั้งค่าได้
  setErrorHandler,
};

// ตั้งค่า Interceptor สำหรับการส่ง request (แนบ token ไปกับทุก request ที่ต้องการการยืนยันตัวตน)
// ต้องทำหลังจากที่ authService.getToken ถูกกำหนดแล้ว
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken(); // ใช้ getToken จาก authService
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authService;
