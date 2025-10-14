// src/pages/Auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../Components/useAuth"; 
import "../Styles/Login.css"; 

import AuthFirebase from "../Components/AuthFirebase"; 

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [displayError, setDisplayError] = useState(""); 
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, setAuthError, loading } = useAuth(); 

  useEffect(() => {
    let errorMessageToDisplay = null;

    if (location.state && location.state.message) {
      errorMessageToDisplay = location.state.message;
      navigate(location.pathname, { replace: true, state: {} });
    }
    else if (authError) {
      errorMessageToDisplay = authError;
    }

    if (errorMessageToDisplay && errorMessageToDisplay !== displayError) {
      setDisplayError(errorMessageToDisplay);
    } else if (!errorMessageToDisplay && displayError) {
      setDisplayError("");
    }

    let timer;
    if (errorMessageToDisplay) {
      timer = setTimeout(() => {
        setDisplayError("");
        setAuthError(null); 
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer); 
    };
  }, [
    authError,
    location.state,
    navigate,
    location.pathname,
    setAuthError,
    displayError,
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (displayError) {
      setDisplayError("");
      setAuthError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDisplayError(""); 
    setAuthError(null); 

    try {
      await login(
        formData.username,
        formData.password
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="chocolate-drip-header">
        <svg
          id="visual"
          viewBox="0 0 2500 540"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          version="1.1"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0 130L24.5 123.2C49 116.3 98 102.7 147 86C196 69.3 245 49.7 294 91.5C343 133.3 392 236.7 441 233.5C490 230.3 539 120.7 588 117C637 113.3 686 215.7 735 218.2C784 220.7 833 123.3 882 121.5C931 119.7 980 213.3 1029 275C1078 336.7 1127 366.3 1176.2 335.3C1225.3 304.3 1274.7 212.7 1323.8 199.3C1373 186 1422 251 1471 244.8C1520 238.7 1569 161.3 1618 158.5C1667 155.7 1716 227.3 1765 227.7C1814 228 1863 157 1912 140.3C1961 123.7 2010 161.3 2059 170.3C2108 179.3 2157 159.7 2206 130C2255 100.3 2304 60.7 2353 100.8C2402 141 2451 261 2475.5 321L2500 381L2500 0L2475.5 0C2451 0 2402 0 2353 0C2304 0 2255 0 2206 0C2157 0 2108 0 2059 0C2010 0 1961 0 1912 0C1863 0 1814 0 1765 0C1716 0 1667 0 1618 0C1569 0 1520 0 1471 0C1422 0 1373 0 1323.8 0C1274.7 0 1225.3 0 1176.2 0C1127 0 1078 0 1029 0C980 0 931 0 882 0C833 0 784 0 735 0C686 0 637 0 588 0C539 0 490 0 441 0C392 0 343 0 294 0C245 0 196 0 147 0C98 0 49 0 24.5 0L0 0Z"
            fill="#3f1f06"
            stroke-linecap="round"
            stroke-linejoin="miter"
          ></path>
        </svg>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <h1>ยินดีต้อนรับ</h1>
        {displayError && <p className="error-message">{displayError}</p>}
        <div>
          <label>ชื่อผู้ใช้</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>รหัสผ่าน</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button className="login" type="submit" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
        <AuthFirebase />
        <div
          className="register"
          style={{ textAlign: "center", marginBottom: "0px" }}
        >
          ไม่มีบัญชีใช่ไหม ? <Link to="/register">ลงทะเบียน</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
