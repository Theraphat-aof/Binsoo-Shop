// src/App.js

import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Register from "./Pages-User/Register";
import Login from "./Pages-User/Login";
import { useAuth } from "./Components/useAuth";
import ProtectedRoute from "./Components/ProtectedRoute";

import { useCart } from "./Components/useCart"; // Corrected path based on previous conversation

import UserProfile from "./Pages-User/UserProfile";
import OrderBingsoo from "./Pages-User/OrderBingsoo";
import CartPage from "./Pages-User/Cart";
import CheckoutPage from "./Pages-User/Checkout";
import MyOrdersPage from "./Pages-User/MyOrders";
import OrderConfirmationPage from "./Pages-User/OrderConfirmation";

import AdminDashboard from "./Pages-Admin/AdminDashboard";
import OrderListPage from "./Pages-Admin/OrderList";
import OrderDetailPage from "./Pages-Admin/OrderDetail";
import AdminFlavorsPage from "./Pages-Admin/AdminFlavors";
import AdminSizesPage from "./Pages-Admin/AdminSize";
import AdminToppingsPage from "./Pages-Admin/AdminToppings";
import AdminUsersPage from "./Pages-Admin/AdminUsers";
import AdminCategoriesPage from "./Pages-Admin/AdminCategories";
import AdminTransactionsPage from "./Pages-Admin/AdminTransactions";
import AdminFinanceDashboard from "./Pages-Admin/AdminFinance";

import { FaHome, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import "./App.css";

// This component will contain all your routing and navigation logic.
// It will consume the cart context.
function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  // Use the useCart hook to get cart information and the update function
  const { cartItemCount, fetchCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    // Trigger a cart count fetch after logout to ensure it resets to 0
    fetchCartCount();
  };

  // Determine if the current path is one of the "hide nav" paths (login/register)
  const isLoginPage = location.pathname === "/";
  const isRegisterPage = location.pathname === "/register";

  // Determine if the current path is an admin path
  const isAdminPath = location.pathname.startsWith("/admin");

  // The navbar should be hidden if it's a login/register page OR if it's an admin path
  const shouldHideNavbar = isLoginPage || isRegisterPage || isAdminPath;

  const renderNavLinks = () => (
    <>
      {isAuthenticated && (
        <>
          {user?.role === "user" && (
            <>
              <Link
                to="/order-bingsoo"
                className={`order-bingsoo-link ${
                  activeLink === "/order-bingsoo" ? "active-nav-link" : ""
                }`}
              >
                <FaHome size={30} />
              </Link>
              <Link
                to="/cart"
                className={`cart-link ${
                  activeLink === "/cart" ? "active-nav-link" : ""
                }`}
              >
                <FaShoppingCart size={30} />
                {cartItemCount > 0 && (
                  <span className="cart-item-count">{cartItemCount}</span>
                )}
              </Link>
              {/* Add other user-specific links here if any */}
            </>
          )}
          {user?.role === "admin" && (
            <>
              <Link
                to="/admin"
                className={activeLink === "/admin" ? "active-nav-link" : ""}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/orders"
                className={
                  activeLink.startsWith("/admin/orders")
                    ? "active-nav-link"
                    : ""
                }
              >
                จัดการคำสั่งซื้อ
              </Link>
              <Link
                to="/admin/flavors"
                className={
                  activeLink === "/admin/flavors" ? "active-nav-link" : ""
                }
              >
                Flavors
              </Link>
              <Link
                to="/admin/sizes"
                className={
                  activeLink === "/admin/sizes" ? "active-nav-link" : ""
                }
              >
                Sizes
              </Link>
              <Link
                to="/admin/toppings"
                className={
                  activeLink === "/admin/toppings" ? "active-nav-link" : ""
                }
              >
                Toppings
              </Link>
              <Link
                to="/admin/edituser"
                className={
                  activeLink === "/admin/edituser" ? "active-nav-link" : ""
                }
              >
                Edit User
              </Link>
              <Link
                to="/admin/finance/transactions"
                className={
                  activeLink === "/admin/finance/transactions"
                    ? "active-nav-link"
                    : ""
                }
              >
                Transactions
              </Link>
              <Link
                to="/admin/finance/categories"
                className={
                  activeLink === "/admin/finance/categories"
                    ? "active-nav-link"
                    : ""
                }
              >
                Categories
              </Link>
              <Link
                to="/admin/finance"
                className={
                  activeLink === "/admin/finance" ? "active-nav-link" : ""
                }
              >
                Finance
              </Link>
            </>
          )}
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt size={30} />
          </button>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Conditionally render the navbar */}
      {!shouldHideNavbar && (
        <nav className="navbar">
          <div className="navbar-brand"></div>
          {/* Apply admin-specific scrolling class here, not in renderNavLinks */}
          <div
            className={`nav-links ${
              user?.role === "admin" ? "admin-scrollable" : ""
            }`}
          >
            {renderNavLinks()}
          </div>
        </nav>
      )}

      {/* Adjust content padding based on whether the navbar is present */}
      <div
        className={`content-area ${shouldHideNavbar ? "no-nav-padding" : ""}`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />

          {/* Protected Routes: Must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/order-bingsoo" element={<OrderBingsoo />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route
              path="/order-confirmation"
              element={<OrderConfirmationPage />}
            />
          </Route>

          {/* Protected Routes: Admin only */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<OrderListPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
            <Route path="/admin/flavors" element={<AdminFlavorsPage />} />
            <Route path="/admin/sizes" element={<AdminSizesPage />} />
            <Route path="/admin/toppings" element={<AdminToppingsPage />} />
            <Route path="/admin/edituser" element={<AdminUsersPage />} />
            <Route path="/admin/finance" element={<AdminFinanceDashboard />} />
            <Route
              path="/admin/finance/categories"
              element={<AdminCategoriesPage />}
            />
            <Route
              path="/admin/finance/transactions"
              element={<AdminTransactionsPage />}
            />
          </Route>

          {/* Fallback route for 404 Not Found */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h2>404 Not Found</h2>
                <p>The page you're looking for does not exist.</p>
                <Link to="/" className="back-home-link">
                  กลับหน้าหลัก
                </Link>
              </div>
            }
          />
        </Routes>
      </div>
    </>
  );
}

// The main App component that wraps everything with CartProvider
function App() {
  return <AppContent />;
}

export default App;
