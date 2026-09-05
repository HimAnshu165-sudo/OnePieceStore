'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingBag, Heart, Menu, X, Globe, ArrowUpRight, User, Shield, LogOut, Package, ChevronDown } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCheckout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { totalItems, toggleCart } = useCart();
  const { wishlistCount, toggleWishlistDrawer } = useWishlist();
  const { user, isAuthenticated, isAdmin, isUser, openAuthModal, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR'>('USD');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => {
      document.body.classList.remove('scroll-locked');
    };
  }, [mobileMenuOpen]);

  const cycleCurrency = () => {
    if (currency === 'USD') setCurrency('JPY');
    else if (currency === 'JPY') setCurrency('EUR');
    else setCurrency('USD');
  };

  const displayWishlistCount = mounted ? wishlistCount : 0;
  const displayCartCount = mounted ? totalItems : 0;

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        {/* Top Minimal Telemetry Bar */}
        <div className={styles.telemetryBar}>
          <div className={styles.telemetryLeft}>
            <span className={styles.telemetryDot} aria-hidden="true" />
            <span className={styles.utilityTag}>DROP 01 // TOKYO ARCHIVE</span>
          </div>

          <div className={styles.telemetryCenter}>
            <span>SHIN SEKAI • GRAND LINE SUPPLY CO.</span>
          </div>

          <div className={styles.telemetryRight}>
            <span className={styles.badgeFreeShip}>WORLDWIDE DISPATCH OVER $150</span>
            <span className={styles.utilityDivider}>|</span>
            <button onClick={cycleCurrency} className={styles.currencyBtn} aria-label="Toggle currency">
              <Globe size={11} />
              <span>{currency} ({currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : '€'})</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className={styles.navContainer}>
          {/* Mobile Menu Trigger */}
          <button
            className={styles.mobileMenuTrigger}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>

          {/* Left Editorial Navigation Links */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            <Link href="#collection" className={styles.navLink}>
              SHOP
              <span className={styles.navIndicator} />
            </Link>
            <Link href="#collection" className={styles.navLink}>
              COLLECTIONS
              <span className={styles.navIndicator} />
            </Link>
            <Link href="#lookbook" className={styles.navLink}>
              LOOKBOOK
              <span className={styles.navIndicator} />
            </Link>
            <Link href="#story" className={styles.navLink}>
              JOURNAL
              <span className={styles.navIndicator} />
            </Link>
          </nav>

          {/* Center Brand Identity */}
          <div className={styles.brandContainer}>
            <Link href="/" className={styles.brandLink}>
              <span className={styles.brandTitle}>SHIN SEKAI</span>
              <span className={styles.japaneseSublabel}>新世界 // TOKYO ARCHIVE</span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className={styles.actions}>
            <button
              onClick={onOpenSearch}
              className={styles.actionBtn}
              aria-label="Search Collection"
            >
              <Search size={15} />
              <span className={styles.actionLabel}>SEARCH</span>
            </button>

            <button
              onClick={toggleWishlistDrawer}
              className={styles.actionBtn}
              aria-label={`Wishlist with ${displayWishlistCount} items`}
            >
              <Heart size={15} />
              <span className={styles.actionLabel}>WISHLIST</span>
              {displayWishlistCount > 0 && <span className={styles.badge}>{displayWishlistCount}</span>}
            </button>

            <button
              onClick={toggleCart}
              className={`${styles.actionBtn} ${styles.cartBtn}`}
              aria-label={`Cart with ${displayCartCount} items`}
            >
              <ShoppingBag size={15} />
              <span className={styles.cartLabel}>BAG</span>
              <span className={styles.cartCountBadge}>
                {displayCartCount}
              </span>
            </button>

            {/* Auth / Account Nav Trigger */}
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal()}
                className={styles.authNavBtn}
                aria-label="Sign In or Create Account"
              >
                <User size={14} />
                <span className={styles.actionLabel}>SIGN IN</span>
              </button>
            ) : isAdmin ? (
              <div className={styles.accountWrapper}>
                <Link
                  href="/admin/dashboard"
                  className={styles.adminBadgeBtn}
                  aria-label="Admin Dashboard"
                >
                  <Shield size={13} />
                  <span>ADMIN</span>
                </Link>
              </div>
            ) : (
              <div className={styles.accountWrapper}>
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className={styles.userAccountBtn}
                  aria-label="User Account Menu"
                >
                  <div className={styles.userAvatar}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className={styles.actionLabel}>
                    {user?.name ? user.name.split(' ')[0] : 'CREW'}
                  </span>
                  <ChevronDown size={12} />
                </button>

                {accountDropdownOpen && (
                  <div className={styles.accountDropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownUserName}>{user?.name}</div>
                      <div className={styles.dropdownUserTier}>VIP CREW // LEVEL 01</div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountDropdownOpen(false)}
                      className={styles.dropdownItem}
                    >
                      <Package size={14} />
                      <span>Dashboard Overview</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=orders"
                      onClick={() => setAccountDropdownOpen(false)}
                      className={styles.dropdownItem}
                    >
                      <Package size={14} />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=profile"
                      onClick={() => setAccountDropdownOpen(false)}
                      className={styles.dropdownItem}
                    >
                      <User size={14} />
                      <span>Profile & Address</span>
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                      }}
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={styles.mobileDrawerHeader}>
          <div>
            <div className={styles.brandTitleMobile}>SHIN SEKAI</div>
            <span className={styles.japaneseSublabel}>新世界 // TOKYO ARCHIVE</span>
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
              <span>01 // SHOP</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="#collection"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>02 // COLLECTIONS</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="#lookbook"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>03 // LOOKBOOK</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link
              href="#story"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>04 // JOURNAL</span>
              <ArrowUpRight size={16} />
            </Link>

            {/* Mobile Auth Shortcuts */}
            {!isAuthenticated ? (
              <button
                type="button"
                className={styles.mobileNavLink}
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                <span>05 // SIGN IN</span>
                <ArrowUpRight size={16} />
              </button>
            ) : isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: '#ff999f' }}
                >
                  <span>05 // ADMIN CONSOLE</span>
                  <ArrowUpRight size={16} />
                </Link>
                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{ color: '#ff7875', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span>06 // SIGN OUT</span>
                  <ArrowUpRight size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>05 // MY DASHBOARD</span>
                  <ArrowUpRight size={16} />
                </Link>
                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{ color: '#ff7875', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span>06 // SIGN OUT</span>
                  <ArrowUpRight size={16} />
                </button>
              </>
            )}
          </nav>

          <div className={styles.mobileDrawerFooter}>
            <p className={styles.mobileFooterText}>
              LIMITED EDITION 500 GSM STREETWEAR. CRAFTED IN TOKYO. WORLDWIDE VOYAGE DISPATCH.
            </p>
            <div className={styles.mobileCoords}>TOKYO HQ // 35.6580° N, 139.7016° E</div>
          </div>
        </div>
      </div>
    </>
  );
};




