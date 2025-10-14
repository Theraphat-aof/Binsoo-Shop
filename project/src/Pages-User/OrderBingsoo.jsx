// src/pages/OrderBingsoo.jsx
import React, { useState, useEffect } from "react";
import productService from "../Components/productService";
import { useAuth } from "../Components/useAuth";
import { useCart } from "../Components/useCart";
import "../Styles/OrderBingsoo.css";

import { FaPlusCircle   } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderBingsoo = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user && user.role === "admin";
  const { fetchCartCount } = useCart();

  const [flavors, setFlavors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedFlavorForOrder, setSelectedFlavorForOrder] = useState(null);

  const [modalSelectedSize, setModalSelectedSize] = useState(null);
  const [modalSelectedToppings, setModalSelectedToppings] = useState([]); 
  const [modalBingsooQuantity, setModalBingsooQuantity] = useState(1);
  const [modalCurrentPrice, setModalCurrentPrice] = useState(0); 
  const [modalAddToCartMessage, setModalAddToCartMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flavorsRes, sizesRes, toppingsRes] = await Promise.all([
          productService.getFlavors(),
          productService.getSizes(),
          productService.getToppings(),
        ]);

        const flavorsData = flavorsRes.flavors;
        const sizesData = sizesRes.sizes;
        const toppingsData = toppingsRes.toppings;

        if (Array.isArray(flavorsData)) {
          setFlavors(flavorsData);
        } else {
          console.error("Flavors data received is not an array:", flavorsData);
          setError("Invalid flavors data received from server.");
        }

        if (Array.isArray(sizesData)) {
          setSizes(sizesData);
          if (sizesData.length > 0) setModalSelectedSize(sizesData[0]);
        } else {
          console.error("Sizes data received is not an array:", sizesData);
          setError((prev) =>
            prev
              ? prev + " Invalid sizes data."
              : "Invalid sizes data received from server."
          );
        }

        if (Array.isArray(toppingsData)) {
          setToppings(toppingsData);
        } else {
          console.error(
            "Toppings data received is not an array:",
            toppingsData
          );
          setError((prev) =>
            prev
              ? prev + " Invalid toppings data."
              : "Invalid toppings data received from server."
          );
        }

        setLoading(false);
      } catch (err) {
        setError(
          "Failed to fetch product data: " +
            (err.response?.data?.message || err.message || "Unknown error")
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let price = 0;
    if (modalSelectedSize) {
      price += parseFloat(modalSelectedSize.base_price);
    }
    modalSelectedToppings.forEach((st) => {
      const topping = toppings.find((t) => t.id === st.id);
      if (topping && topping.stock_quantity > 0) {
        price += parseFloat(topping.price) * st.quantity;
      }
    });
    setModalCurrentPrice(price * modalBingsooQuantity);
  }, [
    modalSelectedSize,
    modalSelectedToppings,
    modalBingsooQuantity,
    toppings,
  ]);

  const handleOrderClick = (flavor) => {
    setSelectedFlavorForOrder(flavor);
    setModalSelectedSize(sizes[0] || null);
    setModalSelectedToppings([]);
    setModalBingsooQuantity(1);
    setModalCurrentPrice(0);
    setModalAddToCartMessage("");
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setSelectedFlavorForOrder(null);
  };

  const handleModalSizeChange = (size) => {
    setModalSelectedSize(size);
  };

  const handleModalToppingToggle = (topping) => {
    if (topping.stock_quantity <= 0) {
      return;
    }

    const existingTopping = modalSelectedToppings.find(
      (st) => st.id === topping.id
    );
    if (existingTopping) {
      setModalSelectedToppings(
        modalSelectedToppings.filter((st) => st.id !== topping.id)
      );
    } else {
      setModalSelectedToppings([
        ...modalSelectedToppings,
        { id: topping.id, quantity: 1 },
      ]);
    }
  };

  const handleAddToCart = async () => {
    setModalAddToCartMessage("");
    if (!isAuthenticated) {
      setModalAddToCartMessage("Please log in to add items to your cart.");
      return;
    }
    if (
      !selectedFlavorForOrder ||
      !modalSelectedSize ||
      modalBingsooQuantity <= 0
    ) {
      setModalAddToCartMessage(
        "Please select a flavor, size, and valid quantity."
      );
      return;
    }

    const itemToAdd = {
      flavorId: selectedFlavorForOrder.id,
      sizeId: modalSelectedSize.id,
      quantity: modalBingsooQuantity,
      selectedToppings: modalSelectedToppings.filter((st) => {
        const topping = toppings.find((t) => t.id === st.id);
        return topping && topping.stock_quantity > 0;
      }),
    };

    try {
      await productService.addToCart(itemToAdd);
      setModalAddToCartMessage("");
      fetchCartCount();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setModalAddToCartMessage(`Failed to add to cart: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading bingsoo menu...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="order-bingsoo-container">
      <div className="flavor-grid">
        {flavors.map((flavor) => (
          <div
            key={flavor.id}
            className="flavor-card"
            onClick={() => handleOrderClick(flavor)}
          >
            {flavor.image_url ? (
              <img
                src={`${API_BASE_URL}${flavor.image_url}`}
                alt={flavor.name}
                className="flavor-image"
              />
            ) : (
              <img
                src="https://via.placeholder.com/200"
                alt="No Image"
                className="flavor-image"
              />
            )}
            <div className="order-details">
              <p>{flavor.name}</p>
            </div>

            <div className="flavor-actions">
              <button
                onClick={() => handleOrderClick(flavor)}
                className="order-button"
              >
                <FaPlusCircle  />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedFlavorForOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              &times;
            </button>
            <h2>{selectedFlavorForOrder.name}</h2>

            {/* ส่วนเลือกขนาด */}
            <h3>ขนาด</h3>
            <div className="options-group">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleModalSizeChange(size)}
                  className={`option-button ${
                    modalSelectedSize?.id === size.id ? "selected-size" : ""
                  }`}
                >
                  {size.name} {parseFloat(size.base_price).toFixed(2)} บาท
                </button>
              ))}
            </div>

            {/* ส่วนเลือกท็อปปิ้ง */}
            <h3>ท็อปปิ้ง</h3>
            <div className="toppings-grid-modal">
              {toppings
                .filter((t) => t.is_available)
                .map((topping) => {
                  const isToppingSelected = modalSelectedToppings.some(
                    (st) => st.id === topping.id
                  );
                  const isOutOfStock = topping.stock_quantity <= 0;

                  return (
                    <div
                      key={topping.id}
                      className={`topping-card ${
                        isToppingSelected ? "selected-topping" : ""
                      } ${isOutOfStock ? "out-of-stock" : ""}`}
                    >
                      {/* Checkbox for selection */}
                      <div className="topping-selection-area">
                        <input
                          type="checkbox"
                          id={`topping-${topping.id}`}
                          name="selectedTopping"
                          checked={isToppingSelected}
                          onChange={() => handleModalToppingToggle(topping)}
                          disabled={isOutOfStock} 
                        />
                        <label htmlFor={`topping-${topping.id}`}>
                          <h4>{topping.name}</h4>
                        </label>
                      </div>

                      <p>{parseFloat(topping.price).toFixed(2)} บาท</p>

                      {/* แสดงสถานะ "หมดสต็อก" ถ้าไม่มีสินค้า */}
                      {isOutOfStock && (
                        <p className="out-of-stock-text">หมดสต็อก</p>
                      )}
                      {/* Removed quantity controls as requested */}
                    </div>
                  );
                })}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={
                !selectedFlavorForOrder ||
                !modalSelectedSize ||
                modalBingsooQuantity <= 0 ||
                !isAuthenticated
              }
              className="add-to-cart-button"
            >
              เพิ่มไปยังตะกร้า
            </button>
            {modalAddToCartMessage && (
              <p
                className={`add-to-cart-message ${
                  modalAddToCartMessage.includes("successfully")
                    ? "success"
                    : "error"
                }`}
              >
                {modalAddToCartMessage}
              </p>
            )}
            {!isAuthenticated && (
              <p className="login-prompt-message">
                *โปรด Login เพื่อเพิ่มสินค้าลงในตะกร้า
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBingsoo;
