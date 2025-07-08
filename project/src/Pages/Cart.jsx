// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import productService from '../Components/productService';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(''); // สำหรับแสดงข้อความหลังจากอัปเดต/ลบ
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCart(); // เรียก API ดึงข้อมูลตะกร้า
      setCart(data.cart); // Backend ส่งคืนมาในรูปแบบ { message: ..., cart: { ... } }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError('Failed to load cart. Please try again later.');
      // หากเกิด 401 Unauthorized อาจจะต้อง redirect ไปหน้า login
      if (err.response && err.response.status === 401) {
          setError('Please log in to view your cart.');
          // history.push('/login'); // หากมี react-router-dom history
      }
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันสำหรับการจัดการจำนวนสินค้าในตะกร้า (จะทำในขั้นตอนต่อไป) ---
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(cartItemId); // ถ้าจำนวนเป็น 0 หรือน้อยกว่า ให้ลบออก
      return;
    }
    setUpdateMessage('');
    try {
      const response = await productService.updateCartItemQuantity(cartItemId, newQuantity);
      console.log('Updated cart item:', response);
      setUpdateMessage('Cart updated successfully!');
      fetchCart(); // ดึงข้อมูลตะกร้าล่าสุดมาแสดง
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
      setUpdateMessage(`Failed to update quantity: ${err.message || 'Server error'}`);
    }
  };

  // --- ฟังก์ชันสำหรับการลบสินค้าออกจากตะกร้า (จะทำในขั้นตอนต่อไป) ---
  const handleRemoveItem = async (cartItemId) => {
    setUpdateMessage('');
    try {
      await productService.removeItemFromCart(cartItemId);
      setUpdateMessage('Item removed from cart!');
      fetchCart(); // ดึงข้อมูลตะกร้าล่าสุดมาแสดง
    } catch (err) {
      console.error("Error removing cart item:", err);
      setUpdateMessage(`Failed to remove item: ${err.message || 'Server error'}`);
    }
  };

  // --- ฟังก์ชันสำหรับล้างตะกร้าทั้งหมด (จะทำในขั้นตอนต่อไป) ---
  const handleClearCart = async () => {
    setUpdateMessage('');
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await productService.clearCart();
        setUpdateMessage('Cart cleared!');
        setCart(null); // ล้างตะกร้าใน state
        fetchCart(); // ดึงข้อมูลตะกร้าล่าสุด (ซึ่งน่าจะเป็นตะกร้าว่าง)
      } catch (err) {
        console.error("Error clearing cart:", err);
        setUpdateMessage(`Failed to clear cart: ${err.message || 'Server error'}`);
      }
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading cart...</div>;
  }

  if (error) {
    return <div style={styles.container}><p style={styles.errorText}>Error: {error}</p></div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Your Cart</h2>
        <p>Your cart is empty.</p>
        <p style={styles.messageText}>{updateMessage}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Cart</h2>
      {updateMessage && <p style={styles.messageText}>{updateMessage}</p>}
      <div style={styles.cartItemsContainer}>
        {cart.items.map((item) => (
          <div key={item.cart_item_id} style={styles.cartItem}>
            <div style={styles.itemDetails}>
              {/* ตรวจสอบว่ามี image_url หรือไม่ก่อนแสดง */}
              {item.image_url && <img src={`${import.meta.env.VITE_API_BASE_URL}${item.image_url}`} alt={item.product_name || item.flavor_name} style={styles.itemImage} />}
              <div>
                {/* แสดงชื่อรสชาติและขนาดของบิงซู */}
                <h3 style={styles.itemName}>{item.flavor_name} ({item.size_name})</h3>
                {/* แสดงท็อปปิ้ง (ถ้ามี) */}
                {item.toppings && item.toppings.length > 0 && (
                  <p style={styles.itemToppings}>
                    Toppings: {item.toppings.map(t => `${t.topping_name} (x${t.topping_quantity})`).join(', ')}
                  </p>
                )}
                <p style={styles.itemPrice}>Price: ฿{item.total_item_price ? item.total_item_price.toFixed(2) : 'N/A'}</p>
              </div>
            </div>
            <div style={styles.itemControls}>
              <button
                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
                style={styles.quantityButton}
              >
                -
              </button>
              <span style={styles.itemQuantity}>{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
                style={styles.quantityButton}
              >
                +
              </button>
              <button
                onClick={() => handleRemoveItem(item.cart_item_id)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.cartSummary}>
        <h3 style={styles.subtotalText}>Subtotal: ฿{cart.subtotal ? cart.subtotal.toFixed(2) : '0.00'}</h3>
        <button onClick={handleClearCart} style={styles.clearCartButton}>Clear Cart</button>
                <button onClick={() => navigate('/checkout')} style={styles.checkoutButton}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '20px auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  messageText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: '15px',
  },
  cartItemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  itemDetails: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '5px',
    marginRight: '15px',
  },
  itemName: {
    margin: '0 0 5px 0',
    color: '#555',
  },
  itemToppings: {
    fontSize: '0.9em',
    color: '#777',
    marginBottom: '5px',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#444',
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quantityButton: {
    padding: '5px 10px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    cursor: 'pointer',
    backgroundColor: '#eee',
  },
  itemQuantity: {
    padding: '0 10px',
    minWidth: '20px',
    textAlign: 'center',
  },
  removeButton: {
    padding: '8px 12px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '15px',
  },
  cartSummary: {
    marginTop: '30px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
    textAlign: 'right',
  },
  subtotalText: {
    fontSize: '1.5em',
    color: '#333',
    marginBottom: '20px',
  },
  clearCartButton: {
    padding: '10px 20px',
    backgroundColor: '#f0ad4e',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  checkoutButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CartPage;