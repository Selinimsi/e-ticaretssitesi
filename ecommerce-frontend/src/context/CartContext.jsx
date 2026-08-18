import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const { user } = useAuth();
  const debounceRef = useRef(null);

  // Fetch saved cart on login
  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:4000/api/marketing/user-cart?userId=${user.id}`)
        .then(res => {
          if (res.data.success && res.data.data && res.data.data.items) {
            setCartItems(res.data.data.items);
          }
        })
        .catch(err => console.error("Saved cart fetch error:", err))
        .finally(() => setInitialLoadDone(true));
    } else {
      setInitialLoadDone(true);
      setCartItems([]);
    }
  }, [user]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, amount) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Abandoned Cart Tracker (Sync)
  useEffect(() => {
    if (user && initialLoadDone) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        axios.post('http://localhost:4000/api/marketing/abandoned-carts', {
          userId: user.id,
          items: cartItems.map(item => ({
            id: item.id,
            productId: item.id, // For backward compatibility
            nameTr: item.nameTr,
            nameEn: item.nameEn,
            price: item.price,
            quantity: item.quantity,
            sellerId: item.sellerId,
            imageUrl: item.imageUrl
          })),
          totalAmount: total
        }).catch(err => console.error("Abandoned cart tracking error:", err));
      }, 1000); // Send 1 second after last cart change to sync faster
    }
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }
  }, [cartItems, user, total, initialLoadDone]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
