'use client';

import React from 'react';
import { Feather, Anchor, ShieldCheck, Flame } from 'lucide-react';
import styles from './BrandStory.module.css';

export const BrandStory: React.FC = () => {
  return (
    <section id="story" className={styles.section} aria-label="Brand Story and Craftsmanship">
      <div className={styles.container}>
        {/* Editorial Narrative Split */}
        <div className={styles.narrativeSplit}>
          <div className={styles.leftCol}>
            <span className={styles.superText}>THE MANIFESTO // 新世界理念</span>
            <h2 className={styles.headline}>
              CLOTHING FORGED FOR <br />
              <span className={styles.crimsonAccent}>THE NEW ERA.</span>
            </h2>
            <div className={styles.japaneseMotto}>「海賊王に俺はなる」— THE SPIRIT OF LIBERATION</div>
          </div>

          <div className={styles.rightCol}>
            <p className={styles.leadParagraph}>
              We do not print souvenirs. We construct archival garments for those who chart unknown waters.
              Each drop is designed at the intersection of Japanese high-density streetwear tailoring and the rich mythological lore of Eiichiro Oda’s pirate frontier.
            </p>
            <p className={styles.secondaryParagraph}>
              From custom vintage acid washes in Kojima to 500 GSM loopback cotton knits in Wakayama,
              every stitch reflects the uncompromising grit of the Straw Hat crew.
            </p>
          </div>
        </div>

        {/* 3-Column Craftsmanship Pillars */}
        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <Feather size={20} className={styles.pillarIcon} />
            </div>
            <div className={styles.pillarNumber}>01</div>
            <h3 className={styles.pillarTitle}>500 GSM JAPANESE COMBED COTTON</h3>
            <p className={styles.pillarText}>
              Custom-spun heavyweight loopback jersey that holds a crisp architectural boxy silhouette.
              Pre-shrunk through mineral enzyme washing for unmatched longevity and soft hand-feel.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <Flame size={20} className={styles.pillarIcon} />
            </div>
            <div className={styles.pillarNumber}>02</div>
            <h3 className={styles.pillarTitle}>DISCHARGE & 3D PUFF PRINTING</h3>
            <p className={styles.pillarText}>
              Layered printing techniques that extract raw fabric dye before infusing pigment directly into the cotton grain.
              Prints never crack, peel, or stiffen across hundreds of ocean voyages.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              <ShieldCheck size={20} className={styles.pillarIcon} />
            </div>
            <div className={styles.pillarNumber}>03</div>
            <h3 className={styles.pillarTitle}>RESTRICTED 250-PIECE RUNS</h3>
            <p className={styles.pillarText}>
              Every garment comes finished with an individually hand-stamped numbered woven damask label and a metal authentication pass. Once allocated, patterns are locked into the Grand Line archive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
