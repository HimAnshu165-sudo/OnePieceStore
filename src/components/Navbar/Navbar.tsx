'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Search, ShoppingBag, Heart, Menu, X, Globe, ArrowUpRight } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCheckout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { totalItems, toggleCart } = useCart();
  const { wishlistCount, toggleWishlistDrawer } = useWishlist();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR'>('USD');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cycleCurrency = () => {
    if (currency === 'USD') setCurrency('JPY');
    else if (currency === 'JPY') setCurrency('EUR');
    else setCurrency('USD');
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        {/* Top Status Ticker / Telemetry Bar */}
        <div className={styles.telemetryBar}>
          <div className={styles.telemetryContent}>
            <span className={styles.telemetryDot} />
            <span>DROP 01 LIVE // WORLDWIDE VOYAGE DISPATCH</span>
            <span className={styles.telemetryDivider}>|</span>
            <span className={styles.telemetryCoords}>35.6580° N, 139.7016° E [SHIBUYA SECTOR]</span>
          </div>
          <div className={styles.telemetryRight}>
            <button onClick={cycleCurrency} className={styles.currencyBtn} aria-label="Toggle currency">
              <Globe size={11} />
              <span>{currency} ($)</span>
            </button>
            <span className={styles.badgeFreeShip}>FREE SHIPPING OVER $150</span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className={styles.navContainer}>
          {/* Mobile Menu Trigger */}
          <button
            className={styles.mobileMenuTrigger}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Left Navigation Links */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            <Link href="#collection" className={styles.navLink}>
              COLLECTION
              <span className={styles.navIndicator} />
            </Link>
            <Link href="#drops" className={styles.navLink}>
              CREWS
              <span className={styles.navIndicator} />
            </Link>
            <Link href="#lookbook" className={styles.navLink}>
              LOOKBOOK
              <span className={styles.navIndicator} />
            </Link>
            <Link href="#story" className={styles.navLink}>
              CRAFT // 500GSM
              <span className={styles.navIndicator} />
            </Link>
          </nav>

          {/* Center Brand Identity */}
          <div className={styles.brandContainer}>
            <Link href="/" className={styles.brandLink}>
              <span className={styles.japaneseWordmark}>新世界</span>
              <span className={styles.brandTitle}>SHIN SEKAI</span>
              <span className={styles.brandSubtitle}>GRAND LINE SUPPLY CO.</span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className={styles.actions}>
            <button
              onClick={onOpenSearch}
              className={styles.actionBtn}
              aria-label="Search Collection"
            >
              <Search size={18} />
              <span className={styles.actionLabel}>SEARCH</span>
            </button>

            <button
              onClick={toggleWishlistDrawer}
              className={styles.actionBtn}
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={18} />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </button>

            <button
              onClick={toggleCart}
              className={`${styles.actionBtn} ${styles.cartBtn}`}
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingBag size={18} />
              <span className={styles.cartLabel}>BAG</span>
              <span className={styles.cartCountBadge}>
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={styles.mobileDrawerHeader}>
          <div>
            <span className={styles.japaneseWordmark}>新世界</span>
            <div className={styles.brandTitleMobile}>SHIN SEKAI</div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={styles.closeBtn}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.mobileDrawerBody}>
          <nav className={styles.mobileNavLinks}>
            <Link
              href="#collection"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>01 // THE COLLECTION</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="#drops"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>02 // CREW DIVISIONS</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="#lookbook"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>03 // TOKYO LOOKBOOK</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="#story"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>04 // CRAFTSMANSHIP & GSM</span>
              <ArrowUpRight size={16} />
            </Link>
          </nav>

          <div className={styles.mobileDrawerFooter}>
            <p className={styles.mobileFooterText}>
              LIMITED EDITION 500 GSM STREETWEAR. CRAFTED IN TOKYO. WORLDWIDE EXPEDITIONS.
            </p>
            <div className={styles.mobileCoords}>35.6580° N, 139.7016° E</div>
          </div>
        </div>
      </div>
    </>
  );
};
