// src/context/AuthContext.js
import { createContext, useContext } from 'react';

// 1. สร้าง Context Object
export const AuthContext = createContext(null);

// Hook ที่กำหนดเองเพื่อความสะดวกในการใช้งาน AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};