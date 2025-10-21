// src/Hooks/useCart.jsx

import { useContext } from 'react';
import { CartContext } from "../Components/cart-context-object"; // Adjust the path as necessary

export const useCart = () => {
  return useContext(CartContext);
};