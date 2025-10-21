// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Components/useAuth';

/**
 * Component สำหรับป้องกัน Route ที่ต้องมีการ Login หรือมี Role ที่กำหนด
 * @param {object} props - Props สำหรับ ProtectedRoute
 * @param {string[]} [props.allowedRoles] - Array ของ roles ที่อนุญาตให้เข้าถึง (เช่น ['admin', 'user'])
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth(); // ดึงสถานะ Auth จาก Context

  // 1. ถ้ากำลังโหลดสถานะ Auth อยู่ ให้แสดง Loading
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  // 2. ถ้าไม่ได้ Login ให้ Redirect ไปหน้า Login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. ถ้า Login แล้ว แต่มี allowedRoles กำหนดไว้
  if (allowedRoles) {
    // ตรวจสอบว่า user มี role ที่อยู่ใน allowedRoles หรือไม่
    // user?.role?.toLowerCase() เพื่อป้องกัน error ถ้า user หรือ role เป็น undefined
    // และแปลงเป็น lower case เพื่อให้เทียบเคียงได้ง่ายขึ้น
    if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
      // ถ้าไม่มี role ที่อนุญาต ให้ Redirect ไปหน้าแรก หรือหน้า Unauthorized
      // คุณอาจสร้างหน้า /unauthorized แยกต่างหากได้
      return <Navigate to="/" replace />;
    }
  }

  // 4. ถ้าผ่านทุกเงื่อนไข (Login แล้วและมี Role ถูกต้อง) ให้ Render Component ลูกๆ
  // Outlet ใช้สำหรับเมื่อ ProtectedRoute ถูกใช้เป็น Layout Route
  // ถ้าใช้เป็น Element เดียวๆ จะใช้ children แทน
  // สำหรับตอนนี้เราจะใช้ Outlet เป็นหลักในการป้องกัน routes
  return <Outlet />;
};

export default ProtectedRoute;