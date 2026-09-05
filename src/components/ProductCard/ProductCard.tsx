'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, Plus, Check, Eye } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  featured = false,
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isSaved = mounted && isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal({
        pendingAction: {
          type: 'ADD_TO_CART',
          product,
          size: selectedSize,
          color: product.color,
          quantity: 1
        }
      });
      return;
    }

    addToCart(product, selectedSize, product.color, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <article
      className={`${styles.productCard} ${featured ? styles.featuredCard : ''}`}
      onClick={() => onOpenQuickView(product)}
      aria-label={`Product: ${product.name}`}
    >
      {/* Image Container with Editorial Zoom & Secondary Reveal */}
      <div className={styles.imageWrapper}>
        {/* Edition Tag */}
        <div className={styles.editionTag}>
          <span>{product.editionNumber || 'LIMITED DROP'}</span>
          <span className={styles.gsmPill}>{product.gsm} GSM</span>
        </div>

        {/* Wishlist Trigger */}
        <button
          className={`${styles.wishlistBtn} ${isSaved ? styles.wishlistActive : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={16} fill={isSaved ? 'var(--accent-crimson)' : 'none'} />
        </button>

        {/* Primary Product Image */}
        <div className={styles.primaryImg}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.img}
            priority={featured}
          />
        </div>

        {/* Secondary Detail Image on Hover */}
        {product.images[1] && (
          <div className={styles.secondaryImg}>
            <Image
              src={product.images[1]}
              alt={`${product.name} fabric and stitch detail`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.img}
            />
          </div>
        )}

        {/* Quick View Floating Button */}
        <div className={styles.quickViewOverlay}>
          <button
            className={styles.quickViewBtn}
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
          >
            <Eye size={14} />
            <span>GARMENT SPECS</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className={styles.infoArea}>
        <div className={styles.metaRow}>
          <span className={styles.characterBadge}>{product.character}</span>
          <span className={styles.cutBadge}>{product.cut}</span>
        </div>

        <h3 className={styles.productTitle}>{product.name}</h3>
        <div className={styles.japaneseTitle}>{product.japaneseName}</div>

        <div className={styles.priceRow}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>${product.price}</span>
            {product.compareAtPrice && (
              <span className={styles.comparePrice}>${product.compareAtPrice}</span>
            )}
          </div>
          <span className={styles.stockNotice}>
            {product.stock <= 10 ? `ONLY ${product.stock} LEFT` : 'IN STOCK'}
          </span>
        </div>

        {/* Tactile Size Selector & Quick Add */}
        <div className={styles.tactileControls} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sizePills}>
            {product.sizes.map((size) => (
              <button
                key={size}
                className={`${styles.sizePill} ${selectedSize === size ? styles.activeSizePill : ''}`}
                onClick={() => setSelectedSize(size)}
                aria-label={`Select size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>

          <button
            className={`${styles.quickAddBtn} ${isAdded ? styles.quickAddSuccess : ''}`}
            onClick={handleQuickAdd}
            aria-label={`Add size ${selectedSize} to bag`}
          >
            {isAdded ? (
              <>
                <Check size={14} />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>BAG</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
