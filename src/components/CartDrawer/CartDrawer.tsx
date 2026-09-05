'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { X, Trash2, Plus, Minus, ShieldCheck, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
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
  } = useCart();

  const { isAuthenticated, openAuthModal } = useAuth();
  const [inputPromo, setInputPromo] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPromo) return;
    const res = applyPromoCode(inputPromo);
    setPromoFeedback(res);
    if (res.success) {
      setInputPromo('');
    }
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      closeCart();
      openAuthModal({
        pendingAction: { type: 'CHECKOUT' }
      });
      return;
    }

    closeCart();
    onOpenCheckout();
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className={styles.backdrop} onClick={closeCart} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <ShoppingBag size={18} className={styles.bagIcon} />
            <h2 className={styles.drawerTitle}>VOYAGE BAG ({totalItems})</h2>
          </div>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close bag">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className={styles.shippingBar}>
          <div className={styles.shippingText}>
            {isFreeShipping ? (
              <span className={styles.freeShipAchieved}>
                🎉 QUALIFIED FOR FREE WORLDWIDE PRIORITY SHIPPING
              </span>
            ) : (
              <span>
                ADD <strong>${amountToFreeShipping}</strong> FOR FREE WORLDWIDE SHIPPING
              </span>
            )}
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className={styles.itemList}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <ShoppingBag size={32} />
              </div>
              <h3>YOUR VOYAGE BAG IS EMPTY</h3>
              <p>Allocate a 500 GSM limited piece before the current drop closes.</p>
              <button
                className={styles.shopNowBtn}
                onClick={closeCart}
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className={styles.cartItem}
              >
                <div className={styles.itemImgWrapper}>
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="100px"
                    className={styles.itemImg}
                  />
                </div>

                <div className={styles.itemInfo}>
                  <div className={styles.itemHeaderRow}>
                    <h4 className={styles.itemName}>{item.product.name}</h4>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className={styles.itemMetaRow}>
                    <span className={styles.itemSizeBadge}>SIZE: {item.selectedSize}</span>
                    <span className={styles.itemGsmBadge}>{item.product.gsm} GSM</span>
                  </div>

                  <div className={styles.itemBottomRow}>
                    {/* Quantity Stepper */}
                    <div className={styles.stepper}>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className={styles.stepBtn}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.qtyText}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className={styles.stepBtn}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className={styles.itemPrice}>
                      ${item.product.price * item.quantity} USD
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Promo Code & Checkout */}
        {cart.length > 0 && (
          <div className={styles.drawerFooter}>
            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} className={styles.promoForm}>
              <div className={styles.promoInputWrapper}>
                <Tag size={14} className={styles.tagIcon} />
                <input
                  type="text"
                  placeholder="PROMO CODE (e.g. GRANDLINE15)"
                  value={inputPromo}
                  onChange={(e) => setInputPromo(e.target.value)}
                  className={styles.promoInput}
                />
              </div>
              <button type="submit" className={styles.applyBtn}>
                APPLY
              </button>
            </form>

            {promoFeedback && (
              <div className={`${styles.feedback} ${promoFeedback.success ? styles.feedbackSuccess : styles.feedbackError}`}>
                {promoFeedback.message}
              </div>
            )}

            {promoCode && (
              <div className={styles.activePromoTag}>
                <span>CODE APPLIED: {promoCode}</span>
                <button onClick={removePromoCode} className={styles.removePromoBtn}>
                  REMOVE
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>SUBTOTAL</span>
                <strong>${subtotal} USD</strong>
              </div>
              {discount > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>CREW DISCOUNT</span>
                  <strong>-${discount} USD</strong>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>WORLDWIDE SHIPPING</span>
                <strong className={isFreeShipping ? styles.freeText : ''}>
                  {isFreeShipping ? 'FREE' : '$18 USD'}
                </strong>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>TOTAL DUE</span>
                <strong className={styles.totalPrice}>
                  ${total + (isFreeShipping ? 0 : 18)} USD
                </strong>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              className={styles.checkoutBtn}
              onClick={handleCheckoutClick}
            >
              <span>PROCEED TO VOYAGE CHECKOUT</span>
              <ArrowRight size={16} />
            </button>

            <div className={styles.secureNotice}>
              <ShieldCheck size={14} />
              <span>256-BIT ENCRYPTED DISPATCH CHECKOUT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
