import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import { useAuth } from "./Components/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

import Dashboard from "./Pages/Dashboard";
import UserProfile from "./Pages/UserProfile";
import OrderHistory from "./Pages/OrderHistory";
import AdminDashboard from "./Pages/AdminDashboard";
import OrderBingsoo from "./Pages/OrderBingsoo";
import CartPage from "./Pages/Cart";
import CheckoutPage from "./Pages/Checkout";

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate(); // Now this will work correctly

  const handleLogout = () => {
    logout(); // Call logout function from Context
    navigate("/login"); // Redirect to Login page
  };

  return (
    // *** สำคัญ: ต้องไม่มี <Router> หรือ <BrowserRouter> ตรงนี้อีกแล้ว ***
    // ใช้ React Fragment (<>...</>) แทน
    <>
      <nav
        style={{
          padding: "10px",
          background: "#f0f0f0",
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <Link to="/order-bingsoo">หน้าแรก</Link>
        {!isAuthenticated ? ( // If not logged in
          <>
            <Link to="/login">เข้าสู่ระบบ</Link>
            <Link to="/register">ลงทะเบียน</Link>
          </>
        ) : (
          // If logged in
          <>
            <span>สวัสดี, {user?.username}</span>{" "}
            {/* Display username and Role */}
            {/* In the future, there will be links for other pages such as shopping cart, profile, admin */}
            <Link to="/cart">Cart</Link>
            <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
              ออกจากระบบ
            </button>
          </>
        )}
      </nav>

      <div style={{ padding: "20px" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes: ต้อง Login ก่อนถึงเข้าถึงได้ */}
          <Route element={<ProtectedRoute />}>
            <Route path="/order-bingsoo" element={<OrderBingsoo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-orders" element={<OrderHistory />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            {/* เพิ่ม route สำหรับหน้าสั่งบิงซูตรงนี้ */}
          </Route>

          {/* Protected Routes: ต้องเป็น Admin เท่านั้นถึงเข้าถึงได้ */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Route อื่นๆ สำหรับ Admin เช่น /admin/products, /admin/orders */}
          </Route>

          {/* Route Fallback สำหรับหน้าไม่พบ */}
          <Route
            path="*"
            element={
              <div>
                <h2>404 Not Found</h2>
                <p>The page you're looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
