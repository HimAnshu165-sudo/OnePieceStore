'use client';

import React from 'react';
import styles from './Marquee.module.css';

export const Marquee: React.FC = () => {
  const items = [
    'SHIN SEKAI // 新世界',
    'DROP 01 // 250 PIECES WORLDWIDE',
    '500 GSM JAPANESE COMBED COTTON',
    'PUFF & DISCHARGE SCREEN PRINTING',
    'WORLDWIDE PRIORITY EXPEDITIONS',
    'HAND-NUMBERED GARMENTS',
    'FROM EAST BLUE TO THE GRAND LINE'
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
