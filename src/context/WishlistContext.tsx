'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

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

const getWishlistStorageKey = (userId?: string | null) => {
  return userId ? `gl_streetwear_wishlist_${userId}` : 'gl_streetwear_wishlist_guest';
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded: isAuthLoaded } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Synchronize wishlist state when auth changes or on initial mount
  useEffect(() => {
    if (!isAuthLoaded) return;

    const currentUserId = user?.id || null;

    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = currentUserId;
      try {
        const key = getWishlistStorageKey(currentUserId);
        let saved = localStorage.getItem(key);
        if (!saved && !currentUserId) {
          saved = localStorage.getItem('gl_streetwear_wishlist');
        }
        if (saved) {
          setWishlist(JSON.parse(saved));
        } else {
          setWishlist([]);
        }
      } catch (e) {
        console.error('Failed to load wishlist from localStorage', e);
      }
      setIsLoaded(true);
      return;
    }

    if (prevUserIdRef.current !== currentUserId) {
      const prevUserId = prevUserIdRef.current;
      prevUserIdRef.current = currentUserId;

      try {
        const newKey = getWishlistStorageKey(currentUserId);
        const saved = localStorage.getItem(newKey);
        let nextWishlist: Product[] = saved ? JSON.parse(saved) : [];

        // If logging in from guest with guest items: merge into user's wishlist
        if (prevUserId === null && currentUserId !== null) {
          const guestRaw =
            localStorage.getItem('gl_streetwear_wishlist_guest') || localStorage.getItem('gl_streetwear_wishlist');
          if (guestRaw) {
            try {
              const guestList: Product[] = JSON.parse(guestRaw);
              if (guestList.length > 0) {
                guestList.forEach((gProd) => {
                  if (!nextWishlist.some((uProd) => uProd.id === gProd.id)) {
                    nextWishlist.push(gProd);
                  }
                });
                localStorage.removeItem('gl_streetwear_wishlist_guest');
                localStorage.removeItem('gl_streetwear_wishlist');
              }
            } catch (e) {}
          }
        } else if (prevUserId !== null && currentUserId === null) {
          // User logged out: switch to guest wishlist (or empty)
          const guestSaved = localStorage.getItem('gl_streetwear_wishlist_guest');
          nextWishlist = guestSaved ? JSON.parse(guestSaved) : [];
        }

        setWishlist(nextWishlist);
        localStorage.setItem(newKey, JSON.stringify(nextWishlist));
      } catch (e) {
        console.error('Failed to sync wishlist on auth change:', e);
      }
    }
  }, [user, isAuthLoaded]);

  // Persist wishlist whenever it changes
  useEffect(() => {
    if (isLoaded && isAuthLoaded) {
      try {
        const key = getWishlistStorageKey(user?.id);
        localStorage.setItem(key, JSON.stringify(wishlist));
        if (!user) {
          localStorage.removeItem('gl_streetwear_wishlist');
        }
      } catch (e) {
        console.error('Failed to save wishlist to localStorage', e);
      }
    }
  }, [wishlist, isLoaded, isAuthLoaded, user?.id]);

  const openWishlist = () => setIsOpen(true);
  const closeWishlist = () => setIsOpen(false);
  const toggleWishlistDrawer = () => setIsOpen((prev) => !prev);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
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
