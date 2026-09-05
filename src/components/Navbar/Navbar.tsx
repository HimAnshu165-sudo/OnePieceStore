'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingBag, Heart, Menu, X, Globe, ArrowUpRight, User, Shield, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenCheckout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { totalItems, toggleCart } = useCart();
  const { wishlistCount, toggleWishlistDrawer } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'JPY' | 'EUR'>('USD');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
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
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={15} />
              <span className={styles.actionLabel}>WISHLIST</span>
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </button>

            <button
              onClick={toggleCart}
              className={`${styles.actionBtn} ${styles.cartBtn}`}
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingBag size={15} />
              <span className={styles.cartLabel}>BAG</span>
              <span className={styles.cartCountBadge}>
                {totalItems}
              </span>
            </button>

            {/* Authentication Action */}
            {isAuthenticated ? (
              <div className={styles.userMenuContainer}>
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className={`${styles.actionBtn} ${styles.adminBadgeBtn}`}
                    title="Admin Command Console"
                  >
                    <Shield size={14} />
                    <span className={styles.actionLabel}>COMMAND</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className={`${styles.actionBtn} ${styles.userBadgeBtn}`}
                    title="Crew Dashboard"
                  >
                    <User size={14} />
                    <span className={styles.actionLabel}>CREW</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className={styles.logoutIconBtn}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal({ defaultRole: 'user', defaultTab: 'LOGIN' })}
                className={styles.actionBtn}
                aria-label="Sign In / Register"
              >
                <User size={15} />
                <span className={styles.actionLabel}>SIGN IN</span>
              </button>
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
          </nav>

          {/* Mobile Auth Button */}
          <div className={styles.mobileAuthBox}>
            {isAuthenticated ? (
              <div className={styles.mobileAuthLoggedIn}>
                <div className={styles.mobileUserMeta}>
                  <div className={styles.mobileUserName}>{user?.name}</div>
                  <div className={styles.mobileUserRole}>
                    {isAdmin ? 'COMMAND CLEARANCE' : 'REGISTERED CREW'}
                  </div>
                </div>
                <div className={styles.mobileAuthActions}>
                  <Link
                    href={isAdmin ? '/admin/dashboard' : '/dashboard'}
                    className={styles.mobileDashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{isAdmin ? 'ADMIN CONSOLE' : 'MY DASHBOARD'}</span>
                    <ArrowUpRight size={14} />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className={styles.mobileLogoutBtn}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal({ defaultRole: 'user', defaultTab: 'LOGIN' });
                }}
                className={styles.mobileSignInBtn}
              >
                <User size={16} />
                <span>SIGN IN // REGISTER</span>
              </button>
            )}
          </div>

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




