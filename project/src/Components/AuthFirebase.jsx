// src/components/AuthFirebase.jsx

import React from "react";
import { auth } from "../Components/Firebase"; // ตรวจสอบ path อีกครั้งให้ถูกต้อง (อาจจะเป็น ../firebase หรือ ./Firebase)
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// ไม่ต้องใช้ useNavigate ที่นี่แล้ว เพราะ AuthContext จะจัดการ
// ไม่ต้องใช้ useState(user) หรือ useEffect(onAuthStateChanged) ที่นี่แล้ว
import { useAuth } from "../Components/useAuth"; // <--- นำเข้า useAuth

import { FcGoogle } from "react-icons/fc";

function AuthFirebase() {
  const { loginWithFirebase, logout, isAuthenticated, user } = useAuth(); // ดึงฟังก์ชันและสถานะจาก AuthContext

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user; // ได้ข้อมูลผู้ใช้จาก Firebase Auth

      alert("ล็อกอินด้วย Google สำเร็จ!");

      // <--- สำคัญ: เรียกใช้ฟังก์ชันใน AuthContext เพื่อจัดการผู้ใช้ Firebase
      // AuthContext จะเป็นผู้ตรวจสอบบทบาทและนำทาง
      await loginWithFirebase(firebaseUser);
    } catch (error) {
      alert(`ล็อกอินด้วย Google ไม่สำเร็จ: ${error.message}`);
      console.error("Firebase Google Sign-In Error:", error);
    }
  };

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
          <button className="login-google"
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
