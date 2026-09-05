'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { X, Heart, Plus, Trash2 } from 'lucide-react';
import styles from './WishlistDrawer.module.css';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isOpen, closeWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 'L', product.color, 1);
    toggleWishlist(product);
  };

  return (
    <div className={styles.backdrop} onClick={closeWishlist} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <Heart size={18} className={styles.heartIcon} />
            <h2 className={styles.title}>SAVED ARCHIVE ({wishlist.length})</h2>
          </div>
          <button className={styles.closeBtn} onClick={closeWishlist} aria-label="Close wishlist">
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className={styles.list}>
          {wishlist.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <Heart size={32} />
              </div>
              <h3>NO SAVED PIECES</h3>
              <p>Bookmark your favorite 500 GSM heavyweight cuts to review later.</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imgWrapper}>
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    sizes="100px"
                    className={styles.img}
                  />
                  <span className={styles.gsmPill}>{item.gsm} GSM</span>
                </div>

                <div className={styles.info}>
                  <div className={styles.infoTop}>
                    <span className={styles.crewTag}>{item.crew}</span>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className={styles.removeBtn}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h4 className={styles.name}>{item.name}</h4>
                  <span className={styles.price}>${item.price} USD</span>

                  <button
                    className={styles.moveToBagBtn}
                    onClick={() => handleMoveToCart(item)}
                  >
                    <Plus size={13} />
                    <span>TRANSFER TO BAG</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
