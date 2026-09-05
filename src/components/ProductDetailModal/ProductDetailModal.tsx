'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { X, Heart, ShieldCheck, Truck, RefreshCw, Ruler, Plus, Minus, Check, ArrowRight } from 'lucide-react';
import styles from './ProductDetailModal.module.css';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantCheckout?: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantCheckout,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [selectedColor, setSelectedColor] = useState<string>(product?.color || '');
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  if (!product) return null;

  const isSaved = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAuthModal({
        pendingAction: {
          type: 'ADD_TO_CART',
          product,
          size: selectedSize,
          color: selectedColor || product.color,
          quantity
        }
      });
      return;
    }

    addToCart(product, selectedSize, selectedColor || product.color, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Close Button */}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close inspector">
            <X size={20} />
          </button>

          <div className={styles.gridContainer}>
            {/* Left: Gallery & Zoom Display */}
            <div className={styles.galleryCol}>
              <div className={styles.mainImageStage}>
                <Image
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={styles.mainImg}
                  priority
                />
                <div className={styles.imageBadge}>
                  <span>{product.editionNumber || 'LIMITED'}</span>
                  <span>{product.gsm} GSM</span>
                </div>
              </div>

              {/* Thumbnail selector */}
              <div className={styles.thumbnails}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`${styles.thumbBtn} ${activeImageIdx === idx ? styles.activeThumb : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt="" className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Garment Specifications & Tactile Controls */}
            <div className={styles.specsCol}>
              <div className={styles.crewLine}>
                <span className={styles.crewTag}>{product.crew} ARCHIVE</span>
                <span className={styles.characterName}>// {product.character}</span>
              </div>

              <h2 className={styles.title}>{product.name}</h2>
              <div className={styles.japaneseTitle}>{product.japaneseName}</div>

              <div className={styles.priceContainer}>
                <span className={styles.price}>${product.price} USD</span>
                {product.compareAtPrice && (
                  <span className={styles.comparePrice}>${product.compareAtPrice}</span>
                )}
                <span className={styles.taxNotice}>Taxes & duties included</span>
              </div>

              <p className={styles.description}>{product.description}</p>

              {/* Garment Highlights List */}
              <div className={styles.garmentHighlights}>
                {product.details.map((detail, index) => (
                  <div key={index} className={styles.highlightItem}>
                    <span className={styles.highlightBullet} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Size Selector with Size Guide Trigger */}
              <div className={styles.sectionBlock}>
                <div className={styles.sectionHeader}>
                  <span className={styles.blockLabel}>SELECT SIZE:</span>
                  <button
                    className={styles.sizeGuideTrigger}
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                  >
                    <Ruler size={13} />
                    <span>{showSizeGuide ? 'HIDE SIZE CHART' : 'SIZE GUIDE (CM / IN)'}</span>
                  </button>
                </div>

                <div className={styles.sizeGrid}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSizeBtn : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Guide Table Overlay */}
                {showSizeGuide && (
                  <div className={styles.sizeTable}>
                    <div className={styles.sizeTableRow}>
                      <span>SIZE</span>
                      <span>CHEST (CM)</span>
                      <span>LENGTH (CM)</span>
                      <span>SHOULDER</span>
                    </div>
                    <div className={styles.sizeTableRow}>
                      <strong>S</strong>
                      <span>114</span>
                      <span>72</span>
                      <span>54</span>
                    </div>
                    <div className={styles.sizeTableRow}>
                      <strong>M</strong>
                      <span>120</span>
                      <span>74</span>
                      <span>56</span>
                    </div>
                    <div className={styles.sizeTableRow}>
                      <strong>L</strong>
                      <span>126</span>
                      <span>76</span>
                      <span>58</span>
                    </div>
                    <div className={styles.sizeTableRow}>
                      <strong>XL</strong>
                      <span>132</span>
                      <span>78</span>
                      <span>60</span>
                    </div>
                    <div className={styles.sizeTableRow}>
                      <strong>XXL</strong>
                      <span>138</span>
                      <span>80</span>
                      <span>62</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className={styles.quantitySection}>
                <span className={styles.blockLabel}>QUANTITY:</span>
                <div className={styles.quantityStepper}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={styles.stepBtn}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className={styles.stepBtn}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className={styles.ctaRow}>
                <button
                  className={`${styles.addToBagBtn} ${isAdded ? styles.addedSuccess : ''}`}
                  onClick={handleAddToCart}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      <span>ADDED TO VOYAGE BAG</span>
                    </>
                  ) : (
                    <>
                      <span>ADD TO BAG</span>
                      <span>•</span>
                      <span>${product.price * quantity}</span>
                    </>
                  )}
                </button>

                <button
                  className={styles.wishlistActionBtn}
                  onClick={() => toggleWishlist(product)}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={18} fill={isSaved ? 'var(--accent-crimson)' : 'none'} />
                </button>
              </div>

              {/* Shipping & Provenance Badges */}
              <div className={styles.assuranceList}>
                <div className={styles.assuranceItem}>
                  <Truck size={15} className={styles.assuranceIcon} />
                  <span>Express Worldwide Shipping via Priority Air (3-5 Days)</span>
                </div>
                <div className={styles.assuranceItem}>
                  <ShieldCheck size={15} className={styles.assuranceIcon} />
                  <span>Individually numbered certificate & authentic woven tag</span>
                </div>
                <div className={styles.assuranceItem}>
                  <RefreshCw size={15} className={styles.assuranceIcon} />
                  <span>Complimentary 30-Day Global Returns & Exchanges</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

