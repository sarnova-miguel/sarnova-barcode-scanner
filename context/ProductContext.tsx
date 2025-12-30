"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Product type for cart items (with quantity)
interface CartProduct {
  barcode_number: string;
  product_name: string;
  title: string;
  price: number;
  image: string;
  manufacturer?: string;
  category?: string;
  quantity: number;
}

// Product type for saved items
interface SavedProduct {
  barcode_number: string;
  product_name: string;
  title: string;
  price: number;
  image: string;
  manufacturer?: string;
  category?: string;
}

interface ProductContextType {
  // Cart state & actions
  cartItems: CartProduct[];
  addToCart: (product: Omit<CartProduct, 'quantity'>) => void;
  removeFromCart: (barcode: string) => void;
  updateQuantity: (barcode: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Saved list state & actions
  savedItems: SavedProduct[];
  addToSaved: (product: SavedProduct) => void;
  removeFromSaved: (barcode: string) => void;
  isSaved: (barcode: string) => boolean;
  toggleSaved: (product: SavedProduct) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [savedItems, setSavedItems] = useState<SavedProduct[]>([]);

  // Cart functions
  const addToCart = (product: Omit<CartProduct, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.barcode_number === product.barcode_number);
      if (existing) {
        // If item exists, increment quantity
        return prev.map(item =>
          item.barcode_number === product.barcode_number
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new item with quantity 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (barcode: string) => {
    setCartItems(prev => prev.filter(item => item.barcode_number !== barcode));
  };

  const updateQuantity = (barcode: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(barcode);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.barcode_number === barcode ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Saved list functions
  const addToSaved = (product: SavedProduct) => {
    setSavedItems(prev => {
      const exists = prev.some(item => item.barcode_number === product.barcode_number);
      if (exists) return prev; // Don't add duplicates
      return [...prev, product];
    });
  };

  const removeFromSaved = (barcode: string) => {
    setSavedItems(prev => prev.filter(item => item.barcode_number !== barcode));
  };

  const isSaved = (barcode: string) => {
    return savedItems.some(item => item.barcode_number === barcode);
  };

  const toggleSaved = (product: SavedProduct) => {
    if (isSaved(product.barcode_number)) {
      removeFromSaved(product.barcode_number);
    } else {
      addToSaved(product);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        savedItems,
        addToSaved,
        removeFromSaved,
        isSaved,
        toggleSaved,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use the context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

