// src/pages/OrderBingsoo.jsx
import React, { useState, useEffect } from "react";
import productService from "../Components/productService";
import { useAuth } from "../Components/AuthContext";

const OrderBingsoo = () => {
  const { isAuthenticated } = useAuth(); // ดึงข้อมูลผู้ใช้
  const [flavors, setFlavors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State สำหรับการปรับแต่งบิงซู
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]); // [{ id, quantity }]
  const [bingsooQuantity, setBingsooQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [addToCartMessage, setAddToCartMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // รับ Response ทั้ง Object จาก Backend
        const [flavorsRes, sizesRes, toppingsRes] = await Promise.all([
          productService.getFlavors(),
          productService.getSizes(),
          productService.getToppings(),
        ]);

        // ดึงเฉพาะ Array ของข้อมูลจาก property ที่ถูกต้อง
        const flavorsData = flavorsRes.flavors; // <--- แก้ไขตรงนี้
        const sizesData = sizesRes.sizes; // <--- แก้ไขตรงนี้ (สมมติว่า backend return key 'sizes')
        const toppingsData = toppingsRes.toppings; // <--- แก้ไขตรงนี้ (สมมติว่า backend return key 'toppings')

        console.log("Fetched flavorsData:", flavorsData);
        console.log("Is flavorsData an array?", Array.isArray(flavorsData));

        // ตรวจสอบ Array.isArray ก่อนตั้งค่า เพื่อความทนทาน
        if (Array.isArray(flavorsData)) {
          setFlavors(flavorsData);
          if (flavorsData.length > 0) setSelectedFlavor(flavorsData[0]); // ตั้งค่าเริ่มต้น
        } else {
          console.error("Flavors data received is not an array:", flavorsData);
          setError("Invalid flavors data received from server.");
        }

        if (Array.isArray(sizesData)) {
          setSizes(sizesData);
          if (sizesData.length > 0) setSelectedSize(sizesData[0]); // ตั้งค่าเริ่มต้น
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
    // คำนวณราคาทุกครั้งที่ตัวเลือกเปลี่ยน
    let price = 0;
    if (selectedSize) {
      price += parseFloat(selectedSize.base_price);
    }
    selectedToppings.forEach((st) => {
      const topping = toppings.find((t) => t.id === st.id);
      if (topping) {
        price += parseFloat(topping.price) * st.quantity;
      }
    });
    setCurrentPrice(price * bingsooQuantity);
  }, [
    selectedFlavor,
    selectedSize,
    selectedToppings,
    bingsooQuantity,
    toppings,
  ]);

  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const handleToppingToggle = (topping) => {
    const existingTopping = selectedToppings.find((st) => st.id === topping.id);
    if (existingTopping) {
      // ถ้ามีอยู่แล้ว ให้ลบออก (หรือลดจำนวน ถ้าจะให้มีหลายชิ้น)
      // สำหรับตอนนี้ เราจะลบออก ถ้ามีอยู่แล้ว (คือเลือก 1 ชิ้นต่อ 1 ประเภท)
      // หากต้องการให้เพิ่มจำนวนได้ ให้ปรับ logic ตรงนี้
      setSelectedToppings(
        selectedToppings.filter((st) => st.id !== topping.id)
      );
    } else {
      // เพิ่มท็อปปิ้งใหม่ โดยมี quantity เป็น 1
      setSelectedToppings([
        ...selectedToppings,
        { id: topping.id, quantity: 1 },
      ]);
    }
  };

  // ฟังก์ชันสำหรับเพิ่ม/ลดจำนวนท็อปปิ้ง (หากต้องการให้มีหลายชิ้นต่อประเภท)
  const handleToppingQuantityChange = (toppingId, delta) => {
    setSelectedToppings((prevToppings) => {
      const updatedToppings = prevToppings
        .map((st) => {
          if (st.id === toppingId) {
            const newQuantity = st.quantity + delta;
            if (newQuantity <= 0) return null; // ลบออกถ้า quantity เป็น 0 หรือน้อยกว่า
            return { ...st, quantity: newQuantity };
          }
          return st;
        })
        .filter(Boolean); // กรอง null ออก
      return updatedToppings;
    });
  };

  const handleAddToCart = async () => {
    setAddToCartMessage("");
    if (!isAuthenticated) {
      setAddToCartMessage("Please log in to add items to your cart.");
      return;
    }
    if (!selectedFlavor || !selectedSize || bingsooQuantity <= 0) {
      setAddToCartMessage("Please select a flavor, size, and valid quantity.");
      return;
    }

    const itemToAdd = {
      flavorId: selectedFlavor.id,
      sizeId: selectedSize.id,
      quantity: bingsooQuantity,
      selectedToppings: selectedToppings,
    };

    try {
      await productService.addToCart(itemToAdd);
      setAddToCartMessage("Item added to cart successfully!");
      // รีเซ็ตการเลือก (ถ้าต้องการ)
      // setSelectedFlavor(flavors[0] || null);
      // setSelectedSize(sizes[0] || null);
      // setSelectedToppings([]);
      // setBingsooQuantity(1);
    } catch (err) {
      setAddToCartMessage(`Failed to add to cart: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Loading bingsoo menu...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>สั่งบิงซูของคุณ</h1>

      <div style={{ marginBottom: "30px" }}>
        <h3>เลือกรสชาติบิงซู:</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {flavors.map((flavor) => (
            <button
              key={flavor.id}
              onClick={() => handleFlavorChange(flavor)}
              style={{
                padding: "10px 15px",
                border:
                  selectedFlavor?.id === flavor.id
                    ? "2px solid blue"
                    : "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor:
                  selectedFlavor?.id === flavor.id ? "#e0e0ff" : "white",
              }}
            >
              {flavor.name}
            </button>
          ))}
        </div>
        {selectedFlavor && (
          <p>
            รสชาติที่เลือก: <strong>{selectedFlavor.name}</strong>
          </p>
        )}
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>เลือกขนาด:</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => handleSizeChange(size)}
              style={{
                padding: "10px 15px",
                border:
                  selectedSize?.id === size.id
                    ? "2px solid blue"
                    : "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor:
                  selectedSize?.id === size.id ? "#e0e0ff" : "white",
              }}
            >
              {size.name} ({parseFloat(size.base_price).toFixed(2)} บาท)
            </button>
          ))}
        </div>
        {selectedSize && (
          <p>
            ขนาดที่เลือก: <strong>{selectedSize.name}</strong>
          </p>
        )}
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h3>เลือกท็อปปิ้ง:</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "15px",
          }}
        >
          {toppings
            .filter((t) => t.is_available && t.stock_quantity > 0)
            .map((topping) => (
              <div
                key={topping.id}
                style={{
                  border: selectedToppings.some((st) => st.id === topping.id)
                    ? "2px solid green"
                    : "1px solid #eee",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: selectedToppings.some(
                    (st) => st.id === topping.id
                  )
                    ? "#e6ffe6"
                    : "white",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={topping.image_url || "https://via.placeholder.com/60"}
                  alt={topping.name}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    marginBottom: "5px",
                  }}
                />
                <h4>{topping.name}</h4>
                <p>{parseFloat(topping.price).toFixed(2)} บาท</p>
                <p style={{ fontSize: "0.8em", color: "#666" }}>
                  ({topping.stock_quantity} in stock)
                </p>

                {selectedToppings.some((st) => st.id === topping.id) ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleToppingQuantityChange(topping.id, -1)
                      }
                      style={{ padding: "5px", minWidth: "30px" }}
                    >
                      -
                    </button>
                    <span>
                      {selectedToppings.find((st) => st.id === topping.id)
                        ?.quantity || 0}
                    </span>
                    <button
                      onClick={() => handleToppingQuantityChange(topping.id, 1)}
                      style={{ padding: "5px", minWidth: "30px" }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleToppingToggle(topping)}
                      style={{
                        padding: "5px",
                        marginLeft: "10px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleToppingToggle(topping)}
                    disabled={topping.stock_quantity <= 0}
                  >
                    {topping.stock_quantity > 0 ? "เพิ่มท็อปปิ้ง" : "หมดสต็อก"}
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #eee",
          paddingTop: "20px",
          marginTop: "30px",
        }}
      >
        <h3>สรุปบิงซูของคุณ:</h3>
        {selectedFlavor && selectedSize ? (
          <div>
            <p>
              <strong>รสชาติ:</strong> {selectedFlavor.name}
            </p>
            <p>
              <strong>ขนาด:</strong> {selectedSize.name}
            </p>
            <p>
              <strong>ท็อปปิ้งที่เลือก:</strong>
            </p>
            <ul>
              {selectedToppings.length > 0 ? (
                selectedToppings.map((st) => {
                  const topping = toppings.find((t) => t.id === st.id);
                  return topping ? (
                    <li key={st.id}>
                      {topping.name} ({st.quantity}x) -{" "}
                      {(parseFloat(topping.price) * st.quantity).toFixed(2)} บาท
                    </li>
                  ) : null;
                })
              ) : (
                <li>- ไม่มีท็อปปิ้ง</li>
              )}
            </ul>
            <p>
              <strong>จำนวนบิงซู:</strong>
              <button
                onClick={() =>
                  setBingsooQuantity((prev) => Math.max(1, prev - 1))
                }
                style={{ marginLeft: "10px", marginRight: "5px" }}
              >
                -
              </button>
              {bingsooQuantity}
              <button
                onClick={() => setBingsooQuantity((prev) => prev + 1)}
                style={{ marginLeft: "5px" }}
              >
                +
              </button>
            </p>
            <p style={{ fontSize: "1.2em", fontWeight: "bold" }}>
              ราคารวม: {currentPrice.toFixed(2)} บาท
            </p>
            <button
              onClick={handleAddToCart}
              disabled={
                !selectedFlavor ||
                !selectedSize ||
                bingsooQuantity <= 0 ||
                !isAuthenticated
              }
              style={{
                padding: "10px 20px",
                fontSize: "1em",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              เพิ่มลงตะกร้า
            </button>
            {addToCartMessage && (
              <p
                style={{
                  marginTop: "10px",
                  color: addToCartMessage.includes("successfully")
                    ? "green"
                    : "red",
                }}
              >
                {addToCartMessage}
              </p>
            )}
            {!isAuthenticated && (
              <p style={{ color: "orange", fontSize: "0.9em" }}>
                *โปรด Login เพื่อเพิ่มสินค้าลงในตะกร้า
              </p>
            )}
          </div>
        ) : (
          <p>กรุณาเลือกรสชาติและขนาดบิงซูเพื่อเริ่มต้น</p>
        )}
      </div>
    </div>
  );
};

export default OrderBingsoo;
