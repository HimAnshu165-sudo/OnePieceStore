'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Search, ShoppingBag, Heart, Menu, X, ArrowUpRight, User, Shield, LogOut, Package, ChevronDown } from 'lucide-react';
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

  const displayWishlistCount = mounted ? wishlistCount : 0;
  const displayCartCount = mounted ? totalItems : 0;

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        {/* Main Navigation Bar */}
        <div className={styles.navContainer}>
          {/* Left Brand Identity */}
          <div className={styles.brandContainer}>
            <Link href="/" className={styles.brandLink}>
              <span className={styles.brandTitle}>SHIN SEKAI</span>
              <span className={styles.japaneseSublabel}>新世界 // TOKYO ARCHIVE</span>
            </Link>
          </div>

          {/* Right Navigation Group (Desktop) */}
          <div className={styles.rightNavGroup}>
            <nav className={styles.desktopNavLinks} aria-label="Main Navigation">
              <Link href="#collection" className={styles.navLink}>
                <span>SHOP</span>
                <span className={styles.navIndicator} />
              </Link>
              <Link href="#lookbook" className={styles.navLink}>
                <span>LOOKBOOK</span>
                <span className={styles.navIndicator} />
              </Link>
            </nav>

            <div className={styles.actionItems}>
              <button
                onClick={onOpenSearch}
                className={styles.actionBtn}
                aria-label="Search Collection"
              >
                <Search size={14} className={styles.btnIcon} />
                <span className={styles.actionLabel}>SEARCH</span>
              </button>

              <button
                onClick={toggleWishlistDrawer}
                className={styles.actionBtn}
                aria-label={`Wishlist with ${displayWishlistCount} items`}
              >
                <Heart size={14} className={styles.btnIcon} />
                <span className={styles.actionLabel}>WISHLIST</span>
                {displayWishlistCount > 0 && <span className={styles.badge}>{displayWishlistCount}</span>}
              </button>

              <button
                onClick={toggleCart}
                className={`${styles.actionBtn} ${styles.cartBtn}`}
                aria-label={`Cart with ${displayCartCount} items`}
              >
                <ShoppingBag size={14} className={styles.btnIcon} />
                <span className={styles.cartLabel}>BAG</span>
                <span className={styles.cartCountBadge}>
                  {displayCartCount}
                </span>
              </button>

              {/* Auth / Account Nav Slot */}
              {!isAuthenticated ? (
                <button
                  onClick={() => openAuthModal()}
                  className={styles.authNavBtn}
                  aria-label="Sign In or Create Account"
                >
                  <User size={13} />
                  <span className={styles.actionLabel}>SIGN IN</span>
                </button>
              ) : isAdmin ? (
                <div className={styles.accountWrapper}>
                  <Link
                    href="/admin/dashboard"
                    className={styles.adminBadgeBtn}
                    aria-label="Admin Dashboard"
                  >
                    <Shield size={12} className={styles.adminIcon} />
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
                    <ChevronDown size={11} />
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

          {/* Mobile Right Controls */}
          <div className={styles.mobileControls}>
            <button
              onClick={toggleCart}
              className={styles.mobileActionBtn}
              aria-label={`Cart with ${displayCartCount} items`}
            >
              <ShoppingBag size={18} />
              {displayCartCount > 0 && (
                <span className={styles.mobileBadge}>{displayCartCount}</span>
              )}
            </button>
            <button
              className={styles.mobileMenuTrigger}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
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
              href="#lookbook"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>02 // LOOKBOOK</span>
              <ArrowUpRight size={16} />
            </Link>
            <button
              type="button"
              className={styles.mobileNavBtn}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
            >
              <span>03 // SEARCH</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className={styles.mobileNavBtn}
              onClick={() => {
                setMobileMenuOpen(false);
                toggleWishlistDrawer();
              }}
            >
              <div className={styles.mobileNavLabelWithBadge}>
                <span>04 // WISHLIST</span>
                {displayWishlistCount > 0 && (
                  <span className={styles.mobileItemBadge}>{displayWishlistCount}</span>
                )}
              </div>
              <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className={styles.mobileNavBtn}
              onClick={() => {
                setMobileMenuOpen(false);
                toggleCart();
              }}
            >
              <div className={styles.mobileNavLabelWithBadge}>
                <span>05 // BAG</span>
                {displayCartCount > 0 && (
                  <span className={styles.mobileItemBadge}>{displayCartCount}</span>
                )}
              </div>
              <ArrowUpRight size={16} />
            </button>

            {/* Auth-Aware Role Section in Mobile Drawer */}
            {!isAuthenticated ? (
              <button
                type="button"
                className={styles.mobileNavBtn}
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
              >
                <span className={styles.mobileAuthText}>06 // SIGN IN</span>
                <ArrowUpRight size={16} />
              </button>
            ) : isAdmin ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`${styles.mobileNavLink} ${styles.mobileAdminLink}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>06 // ADMIN CONSOLE</span>
                  <ArrowUpRight size={16} />
                </Link>
                <button
                  type="button"
                  className={styles.mobileNavBtn}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{ color: '#ff7875' }}
                >
                  <span>07 // SIGN OUT</span>
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
                  <span>06 // MY DASHBOARD</span>
                  <ArrowUpRight size={16} />
                </Link>
                <button
                  type="button"
                  className={styles.mobileNavBtn}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={{ color: '#ff7875' }}
                >
                  <span>07 // SIGN OUT</span>
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




