import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../Components/useAuth"; 
import "../Styles/AdminMenu.css"

import { FaSignOutAlt, FaUser  } from 'react-icons/fa';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const activeLink = location.pathname;

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  const menuItems = [
    {
      to: "/admin/orders",
      label: "คำสั่งซื้อ",
      icon: "📋",
      isActive: activeLink.startsWith("/admin/orders")
    },
    {
      to: "/admin/flavors",
      label: "รสชาติ",
      icon: "🍦",
      isActive: activeLink === "/admin/flavors"
    },
    {
      to: "/admin/sizes",
      label: "ขนาด",
      icon: "📏",
      isActive: activeLink === "/admin/sizes"
    },
    {
      to: "/admin/toppings",
      label: "ท็อปปิ้ง",
      icon: "🍒",
      isActive: activeLink === "/admin/toppings"
    },
    // Second row
    {
      to: "/admin/edituser",
      label: "ผู้ใช้",
      icon: <FaUser />,
      isActive: activeLink === "/admin/edituser"
    },
    {
      to: "/admin/finance/transactions",
      label: "ธุรกรรม",
      icon: "💳",
      isActive: activeLink === "/admin/finance/transactions"
    },
    {
      to: "/admin/finance/categories",
      label: "หมวดหมู่",
      icon: "📊",
      isActive: activeLink === "/admin/finance/categories"
    },
    {
      to: "/admin/finance",
      label: "การเงิน",
      icon: "💰",
      isActive: activeLink === "/admin/finance"
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>ระบบการจัดการผู้ดูแล</h1>
      </div>
      
      <div className="admin-menu-container">
        <div className="admin-menu-grid">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`admin-menu-item ${item.isActive ? "active-nav-link" : ""}`}
            >
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-label">{item.label}</div>
            </Link>
          ))}
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="admin-menu-item logout-button"
          >
            <div className="menu-icon">
              <FaSignOutAlt size={30} />
            </div>
            <div className="menu-label">Logout</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;