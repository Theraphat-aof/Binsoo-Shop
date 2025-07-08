// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
// Import AuthContext จากไฟล์ใหม่ที่เราเพิ่งสร้าง
import { AuthContext } from './AuthContext';
import authService from './authService';

// 2. สร้าง Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getCurrentUser();

      if (storedToken && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const data = await authService.login(usernameOrEmail, password);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

