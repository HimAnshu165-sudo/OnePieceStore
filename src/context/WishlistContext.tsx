'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  wishlist: Product[];
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlistDrawer: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem('gl_streetwear_wishlist');
        if (saved) {
          setWishlist(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load wishlist from localStorage', e);
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('gl_streetwear_wishlist', JSON.stringify(wishlist));
      } catch (e) {
        console.error('Failed to save wishlist to localStorage', e);
      }
    }
  }, [wishlist, isLoaded]);

  const openWishlist = () => setIsOpen(true);
  const closeWishlist = () => setIsOpen(false);
  const toggleWishlistDrawer = () => setIsOpen(prev => !prev);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isOpen,
        openWishlist,
        closeWishlist,
        toggleWishlistDrawer,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
