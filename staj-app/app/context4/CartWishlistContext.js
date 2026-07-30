'use client';
import React, { createContext, useContext, useState } from 'react';

const CartWishlistContext = createContext();

export function CartWishlistProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Sepete ekleme
  const addToCart = (product) => {
    setCart((prev) => {
      // Beden ve id eşleşmesine göre kontrol
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Favorilere ekle/çıkar (Toggle)
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  return (
    <CartWishlistContext.Provider value={{ cart, wishlist, addToCart, toggleWishlist }}>
      {children}
    </CartWishlistContext.Provider>
  );
}

export const useCartWishlist = () => useContext(CartWishlistContext);