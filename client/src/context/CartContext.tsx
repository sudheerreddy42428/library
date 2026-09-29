import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Book {
  id: number;
  title: string;
  author?: { name: string };
  availableCopies: number;
  coverImage?: string;
  isbn?: string;
  category?: { name: string };
}

interface CartContextType {
  cartItems: Book[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: number) => void;
  clearCart: () => void;
  isInCart: (bookId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Book[]>(() => {
    const saved = localStorage.getItem('lms_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lms_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (book: Book) => {
    setCartItems(prev => {
      if (prev.find(item => item.id === book.id)) return prev;
      return [...prev, book];
    });
  };

  const removeFromCart = (bookId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (bookId: number) => {
    return cartItems.some(item => item.id === bookId);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
