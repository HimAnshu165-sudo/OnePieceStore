'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, size?: 'S' | 'M' | 'L' | 'XL' | 'XXL', color?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  isFreeShipping: boolean;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getCartStorageKey = (userId?: string | null) => {
  return userId ? `gl_streetwear_cart_${userId}` : 'gl_streetwear_cart_guest';
};

const getPromoStorageKey = (userId?: string | null) => {
  return userId ? `gl_promo_code_${userId}` : 'gl_promo_code_guest';
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded: isAuthLoaded } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Track previous authenticated user ID to detect login, logout, or user switch
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Synchronize cart state whenever user authentication changes or on mount
  useEffect(() => {
    if (!isAuthLoaded) return;

    const currentUserId = user?.id || null;

    // Initial load on component mount
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = currentUserId;
      try {
        const cartKey = getCartStorageKey(currentUserId);
        let savedCart = localStorage.getItem(cartKey);

        // Fallback for guest if legacy cart exists
        if (!savedCart && !currentUserId) {
          savedCart = localStorage.getItem('gl_streetwear_cart');
        }

        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else {
          setCart([]);
        }

        const promoKey = getPromoStorageKey(currentUserId);
        const savedPromo =
          localStorage.getItem(promoKey) || (!currentUserId ? localStorage.getItem('gl_promo_code') : null);
        if (savedPromo) {
          setPromoCode(savedPromo);
          if (savedPromo.toUpperCase() === 'GRANDLINE15') setDiscountPercent(15);
          else if (savedPromo.toUpperCase() === 'SHINSEKAI') setDiscountPercent(20);
          else if (savedPromo.toUpperCase() === 'PIRATEKING') setDiscountPercent(25);
        } else {
          setPromoCode('');
          setDiscountPercent(0);
        }
      } catch (e) {
        console.error('Failed to load cart on mount:', e);
      }
      setIsLoaded(true);
      return;
    }

    // User session transition: Login, Logout, or User Switch
    if (prevUserIdRef.current !== currentUserId) {
      const prevUserId = prevUserIdRef.current;
      prevUserIdRef.current = currentUserId;

      try {
        const newCartKey = getCartStorageKey(currentUserId);
        const savedNewCart = localStorage.getItem(newCartKey);
        let nextCart: CartItem[] = savedNewCart ? JSON.parse(savedNewCart) : [];

        // If transitioning from guest to logged-in user: merge guest items into user cart
        if (prevUserId === null && currentUserId !== null) {
          const guestCartRaw =
            localStorage.getItem('gl_streetwear_cart_guest') || localStorage.getItem('gl_streetwear_cart');
          if (guestCartRaw) {
            try {
              const guestCart: CartItem[] = JSON.parse(guestCartRaw);
              if (guestCart.length > 0) {
                guestCart.forEach((gItem) => {
                  const matchIdx = nextCart.findIndex(
                    (uItem) =>
                      uItem.product.id === gItem.product.id &&
                      uItem.selectedSize === gItem.selectedSize &&
                      uItem.selectedColor === gItem.selectedColor
                  );
                  if (matchIdx > -1) {
                    nextCart[matchIdx].quantity += gItem.quantity;
                  } else {
                    nextCart.push(gItem);
                  }
                });
                localStorage.removeItem('gl_streetwear_cart_guest');
                localStorage.removeItem('gl_streetwear_cart');
              }
            } catch (e) {
              console.error('Failed to merge guest cart on login:', e);
            }
          }
        } else if (prevUserId !== null && currentUserId === null) {
          // User logged out: immediately switch to guest cart (empty or guest's prior state)
          const guestSaved = localStorage.getItem('gl_streetwear_cart_guest');
          nextCart = guestSaved ? JSON.parse(guestSaved) : [];
        }

        setCart(nextCart);
        localStorage.setItem(newCartKey, JSON.stringify(nextCart));

        // Sync promo code for session
        const promoKey = getPromoStorageKey(currentUserId);
        const savedPromo = localStorage.getItem(promoKey);
        if (savedPromo) {
          setPromoCode(savedPromo);
          if (savedPromo.toUpperCase() === 'GRANDLINE15') setDiscountPercent(15);
          else if (savedPromo.toUpperCase() === 'SHINSEKAI') setDiscountPercent(20);
          else if (savedPromo.toUpperCase() === 'PIRATEKING') setDiscountPercent(25);
        } else {
          setPromoCode('');
          setDiscountPercent(0);
        }
      } catch (e) {
        console.error('Failed to synchronize cart on auth change:', e);
      }
    }
  }, [user, isAuthLoaded]);

  // Persist cart updates reactively to current user / guest storage
  useEffect(() => {
    if (isLoaded && isAuthLoaded) {
      try {
        const cartKey = getCartStorageKey(user?.id);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        if (!user) {
          localStorage.removeItem('gl_streetwear_cart');
        }
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [cart, isLoaded, isAuthLoaded, user?.id]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL' = 'L',
    color: string = product.color,
    quantity: number = 1
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
      }
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    const promoKey = getPromoStorageKey(user?.id);
    if (formatted === 'GRANDLINE15') {
      setPromoCode(formatted);
      setDiscountPercent(15);
      localStorage.setItem(promoKey, formatted);
      return { success: true, message: '15% Grand Line Crew Discount applied!' };
    } else if (formatted === 'SHINSEKAI') {
      setPromoCode(formatted);
      setDiscountPercent(20);
      localStorage.setItem(promoKey, formatted);
      return { success: true, message: '20% Shin Sekai VIP Discount applied!' };
    } else if (formatted === 'PIRATEKING') {
      setPromoCode(formatted);
      setDiscountPercent(25);
      localStorage.setItem(promoKey, formatted);
      return { success: true, message: '25% Pirate King Special Pass applied!' };
    }
    return { success: false, message: 'Invalid code. Try "GRANDLINE15" or "SHINSEKAI"' };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
    const promoKey = getPromoStorageKey(user?.id);
    localStorage.removeItem(promoKey);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const freeShippingThreshold = 150;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        freeShippingThreshold,
        amountToFreeShipping,
        isFreeShipping,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
