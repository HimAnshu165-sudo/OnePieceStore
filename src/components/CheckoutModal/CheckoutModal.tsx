'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addStoredOrder } from '@/lib/mockData';
import { StoreOrder } from '@/types/auth';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Lock, ArrowRight, PackageCheck, Copy } from 'lucide-react';
import styles from './CheckoutModal.module.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, subtotal, discount, total, isFreeShipping, clearCart } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [step, setStep] = useState<'DETAILS' | 'SHIPPING' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [formData, setFormData] = useState({
    name: user?.name || 'Tanjiro Kamado',
    email: user?.email || 'tanjiro@demonslayer.store',
    address: user?.address || 'Shibuya Ward, Dogenzaka 2-24-1',
    city: user?.city || 'Tokyo',
    postalCode: user?.postalCode || '150-0043',
    country: user?.country || 'Japan',
    shippingMethod: 'EXPRESS',
    cardNumber: '•••• •••• •••• 5690',
    expiry: '09/29',
    cvv: '888'
  });

  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        address: user.address || prev.address,
        city: user.city || prev.city,
        postalCode: user.postalCode || prev.postalCode,
        country: user.country || prev.country
      }));
    }
  }, [user]);

  const [orderNumber, setOrderNumber] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onClose();
      openAuthModal({ pendingAction: { type: 'CHECKOUT' } });
      return;
    }

    if (step === 'DETAILS') setStep('SHIPPING');
    else if (step === 'SHIPPING') setStep('PAYMENT');
    else if (step === 'PAYMENT') {
      const generatedOrder = `ORD-${Math.floor(100000 + Math.random() * 900000)}-DS`;
      setOrderNumber(generatedOrder);

      const shippingCost = isFreeShipping || formData.shippingMethod === 'STANDARD' ? 0 : 18;
      const orderTotal = total + (isFreeShipping ? 0 : shippingCost);

      const placedOrder: StoreOrder = {
        id: generatedOrder,
        userId: user?.id || 'guest',
        userEmail: user?.email || formData.email,
        customerName: user?.name || formData.name,
        items: cart.map(i => ({
          product: i.product,
          selectedSize: i.selectedSize,
          selectedColor: i.selectedColor,
          quantity: i.quantity
        })),
        subtotal,
        discount,
        total: orderTotal,
        orderStatus: 'Processing',
        paymentStatus: 'Paid',
        trackingNumber: `JP-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        createdAt: new Date().toISOString()
      };

      addStoredOrder(placedOrder);
      setStep('SUCCESS');
      clearCart();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B5121B', '#C7A76C', '#F4F0E8']
        });
      } catch (e) {}
    }
  };

  const copyOrder = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shippingCost = isFreeShipping || formData.shippingMethod === 'STANDARD' ? 0 : 18;
  const finalTotal = total + (isFreeShipping ? 0 : shippingCost);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.headerSuper}>SECURE EXPEDITION GATEWAY</span>
            <h2 className={styles.headerTitle}>
              {step === 'SUCCESS' ? 'ORDER DISPATCHED' : 'VOYAGE CHECKOUT'}
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close checkout">
            <X size={20} />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        {step !== 'SUCCESS' && (
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepNode} ${step === 'DETAILS' ? styles.stepActive : styles.stepDone}`}>
              <span>01 // CONTACT</span>
            </div>
            <div className={styles.stepConnector} />
            <div className={`${styles.stepNode} ${step === 'SHIPPING' ? styles.stepActive : (step === 'PAYMENT' ? styles.stepDone : '')}`}>
              <span>02 // FREIGHT</span>
            </div>
            <div className={styles.stepConnector} />
            <div className={`${styles.stepNode} ${step === 'PAYMENT' ? styles.stepActive : ''}`}>
              <span>03 // SETTLEMENT</span>
            </div>
          </div>
        )}

        <div className={styles.contentBody}>
          {step !== 'SUCCESS' ? (
            <div className={styles.splitGrid}>
              {/* Form Side */}
              <form onSubmit={handleNextStep} className={styles.formCol}>
                {step === 'DETAILS' && (
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepHeading}>1. DISPATCH DESTINATION</h3>
                    <div className={styles.inputGroup}>
                      <label>FULL NAME</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>VOYAGE EMAIL (FOR TRACKING RECEIPT)</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>STREET ADDRESS</label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label>CITY</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>POSTAL CODE</label>
                        <input
                          type="text"
                          required
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className={styles.input}
                        />
                      </div>
                    </div>
                    <button type="submit" className={styles.nextBtn}>
                      <span>PROCEED TO FREIGHT METHOD</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {step === 'SHIPPING' && (
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepHeading}>2. CHOOSE EXPEDITION SPEED</h3>
                    <div className={styles.shippingOptions}>
                      <label
                        className={`${styles.shippingCard} ${formData.shippingMethod === 'EXPRESS' ? styles.shippingSelected : ''}`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="EXPRESS"
                          checked={formData.shippingMethod === 'EXPRESS'}
                          onChange={() => setFormData({ ...formData, shippingMethod: 'EXPRESS' })}
                        />
                        <div className={styles.shippingCardInfo}>
                          <div className={styles.shippingTitleRow}>
                            <strong>RED FORCE AIR PRIORITY (3-5 DAYS)</strong>
                            <span className={styles.shippingPriceTag}>
                              {isFreeShipping ? 'FREE' : '$18 USD'}
                            </span>
                          </div>
                          <p>Direct air transit from Tokyo warehouse with numbered metal tracking seal.</p>
                        </div>
                      </label>

                      <label
                        className={`${styles.shippingCard} ${formData.shippingMethod === 'STANDARD' ? styles.shippingSelected : ''}`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="STANDARD"
                          checked={formData.shippingMethod === 'STANDARD'}
                          onChange={() => setFormData({ ...formData, shippingMethod: 'STANDARD' })}
                        />
                        <div className={styles.shippingCardInfo}>
                          <div className={styles.shippingTitleRow}>
                            <strong>GRAND LINE COURIER (7-10 DAYS)</strong>
                            <span className={styles.shippingPriceTag}>FREE</span>
                          </div>
                          <p>Standard tracked global postal maritime freight.</p>
                        </div>
                      </label>
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => setStep('DETAILS')}
                        className={styles.backBtn}
                      >
                        BACK
                      </button>
                      <button type="submit" className={styles.nextBtn}>
                        <span>CONTINUE TO SETTLEMENT</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {step === 'PAYMENT' && (
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepHeading}>3. ENCRYPTED SETTLEMENT</h3>
                    <div className={styles.paymentSelector}>
                      <div className={styles.paymentHeader}>
                        <CreditCard size={18} className={styles.paymentIcon} />
                        <span>CREDIT / DEBIT CARD</span>
                      </div>
                      <div className={styles.inputGroup}>
                        <label>CARD NUMBER</label>
                        <input
                          type="text"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                          <label>EXPIRY</label>
                          <input
                            type="text"
                            required
                            value={formData.expiry}
                            onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>CVV / CVC</label>
                          <input
                            type="text"
                            required
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            className={styles.input}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => setStep('SHIPPING')}
                        className={styles.backBtn}
                      >
                        BACK
                      </button>
                      <button type="submit" className={styles.submitOrderBtn}>
                        <Lock size={15} />
                        <span>AUTHORIZE ${finalTotal} USD & DISPATCH</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Order Manifest Summary */}
              <div className={styles.manifestCol}>
                <h4 className={styles.manifestTitle}>VOYAGE MANIFEST</h4>
                <div className={styles.manifestList}>
                  {cart.map((item, idx) => (
                    <div key={idx} className={styles.manifestItem}>
                      <div className={styles.manifestInfo}>
                        <strong>{item.product.name}</strong>
                        <span>SIZE: {item.selectedSize} • QTY: {item.quantity}</span>
                      </div>
                      <span className={styles.manifestItemPrice}>
                        ${item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.manifestSummary}>
                  <div className={styles.mRow}>
                    <span>SUBTOTAL</span>
                    <span>${subtotal} USD</span>
                  </div>
                  {discount > 0 && (
                    <div className={`${styles.mRow} ${styles.discountText}`}>
                      <span>CREW DISCOUNT</span>
                      <span>-${discount} USD</span>
                    </div>
                  )}
                  <div className={styles.mRow}>
                    <span>SHIPPING</span>
                    <span>{isFreeShipping ? 'FREE' : `$${shippingCost} USD`}</span>
                  </div>
                  <div className={`${styles.mRow} ${styles.mTotalRow}`}>
                    <strong>TOTAL DUE</strong>
                    <strong className={styles.mTotalVal}>${finalTotal} USD</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Order Placed Success State */
            <div className={styles.successView}>
              <div className={styles.successIconWrapper}>
                <CheckCircle2 size={54} className={styles.successCheck} />
              </div>

              <h3 className={styles.successHeadline}>GARMENTS ALLOCATED TO YOUR CREW</h3>
              <p className={styles.successSub}>
                Your order is officially registered in the Grand Line Supply Ledger.
                Confirmation and tracking coordinates have been transmitted to <strong>{formData.email}</strong>.
              </p>

              <div className={styles.trackingCard}>
                <span className={styles.trackingLabel}>GRAND LINE TRACKING CODE</span>
                <div className={styles.trackingCodeRow}>
                  <strong className={styles.trackingCode}>{orderNumber}</strong>
                  <button onClick={copyOrder} className={styles.copyBtn} aria-label="Copy tracking code">
                    <Copy size={14} />
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              <div className={styles.successSpecs}>
                <div>
                  <span>DESTINATION</span>
                  <strong>{formData.address}, {formData.city}</strong>
                </div>
                <div>
                  <span>DISPATCH METHOD</span>
                  <strong>{formData.shippingMethod === 'EXPRESS' ? 'Red Force Priority Flight' : 'Standard Courier'}</strong>
                </div>
                <div>
                  <span>STATUS</span>
                  <strong className={styles.allocatedText}>PACKED WITH AUTHENTICATION CARD</strong>
                </div>
              </div>

              <button className={styles.returnShopBtn} onClick={onClose}>
                CONTINUE EXPLORING ARCHIVES
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
