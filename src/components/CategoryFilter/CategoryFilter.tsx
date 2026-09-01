'use client';

import React from 'react';
import { CategoryFilterType, SortOption } from '@/types';
import { CREW_CATEGORIES } from '@/data/products';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
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
      {/* Category Tabs */}
      <div className={styles.categoryScrollTrack} role="tablist" aria-label="Filter by Crew Category">
        {CREW_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              className={`${styles.categoryTab} ${isActive ? styles.activeTab : ''}`}
              onClick={() => onSelectCategory(cat.id as CategoryFilterType)}
            >
              <span className={styles.tabLabel}>{cat.label}</span>
              <span className={styles.tabCount}>{cat.badge}</span>
              {isActive && <span className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>

      {/* Control Bar: Items Count & Sort Selector */}
      <div className={styles.controlBar}>
        <div className={styles.countTelemetry}>
          <span className={styles.countPulse} />
          <span>SHOWING {filteredCount} OF {totalProductsCount} EDITIONS</span>
        </div>

        <div className={styles.sortWrapper}>
          <ArrowUpDown size={13} className={styles.sortIcon} />
          <span className={styles.sortLabel}>SORT:</span>
          <select
            value={activeSort}
            onChange={(e) => onSelectSort(e.target.value as SortOption)}
            className={styles.sortSelect}
            aria-label="Sort products"
          >
            <option value="FEATURED">FEATURED // CURATED</option>
            <option value="NEWEST">NEW ARRIVALS</option>
            <option value="GSM">FABRIC WEIGHT (GSM)</option>
            <option value="PRICE_LOW">PRICE: LOW TO HIGH</option>
            <option value="PRICE_HIGH">PRICE: HIGH TO LOW</option>
          </select>
        </div>
      </div>
    </div>
  );
};
