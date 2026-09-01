'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { Search, X, ArrowUpRight, Sparkles } from 'lucide-react';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProducts = PRODUCTS.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.character.toLowerCase().includes(q) ||
      p.crew.toLowerCase().includes(q) ||
      p.japaneseName.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const popularSearches = ['Sun God', '500 GSM', 'Zoro Oni', 'Law Room', 'Wano Ronin', 'Marine HQ'];

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header Search Field */}
        <div className={styles.searchHeader}>
          <div className={styles.inputWrapper}>
            <Search size={22} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              placeholder="SEARCH BY CHARACTER, CREW, GSM OR EDITION..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.input}
            />
            {query && (
              <button onClick={() => setQuery('')} className={styles.clearBtn} aria-label="Clear query">
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close search">
            ESC / CLOSE
          </button>
        </div>

        {/* Popular Trending Tags */}
        <div className={styles.trendingRow}>
          <span className={styles.trendingLabel}>TRENDING EXPEDITIONS:</span>
          <div className={styles.trendingTags}>
            {popularSearches.map((term) => (
              <button
                key={term}
                className={styles.trendingTag}
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Grid */}
        <div className={styles.resultsArea}>
          <div className={styles.resultsHeader}>
            <span>{filteredProducts.length} PIECES DISCOVERED</span>
          </div>

          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={styles.resultCard}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
              >
                <div className={styles.imgWrapper}>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="120px"
                    className={styles.img}
                  />
                  <span className={styles.gsmPill}>{product.gsm} GSM</span>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardCrew}>{product.crew} ARCHIVE</span>
                  <h4 className={styles.cardTitle}>{product.name}</h4>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardPrice}>${product.price} USD</span>
                    <span className={styles.inspectHint}>
                      <span>INSPECT</span>
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
