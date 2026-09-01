'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CategoryFilterType, SortOption } from '@/types';
import { CREW_CATEGORIES } from '@/data/products';
import { ChevronDown } from 'lucide-react';
import styles from './CategoryFilter.module.css';

interface CategoryFilterProps {
  activeCategory: CategoryFilterType;
  onSelectCategory: (category: CategoryFilterType) => void;
  activeSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  totalProductsCount: number;
  filteredCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
  totalProductsCount,
  filteredCount,
}) => {
  return (
    <div className={styles.filterContainer}>
      {/* Horizontal Text Navigation */}
      <div className={styles.categoryNav} role="tablist" aria-label="Collection category filter">
        {CREW_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const displayLabel = cat.id === 'ALL' ? 'ALL PIECES' : cat.label.toUpperCase();

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.categoryTab} ${isActive ? styles.activeTab : ''}`}
              onClick={() => onSelectCategory(cat.id as CategoryFilterType)}
            >
              <span className={styles.tabText}>{displayLabel}</span>
              {isActive && (
                <motion.span
                  layoutId="activeCategoryUnderline"
                  className={styles.activeUnderline}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Count & Minimal Sort Control */}
      <div className={styles.controlRow}>
        <div className={styles.countBadge}>
          <span className={styles.countDot} />
          <span>{filteredCount.toString().padStart(2, '0')} PIECES AVAILABLE</span>
        </div>

        <div className={styles.sortWrapper}>
          <span className={styles.sortLabel}>SORT BY:</span>
          <div className={styles.selectBox}>
            <select
              value={activeSort}
              onChange={(e) => onSelectSort(e.target.value as SortOption)}
              className={styles.sortSelect}
              aria-label="Sort products"
            >
              <option value="FEATURED">FEATURED</option>
              <option value="NEWEST">NEW ARRIVALS</option>
              <option value="PRICE_LOW">PRICE: LOW TO HIGH</option>
              <option value="PRICE_HIGH">PRICE: HIGH TO LOW</option>
              <option value="GSM">FABRIC WEIGHT (GSM)</option>
            </select>
            <ChevronDown size={12} className={styles.chevronIcon} />
          </div>
        </div>
      </div>
    </div>
  );
};

