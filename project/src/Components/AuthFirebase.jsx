// src/components/AuthFirebase.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Components/Firebase"; // ตรวจสอบ path อีกครั้งให้ถูกต้อง (อาจจะเป็น ../firebase หรือ ./Firebase)
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
// ไม่ต้องใช้ useNavigate ที่นี่แล้ว เพราะ AuthContext จะจัดการ
// ไม่ต้องใช้ useState(user) หรือ useEffect(onAuthStateChanged) ที่นี่แล้ว
import { useAuth } from "../Components/useAuth"; // <--- นำเข้า useAuth

import { FcGoogle } from "react-icons/fc";

function AuthFirebase() {
  const { loginWithFirebase, logout, isAuthenticated, user } = useAuth(); // ดึงฟังก์ชันและสถานะจาก AuthContext
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // สั่ง Redirect ไป Google ทันที
      await signInWithRedirect(auth, provider);
      // โค้ดที่อยู่ด้านล่างนี้จะไม่รัน เพราะหน้าเว็บจะถูกเปลี่ยนไป
    } catch (error) {
      alert(`ไม่สามารถเริ่มการล็อกอินด้วย Google ได้: ${error.message}`);
      console.error("Firebase Redirect Sign-In Error:", error);
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // พยายามดึงผลลัพธ์การล็อกอินจากการ Redirect
        const result = await getRedirectResult(auth);

        if (result) {
          // ถ้ามีผลลัพธ์ แปลว่าผู้ใช้เพิ่งกลับมาจาก Google
          const firebaseUser = result.user;

          alert("ล็อกอินด้วย Google สำเร็จ!");

          // เรียกใช้ฟังก์ชันใน AuthContext เพื่อจัดการผู้ใช้ Firebase
          await loginWithFirebase(firebaseUser);
        }
      } catch (error) {
        // จัดการ Error ที่อาจเกิดขึ้นระหว่างการ Redirect (เช่น unauthorized-domain)
        alert(`ล็อกอินด้วย Google ไม่สำเร็จ: ${error.message}`);
        console.error("Firebase Redirect Result Error:", error);

        // หาก Error รุนแรง ควรเรียก logout เพื่อเคลียร์สถานะ local
        logout();
      }
    };

    handleRedirectResult();
  }, [loginWithFirebase, logout, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // สั่ง Firebase Auth ให้ออกจากระบบ
      alert("ออกจากระบบสำเร็จ!");
      logout(); // <--- เรียก logout จาก AuthContext เพื่อเคลียร์สถานะใน Context และนำทาง
    } catch (error) {
      alert(`ออกจากระบบไม่สำเร็จ: ${error.message}`);
      console.error("Firebase Sign Out Error:", error);
    }
  };

  return (
    <div>
      {isAuthenticated && user ? ( // ตรวจสอบจาก AuthContext
        <div>
          <h2>
            ยินดีต้อนรับ, {user.email || user.displayName || user.username}!
          </h2>
          <button onClick={handleSignOut}>ออกจากระบบ (Google)</button>
        </div>
      ) : (
        <div>
          <button
            className="login-google"
            onClick={handleGoogleSignIn}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "5px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
              // ไม่สามารถใช้ :hover หรือ :active ได้โดยตรงใน inline styles
            }}
          >
            <FcGoogle size={30} />
            ล็อคอินด้วย Google
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthFirebase;
