import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Components/Firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
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
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      await loginWithFirebase(firebaseUser);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          const firebaseUser = result.user;

          await loginWithFirebase(firebaseUser);
        }
      } catch (error) {
        alert(`ล็อกอินด้วย Google ไม่สำเร็จ: ${error.message}`);
        console.error("Firebase Redirect Result Error:", error);

        logout();
      }
    };

    handleRedirectResult();
  }, [loginWithFirebase, logout, navigate]);

  const handleSignOut = async () => {
    logout();

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
