'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ShieldCheck, Globe, Send } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer className={styles.footer} aria-label="Grand Line Supply Footer">
      <div className={styles.container}>
        {/* Newsletter Section */}
        <div className={styles.newsletterCard}>
          <div className={styles.newsletterLeft}>
            <span className={styles.newsletterSuper}>PRIORITY EXPEDITION DISPATCH</span>
            <h3 className={styles.newsletterTitle}>JOIN THE GRAND LINE SYNDICATE</h3>
            <p className={styles.newsletterDesc}>
              Receive exclusive access to 250-piece private drops, early access codes, and archival lookbooks.
            </p>
          </div>

          <div className={styles.newsletterRight}>
            {subscribed ? (
              <div className={styles.successBox}>
                <Check size={18} className={styles.successIcon} />
                <div>
                  <strong>WELCOME TO THE CREW</strong>
                  <p>Use code <strong>GRANDLINE15</strong> for 15% off your first voyage.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className={styles.form}>
                <input
                  type="email"
                  required
                  placeholder="ENTER PIRATE / CREW EMAIL..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                />
                <button type="submit" className={styles.submitBtn} aria-label="Subscribe to newsletter">
                  <span>ENLIST</span>
                  <Send size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className={styles.linksGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <span className={styles.jpWordmark}>新世界</span>
              <h4 className={styles.brandTitle}>SHIN SEKAI</h4>
              <span className={styles.brandSub}>GRAND LINE SUPPLY CO.</span>
            </div>
            <p className={styles.brandBio}>
              Architectural streetwear inspired by One Piece mythology. Milled in Wakayama, designed in Tokyo, dispatched worldwide.
            </p>
            <div className={styles.coordinatesTag}>
              <span>TOKYO HQ // 35.6580° N, 139.7016° E</span>
            </div>
          </div>

          {/* Column 1: Drops */}
          <div className={styles.linkCol}>
            <h5 className={styles.colTitle}>COLLECTION</h5>
            <ul className={styles.linkList}>
              <li><Link href="#collection">Sun God Heavyweight Cut</Link></li>
              <li><Link href="#collection">Santoryu Oni Swordsman</Link></li>
              <li><Link href="#collection">Room: Death Surgeon</Link></li>
              <li><Link href="#collection">Red Hair Conqueror Tee</Link></li>
              <li><Link href="#collection">Absolute Justice Minimalist</Link></li>
            </ul>
          </div>

          {/* Column 2: Divisions */}
          <div className={styles.linkCol}>
            <h5 className={styles.colTitle}>DIVISIONS</h5>
            <ul className={styles.linkList}>
              <li><Link href="#drops">Straw Hat Syndicate</Link></li>
              <li><Link href="#drops">Heart Pirates Fleet</Link></li>
              <li><Link href="#drops">Emperor Squadron</Link></li>
              <li><Link href="#drops">Marine Headquarters</Link></li>
              <li><Link href="#drops">Wano Ronin Archive</Link></li>
            </ul>
          </div>

          {/* Column 3: Atelier & Care */}
          <div className={styles.linkCol}>
            <h5 className={styles.colTitle}>ATELIER & CARE</h5>
            <ul className={styles.linkList}>
              <li><Link href="#story">500 GSM Loopback Textile</Link></li>
              <li><Link href="#lookbook">Discharge Ink Screenprinting</Link></li>
              <li><Link href="#story">Garment Washing Guide</Link></li>
              <li><Link href="#collection">Metal Certificate Authentication</Link></li>
              <li><Link href="#collection">Global Maritime Logistics</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Telemetry */}
        <div className={styles.bottomBar}>
          <div className={styles.legalText}>
            © {new Date().getFullYear()} SHIN SEKAI // GRAND LINE SUPPLY CO. ALL RIGHTS RESERVED.
            AN ORIGINAL STREETWEAR HOMAGE TO ONE PIECE LORE.
          </div>

          <div className={styles.bottomBadges}>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              SYSTEM OPERATIONAL
            </span>
            <span className={styles.securityBadge}>
              <ShieldCheck size={12} />
              256-BIT ENCRYPTION
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
