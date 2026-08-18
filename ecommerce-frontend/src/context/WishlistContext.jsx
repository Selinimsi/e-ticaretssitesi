import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const toggleWishlist = (product) => {
    const exists = wishlistItems.find(item => item.id === product.id);
    if (exists) {
      toast.error(`${product.name} favorilerden çıkarıldı.`);
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
    } else {
      toast.success(`${product.name} favorilere eklendi!`, { icon: '❤️' });
      setWishlistItems(prev => [...prev, product]);
    }
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
