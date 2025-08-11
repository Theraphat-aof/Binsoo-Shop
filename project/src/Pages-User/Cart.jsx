// src/pages/CartPage.jsx
import React, { useState, useEffect } from "react";
import productService from "../Components/productService";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Components/useCart";
import "../Styles/Cart.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCart();
      setCart(data.cart);
      fetchCartCount();
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart. Please try again later.");
      if (err.response && err.response.status === 401) {
        setError("Please log in to view your cart.");
      }
      fetchCartCount();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(cartItemId);
      return;
    }
    setUpdateMessage("");
    try {
      const response = await productService.updateCartItemQuantity(
        cartItemId,
        newQuantity
      );
      console.log("Updated cart item:", response);
      setUpdateMessage("");
      fetchCart();
      fetchCartCount();
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
      setUpdateMessage(
        `Failed to update quantity: ${err.message || "Server error"}`
      );
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    setUpdateMessage("");
    try {
      await productService.removeItemFromCart(cartItemId);
      setUpdateMessage("");
      fetchCart();
      fetchCartCount();
    } catch (err) {
      console.error("Error removing cart item:", err);
      setUpdateMessage(
        `Failed to remove item: ${err.message || "Server error"}`
      );
    }
  };

  const handleClearCart = async () => {
    setUpdateMessage("");
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await productService.clearCart();
        setUpdateMessage("Cart cleared!");
        setCart(null);
        fetchCartCount();
      } catch (err) {
        console.error("Error clearing cart:", err);
        setUpdateMessage(
          `Failed to clear cart: ${err.message || "Server error"}`
        );
      }
    }
  };

  if (loading) {
    return <div className="cart-container">Loading cart...</div>;
  }

  if (error) {
    return (
      <div className="cart-container">
        <p className="error-text">Error: {error}</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">ตะกร้าสินค้า</h2> {/* เพิ่มชื่อหัวข้อ */}
        <p className="cart-empty-message">ตะกร้าของคุณว่างเปล่า!</p>
        {updateMessage && <p className="message-text">{updateMessage}</p>}
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2 className="cart-title">รายการในตะกร้า</h2>
      {updateMessage && <p className="message-text">{updateMessage}</p>}
      <div className="cart-items-container">
        {cart.items.map((item) => (
          <div key={item.cart_item_id} className="cart-item">
            <div className="item-details">
              {/* ตรวจสอบว่ามี image_url หรือไม่ก่อนแสดง */}
              {item.image_url && (
                <img
                  src={`${API_BASE_URL}${item.image_url}`}
                  alt={item.product_name || item.flavor_name}
                  className="item-image"
                />
              )}
              <div>
                {/* แสดงชื่อรสชาติและขนาดของบิงซู */}
                <h3 className="item-name">
                  {item.flavor_name} ({item.size_name})
                </h3>
                {/* แสดงท็อปปิ้ง (ถ้ามี) */}
                {item.toppings && item.toppings.length > 0 && (
                  <p className="item-toppings">
                    Toppings:{" "}
                    {item.toppings
                      .map((t) => `${t.topping_name}`)
                      .join(", ")}
                  </p>
                )}
                <p className="item-price">
                  ราคา: ฿
                  {item.total_item_price
                    ? item.total_item_price.toFixed(2)
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="item-controls">
              <button
                onClick={() => handleRemoveItem(item.cart_item_id)}
                className="remove-button"
              >
                &times;
              </button>
              <div className="quantity-controls">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.cart_item_id, item.quantity - 1)
                  }
                  className="quantity-button"
                >
                  -
                </button>
                <span className="item-quantity">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.cart_item_id, item.quantity + 1)
                  }
                  className="quantity-button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3 className="subtotal-text">
          ราคารวม: ฿{cart.subtotal ? cart.subtotal.toFixed(2) : "0.00"}
        </h3>
        <div>
          {" "}
          {/*           <button onClick={handleClearCart} className="clear-cart-button">
            Clear Cart
          </button> */}
          <button
            onClick={() => navigate("/checkout")}
            className="checkout-button"
          >
            ดำเนินการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
