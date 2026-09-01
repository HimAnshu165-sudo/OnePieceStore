'use client';

import React from 'react';
import styles from './Marquee.module.css';

export const Marquee: React.FC = () => {
  const items = [
    'SHIN SEKAI // 新世界',
    'DROP 01 // 250 PIECES WORLDWIDE',
    '500 GSM JAPANESE COMBED COTTON',
    'STRAW HAT SYNDICATE // 海賊団',
    'PUFF & DISCHARGE SCREEN PRINTING',
    'FROM EAST BLUE TO THE NEW WORLD',
    'HEART PIRATES // 死の外科医',
    'LIMITED EDITION ARCHIVAL STREETWEAR'
  ];

  return (
    <div className={styles.marqueeSection} aria-hidden="true">
      <div className={styles.track}>
        {[...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className={styles.item}>
            <span className={styles.dot} />
            <span className={styles.text}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

