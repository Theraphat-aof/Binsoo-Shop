// src/Context/CartProvider.jsx

import React, { useState, useEffect, useCallback } from 'react';
import productService from '../Components/productService';
import { useAuth } from '../Components/useAuth';
import { CartContext } from "../Components/cart-context-object"

// Provider Component (now the sole export of this file, besides default)
export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (isAuthenticated && user?.role === 'user') {
      try {
        const cartData = await productService.getCart();
        const count = cartData.cart?.total_items ||
                      (cartData.cart?.items ? cartData.cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0);
        setCartItemCount(count);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
        setCartItemCount(0);
      }
    } else {
      setCartItemCount(0);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const value = {
    cartItemCount,
    fetchCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};