import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Components/Firebase"; 
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";

import { useAuth } from "../Components/useAuth"; 

import { FcGoogle } from "react-icons/fc";

function AuthFirebase() {
  const { loginWithFirebase, logout, isAuthenticated, user } = useAuth(); 
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error(`ไม่สามารถเริ่มการล็อกอินด้วย Google ได้: ${error.message}`);
      console.error("Firebase Redirect Sign-In Error:", error);
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          const firebaseUser = result.user;
          // ดึง ID Token เพื่อส่งไปตรวจสอบที่ Backend
          const idToken = await firebaseUser.getIdToken(); 

          console.log("ล็อกอินด้วย Google สำเร็จ!");

          // ส่ง ID Token และข้อมูล User ที่จำเป็น
          await loginWithFirebase({
              idToken: idToken,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
          });
        }
      } catch (error) {
        console.error(`ล็อกอินด้วย Google ไม่สำเร็จ: ${error.message}`);
        console.error("Firebase Redirect Result Error:", error);

        logout();
      }
    };

    handleRedirectResult();
  }, [loginWithFirebase, logout, navigate]);

  const handleSignOut = async () => {
    logout(); 
    console.log("ออกจากระบบสำเร็จ!");

    try {
      await signOut(auth); 
    } catch (error) {
      console.error("Firebase Sign Out Error:", error);
    }
  };

  return (
    <div>
      {isAuthenticated && user ? ( 
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
