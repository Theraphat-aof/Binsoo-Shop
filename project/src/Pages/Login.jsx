// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
//import authService from './authService';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../Components/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(''); // State สำหรับแสดงข้อผิดพลาด
  const navigate = useNavigate(); // Hook สำหรับการนำทาง
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous messages

    try {
      const response = await login( // <--- เรียกใช้ login จาก Context
        formData.usernameOrEmail,
        formData.password
      );
      console.log('Login successful:', response);
      navigate('/order-bingsoo'); // Redirect ไปหน้าแรก
      // ไม่ต้อง window.location.reload() แล้ว เพราะ AuthContext จะอัปเดต state ให้เอง
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div>
      <h2>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ชื่อผู้ใช้หรืออีเมล:</label>
          <input type="text" name="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange} required />
        </div>
        <div>
          <label>รหัสผ่าน:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;