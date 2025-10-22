// src/context/AuthProvider.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../Components/authService";
import { AuthContext } from "./AuthContext";

import { auth } from "../Components/Firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const setAuthStatus = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthError(null);
    if (token) {
      localStorage.setItem("token", token);
    }
    if (!token && localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }
  };

  const clearAuthStatus = useCallback((message = null) => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    setAuthError(message);
  }, []);

  const navigateBasedOnRole = useCallback(
    (role) => {
      const currentPath = location.pathname;
      const publicRoutes = ["/", "/register", "/login"];

      if (role === "admin") {
        if (!currentPath.startsWith("/admin")) {
          navigate("/admin");
        }
      } else if (role === "user") {
        if (publicRoutes.includes(currentPath)) {
          navigate("/order-bingsoo");
        }
      } else {
        if (publicRoutes.includes(currentPath)) {
          navigate("/");
        }
      }
    },
    [navigate, location.pathname]
  );

  const handleApiError = useCallback(
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        const backendMessage = error.response.data?.message;
        const isLoginCredentialError =
          backendMessage === "Invalid credentials" ||
          backendMessage ===
            "Invalid credentials or user registered via Firebase.";

        if (isLoginCredentialError) {
          return false;
        } else {
          clearAuthStatus("Session ของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง");
          if (location.pathname !== "/") {
            navigate("/", {
              state: {
                message: "Session ของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง",
              },
            });
          }
          return true;
        }
      }
      return false;
    },
    [clearAuthStatus, navigate, location.pathname]
  );

  useEffect(() => {
    authService.setErrorHandler(handleApiError);

    const checkAuthStatus = async () => {
      setLoading(true);

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const data = await authService.loginWithFirebase({
              idToken: idToken,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
            setAuthStatus(data.user, data.token);
            navigateBasedOnRole(data.user?.role);
          } catch (error) {
            console.error(
              "AuthProvider: Error processing Firebase user or fetching role from backend:",
              error
            );
            if (
              !error.response ||
              (error.response.status !== 401 && error.response.status !== 403)
            ) {
              firebaseSignOut(auth);
              clearAuthStatus(
                "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง"
              );
              const publicRoutes = ["/", "/register", "/login"];
              if (!publicRoutes.includes(location.pathname)) {
                navigate("/");
              }
            }
          } finally {
            setLoading(false);
          }
        } else {
          const storedToken = authService.getToken();

          if (storedToken) {
            try {
              const response = await authService.verifyToken();
              setAuthStatus(response.user, storedToken);
              navigateBasedOnRole(response.user?.role);
            } catch (error) {
              console.error(
                "AuthProvider: Local token verification failed:",
                error
              );
              if (
                !error.response ||
                (error.response.status !== 401 && error.response.status !== 403)
              ) {
                clearAuthStatus(
                  "Session ของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง"
                );
                const publicRoutes = ["/", "/register", "/login"];
                if (!publicRoutes.includes(location.pathname)) {
                  navigate("/");
                }
              }
            } finally {
              setLoading(false);
            }
          } else {
            clearAuthStatus();
            const publicRoutes = ["/", "/register", "/login"];
            if (!publicRoutes.includes(location.pathname)) {
              navigate("/");
            }
            setLoading(false);
          }
        }
      });
      return () => {
        unsubscribe();
        authService.setErrorHandler(null);
      };
    };

    checkAuthStatus();
  }, [
    clearAuthStatus,
    navigateBasedOnRole,
    handleApiError,
    navigate,
    location.pathname,
  ]);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authService.login(username, password);
      setAuthStatus(data.user, data.token);
      navigateBasedOnRole(data.user?.role);
      return data;
    } catch (error) {
      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

      if (error && typeof error === "string") {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = error.message;
      } else if (error && error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      if (
        errorMessage ===
          "Invalid credentials or user registered via Firebase." ||
        errorMessage === "Invalid credentials."
      ) {
        errorMessage = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      } else if (
        error &&
        (error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found")
      ) {
        errorMessage = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      }

      setAuthError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithFirebase = async (firebaseUser) => {
    setLoading(true);
    setAuthError(null);
    try {
      const idToken = await firebaseUser.getIdToken();
      const data = await authService.loginWithFirebase({
        idToken: idToken,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
      setAuthStatus(data.user, data.token);
      setLoading(false);
      navigateBasedOnRole(data.user?.role);
      return data;
    } catch (error) {
      console.error(error);
      if (
        !error.response ||
        (error.response.status !== 401 && error.response.status !== 403)
      ) {
        firebaseSignOut(auth);
        let errorMessage =
          "เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Firebase กรุณาลองอีกครั้ง";
        if (error && typeof error === "string") {
          errorMessage = error;
        } else if (error && error.message) {
          errorMessage = error.message;
        } else if (
          error &&
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }
        setAuthError(errorMessage);
      }
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      authService.logout();
      clearAuthStatus();
      navigate("/");
    } catch (error) {
      console.error("AuthProvider: Error during logout:", error);
      let errorMessage = "เกิดข้อผิดพลาดในการออกจากระบบ";
      if (error && typeof error === "string") {
        errorMessage = error;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      setAuthError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !authError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2em",
        }}
      >
        โปรดรอสักครู่...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        loginWithFirebase,
        logout,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
