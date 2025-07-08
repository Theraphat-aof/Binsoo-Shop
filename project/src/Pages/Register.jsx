// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import authService from '../Components/authService';
import { useNavigate } from 'react-router-dom'; // <--- import useNavigate เพื่อ Redirect

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // State สำหรับแสดงข้อผิดพลาด
  const navigate = useNavigate(); // Hook สำหรับการนำทาง

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError(''); // Clear previous messages

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      setMessage(response.message || 'Registration successful! You can now log in.');
      // Redirect ไปหน้า Login หลังจากลงทะเบียนสำเร็จ
      navigate('/login');
    } catch (err) {
      // err จะเป็น error.response.data ที่ส่งมาจาก Backend
      setError(err.message || 'Registration failed. Please try again.');
      // หาก Backend ส่งข้อความ error ที่เฉพาะเจาะจงมา เช่น { message: 'User already exists' }
      // คุณสามารถเข้าถึงได้ด้วย err.message
    }
  };

  return (
    <div>
      <h2>ลงทะเบียน</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ชื่อผู้ใช้:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>อีเมล:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>รหัสผ่าน:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <label>ยืนยันรหัสผ่าน:</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </div>
        <button type="submit">ลงทะเบียน</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Register;