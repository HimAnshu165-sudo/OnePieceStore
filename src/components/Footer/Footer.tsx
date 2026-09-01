'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ShieldCheck, Globe, Lock } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isEnlisted, setIsEnlisted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsEnlisted(true);
  };

  return (
    <footer className={styles.footer} aria-label="Shin Sekai Global Fashion Archive">
      <div className={styles.container}>
        {/* SECTION 4 — PRIVATE ARCHIVE ENLISTMENT */}
        <motion.div
          className={styles.archiveEnlistmentCard}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.enlistLeft}>
            <div className={styles.enlistEyebrow}>
              <span className={styles.crimsonDot} />
              <span>優先アクセス / PRIORITY ACCESS</span>
            </div>
            <h3 className={styles.enlistTitle}>ENTER THE ARCHIVE.</h3>
            <p className={styles.enlistDesc}>
              Receive first access to limited drops, archive releases, private lookbooks, and selected dispatches from the studio.
            </p>
          </div>

          <div className={styles.enlistRight}>
            {isEnlisted ? (
              <motion.div
                className={styles.successState}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.successBadge}>
                  <Check size={16} />
                </div>
                <div className={styles.successInfo}>
                  <strong>ACCESS REQUEST RECEIVED</strong>
                  <span>Archive pass issued for {email}. Check your dispatch inbox.</span>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.enlistForm}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    required
                    placeholder="YOUR EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.emailInput}
                    aria-label="Your email address for archive enlistment"
                  />
                  <button type="submit" className={styles.enlistBtn} aria-label="Enter archive">
                    <span>ENTER ARCHIVE</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <span className={styles.privacyNote}>
                  <Lock size={10} className={styles.privacyLock} />
                  No noise. Only selected transmissions.
                </span>
              </form>
            )}
          </div>
        </motion.div>

        {/* SECTION 7 — LARGE BRAND STATEMENT */}
        <div className={styles.brandHeroArea}>
          <div className={styles.brandTitleRow}>
            <h2 className={styles.bigBrandTitle}>SHIN SEKAI</h2>
            <span className={styles.bigJpBrand}>新世界</span>
          </div>
          <div className={styles.brandSubStatement}>
            <span>BUILT FOR THE JOURNEY BEYOND.</span>
            <span className={styles.brandJpMotto}>東京から世界へ</span>
          </div>
        </div>

        {/* 4-COLUMN FOOTER NAVIGATION GRID */}
        <div className={styles.footerGrid}>
          {/* Column 1: Shop */}
          <div className={styles.footerCol}>
            <span className={styles.colHeader}>SHOP</span>
            <ul className={styles.navList}>
              <li><Link href="#collection" className={styles.navLink}>New Arrivals</Link></li>
              <li><Link href="#collection" className={styles.navLink}>Collections</Link></li>
              <li><Link href="#collection" className={styles.navLink}>T-Shirts</Link></li>
              <li><Link href="#collection" className={styles.navLink}>Hoodies</Link></li>
              <li><Link href="#collection" className={styles.navLink}>Outerwear</Link></li>
              <li><Link href="#collection" className={styles.navLink}>Limited Drops</Link></li>
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div className={styles.footerCol}>
            <span className={styles.colHeader}>EXPLORE</span>
            <ul className={styles.navList}>
              <li><Link href="#lookbook" className={styles.navLink}>Lookbook</Link></li>
              <li><Link href="#story" className={styles.navLink}>Journal</Link></li>
              <li><Link href="#craft" className={styles.navLink}>The Archive</Link></li>
              <li><Link href="#story" className={styles.navLink}>About the Brand</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className={styles.footerCol}>
            <span className={styles.colHeader}>SUPPORT</span>
            <ul className={styles.navList}>
              <li><Link href="#story" className={styles.navLink}>Contact Studio</Link></li>
              <li><Link href="#story" className={styles.navLink}>Global Shipping</Link></li>
              <li><Link href="#story" className={styles.navLink}>Returns & Exchanges</Link></li>
              <li><Link href="#collection" className={styles.navLink}>Size Guide (CM/IN)</Link></li>
              <li><Link href="#story" className={styles.navLink}>FAQ & Authentication</Link></li>
            </ul>
          </div>

          {/* Column 4: Follow & Social */}
          <div className={styles.footerCol}>
            <span className={styles.colHeader}>FOLLOW</span>
            <ul className={styles.navList}>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
                  TikTok
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* FOOTER BOTTOM BAR */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <span>© 2026 SHIN SEKAI — ALL RIGHTS RESERVED</span>
            <div className={styles.legalLinks}>
              <Link href="#story">PRIVACY</Link>
              <span>•</span>
              <Link href="#story">TERMS</Link>
              <span>•</span>
              <Link href="#story">COOKIE PREFERENCES</Link>
            </div>
          </div>

          <div className={styles.bottomRight}>
            <span className={styles.locationTag}>
              TOKYO / GLOBAL DISPATCH
            </span>
            <span className={styles.dispatchStatus}>
              <span className={styles.greenDot} />
              WORLDWIDE DISPATCH ACTIVE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
