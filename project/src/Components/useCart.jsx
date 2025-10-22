// src/Hooks/useCart.jsx

import { useContext } from "react";
import { CartContext } from "../Components/cart-context-object";

export const useCart = () => {
  return useContext(CartContext);
};
