// src/pages/Auth/Register.jsx
import React, { useState } from "react";
import authService from "../Components/authService";
import { useNavigate } from "react-router-dom";
import "../Styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      setMessage(
        response.message || "Registration successful! You can now log in."
      );
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      {" "}
      <form onSubmit={handleSubmit} className="register-form">
        {" "}
        <div>
          <label>ชื่อผู้ใช้:</label>{" "}
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />{" "}
        </div>{" "}
        <div>
          <label>อีเมล:</label>{" "}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />{" "}
        </div>{" "}
        <div>
          <label>รหัสผ่าน:</label>{" "}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />{" "}
        </div>{" "}
        <div>
          <label>ยืนยันรหัสผ่าน:</label>{" "}
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />{" "}
        </div>
        <button type="submit">ลงทะเบียน</button>{" "}
      </form>
      {message && <p className="success-message">{message}</p>}{" "}
      {error && <p className="error-message">{error}</p>}{" "}
    </div>
  );
};

export default Register;
