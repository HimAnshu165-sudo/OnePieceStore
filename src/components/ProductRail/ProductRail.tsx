'use client';

import React, { useState, useEffect } from 'react';
import { Product, CategoryFilterType, SortOption } from '@/types';
import { fetchProducts } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter/CategoryFilter';
import { Sparkles, ShieldCheck, Flame } from 'lucide-react';
import styles from './ProductRail.module.css';

interface ProductRailProps {
  onOpenQuickView: (product: Product) => void;
}

export const ProductRail: React.FC<ProductRailProps> = ({ onOpenQuickView }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterType>('ALL');
  const [activeSort, setActiveSort] = useState<SortOption>('FEATURED');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(7);

  useEffect(() => {
    let isMounted = true;

    fetchProducts({ crew: activeCategory, sort: activeSort })
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          if (activeCategory === 'ALL') {
            setTotalCount(data.length);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load products in ProductRail:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeSort]);

  // Featured hero garment when viewing ALL
  const heroProduct = products[0];
  const remainingProducts = activeCategory === 'ALL' ? products.slice(1) : products;

  return (
    <section id="collection" className={styles.section} aria-label="Streetwear Collection">
      <div className={styles.innerContainer}>
        {/* Section Editorial Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerSuper}>SHIN SEKAI // SEASON 01</span>
            <h2 className={styles.headerTitle}>
              THE GRAND LINE <span className={styles.crimsonAccent}>CATALOGUE.</span>
            </h2>
            <p className={styles.headerSubtitle}>
              Architectural Japanese streetwear cut from ultra-heavyweight combed loopback cotton.
              Every drop is numbered and restricted to one worldwide batch.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.guaranteePill}>
              <ShieldCheck size={16} className={styles.guaranteeIcon} />
              <div>
                <strong>AUTHENTIC GUILD CERTIFICATE</strong>
                <p>Includes numbered physical metal archive card</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Sort Bar */}
        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          activeSort={activeSort}
          onSelectSort={setActiveSort}
          totalProductsCount={totalCount}
          filteredCount={products.length}
        />

        {/* Asymmetrical Editorial Spotlight (when category is ALL) */}
        {activeCategory === 'ALL' && heroProduct && (
          <div className={styles.heroSpotlight} onClick={() => onOpenQuickView(heroProduct)}>
            <div className={styles.spotlightVisual}>
              <img
                src={heroProduct.images[0]}
                alt={heroProduct.name}
                className={styles.spotlightImg}
              />
              <div className={styles.spotlightBadge}>
                <Flame size={14} />
                <span>KEYPIECE DROP 01</span>
              </div>
            </div>

            <div className={styles.spotlightDetails}>
              <div className={styles.spotlightMeta}>
                <span className={styles.spotlightEdition}>{heroProduct.editionNumber}</span>
                <span className={styles.spotlightGsm}>{heroProduct.gsm} GSM COMBED TERRY</span>
              </div>

              <h3 className={styles.spotlightTitle}>{heroProduct.name}</h3>
              <p className={styles.spotlightStory}>{heroProduct.story}</p>

              <div className={styles.spotlightSpecs}>
                <div className={styles.specBox}>
                  <span>SILHOUETTE</span>
                  <strong>{heroProduct.cut}</strong>
                </div>
                <div className={styles.specBox}>
                  <span>FABRIC</span>
                  <strong>{heroProduct.fabric}</strong>
                </div>
                <div className={styles.specBox}>
                  <span>PRINT PROCESS</span>
                  <strong>High-Density Puff</strong>
                </div>
              </div>

              <div className={styles.spotlightActionRow}>
                <div className={styles.spotlightPrice}>
                  <span>${heroProduct.price} USD</span>
                  {heroProduct.compareAtPrice && (
                    <span className={styles.comparePrice}>${heroProduct.compareAtPrice}</span>
                  )}
                </div>
                <button
                  className={styles.spotlightInspectBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQuickView(heroProduct);
                  }}
                >
                  <span>INSPECT PIECE & SIZING</span>
                  <Sparkles size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Editorial Grid for Catalog */}
        <div className={styles.productGrid}>
          {remainingProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickView={onOpenQuickView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
