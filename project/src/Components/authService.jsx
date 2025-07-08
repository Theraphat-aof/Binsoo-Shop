// src/services/authService.js
import axios from 'axios';

// ดึง base URL จาก .env file
// ตรวจสอบให้แน่ใจว่าได้สร้างไฟล์ .env และมี VITE_API_BASE_URL=http://localhost:7040/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      // Backend ควรจะคืนค่าเช่น { message: 'User registered successfully!' }
      return response.data;
    } catch (error) {
      // จัดการ Error ที่มาจาก Backend (เช่น validation errors, user already exists)
      // error.response.data จะมีข้อมูล error ที่ Backend ส่งกลับมา
      throw error.response ? error.response.data : new Error(error.message);
    }
  },

  /**
   * ฟังก์ชันสำหรับเข้าสู่ระบบผู้ใช้
   * @param {string} username - ชื่อผู้ใช้หรืออีเมล
   * @param {string} password - รหัสผ่าน
   * @returns {Promise<object>} ข้อมูล Response จาก Backend (รวมถึง token และ user info)
   * @throws {object} Error object จาก Backend หากมีข้อผิดพลาด
   */
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username, // ใช้ชื่อเดียวกับที่ Backend คาดหวัง
        password,
      });
      // Backend ควรจะคืนค่าเช่น { token: '...', user: { id: ..., username: ..., role: ... } }
      const { token, user } = response.data;

      // เก็บ JWT ไว้ใน localStorage เพื่อใช้งานในภายหลัง
      localStorage.setItem('token', token);
      // อาจจะเก็บข้อมูล user พื้นฐานไว้ใน localStorage ด้วย
      localStorage.setItem('user', JSON.stringify(user));

      return response.data; // คืนค่าข้อมูลทั้งหมด
    } catch (error) {
      // จัดการ Error เช่น Invalid Credentials
      throw error.response ? error.response.data : new Error(error.message);
    }
  },

  /**
   * ฟังก์ชันสำหรับออกจากระบบ (ลบ token ออกจาก localStorage)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // อาจจะต้อง Redirect ไปหน้า Login ด้วย
  },

  /**
   * ฟังก์ชันสำหรับดึง token ที่เก็บไว้
   * @returns {string|null} JWT token หรือ null ถ้าไม่มี
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * ฟังก์ชันสำหรับตรวจสอบว่าผู้ใช้ Login อยู่หรือไม่
   * (เป็นแค่การตรวจสอบ token ใน localStorage เบื้องต้น ไม่ได้ยืนยันกับ Backend)
   * @returns {boolean} true ถ้ามี token, false ถ้าไม่มี
   */
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ที่เก็บไว้ (ถ้ามี)
   * @returns {object|null} ข้อมูลผู้ใช้ หรือ null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;