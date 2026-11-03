import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("raihana_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("raihana_cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to persist cart to localStorage:", err);
    }
  }, [cart]);

  // Add item with size and quantity
  const addToCart = (product, size = "", quantity = 1) => {
    if (!product) return;

    // Calculate price for the selected size if sizePrices exists
    let itemPrice = Number(product.price) || 0;
    if (size && product.sizePrices && product.sizePrices[size]) {
      itemPrice = Number(product.sizePrices[size]);
    }

    const uniqueId = `${product.id}-${size || "standard"}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartItemId === uniqueId);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          price: itemPrice, // keep current price updated
        };
        return updated;
      }

      const newItem = {
        cartItemId: uniqueId,
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || product.image || "",
        size: size || "",
        price: itemPrice,
        quantity: Math.max(1, quantity),
        category: product.category || "unisex",
      };

      return [...prevCart, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

