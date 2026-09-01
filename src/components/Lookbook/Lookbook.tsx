'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Camera, Sparkles } from 'lucide-react';
import styles from './Lookbook.module.css';

interface LookbookProps {
  onExploreProduct: (productId: string) => void;
}

export const Lookbook: React.FC<LookbookProps> = ({ onExploreProduct }) => {
  return (
    <section id="lookbook" className={styles.section} aria-label="Tokyo Editorial Lookbook">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.superText}>EDITORIAL CAMPAIGN // 2026</span>
            <h2 className={styles.title}>
              NIGHTFALL IN <span className={styles.crimsonText}>SHIN SEKAI.</span>
            </h2>
          </div>
          <p className={styles.leadText}>
            Shot on location in the rain-slicked backstreets of Shibuya and the Grand Line gateway.
            Heavyweight cuts engineered to withstand the storm.
          </p>
        </div>

        {/* Asymmetrical Editorial Magazine Spread */}
        <div className={styles.magazineGrid}>
          {/* Main Hero Shot */}
          <div className={styles.heroCampaignCard}>
            <div className={styles.imageContainer}>
              <Image
                src="/images/lookbook-night.jpg"
                alt="Tokyo Nightfall Grand Line Streetwear Campaign"
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className={styles.campaignImg}
              />
              <div className={styles.overlayGradient} />

              {/* Interactive Tag 1 */}
              <div className={styles.hotspotOne} onClick={() => onExploreProduct('nika-01')}>
                <div className={styles.hotspotDot} />
                <div className={styles.hotspotPopup}>
                  <strong>SUN GOD VINTAGE TEE</strong>
                  <span>500 GSM // $95 USD</span>
                </div>
              </div>

              {/* Interactive Tag 2 */}
              <div className={styles.hotspotTwo} onClick={() => onExploreProduct('shanks-04')}>
                <div className={styles.hotspotDot} />
                <div className={styles.hotspotPopup}>
                  <strong>CONQUEROR HOODED CUT</strong>
                  <span>470 GSM // $90 USD</span>
                </div>
              </div>

              {/* Editorial Caption Badge */}
              <div className={styles.campaignBadge}>
                <Camera size={13} />
                <span>EXPEDITION NO. 01 // SHIBUYA ALLEYWAYS</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div>
                <span className={styles.metaLabel}>LOCATION</span>
                <strong className={styles.metaValue}>SECTOR 04 // RAIN SLICK TOKYO</strong>
              </div>
              <button
                className={styles.exploreBtn}
                onClick={() => onExploreProduct('nika-01')}
              >
                <span>SHOP THIS LOOK</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>

          {/* Secondary Macro Craft Detail */}
          <div className={styles.secondaryCraftCard}>
            <div className={styles.craftImageWrapper}>
              <Image
                src="/images/lookbook-craft.jpg"
                alt="Macro 500 GSM Loopback Weave and Puff Print Detail"
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                className={styles.craftImg}
              />
              <div className={styles.craftBadge}>
                <Sparkles size={12} />
                <span>TACTILE DENSITY SPEC</span>
              </div>
            </div>

            <div className={styles.craftContent}>
              <span className={styles.craftSuper}>ARCHIVAL TEXTILE</span>
              <h3 className={styles.craftTitle}>THE 500 GSM JAPANESE LOOPBACK</h3>
              <p className={styles.craftDesc}>
                Double-needle reinforced collar, vintage garment wash, and high-density puff screen print
                that creates authentic dimensional shadow under low illumination.
              </p>
              <div className={styles.craftSpecs}>
                <div className={styles.specRow}>
                  <span>WEAVE</span>
                  <strong>100% Combed Terry</strong>
                </div>
                <div className={styles.specRow}>
                  <span>ORIGIN</span>
                  <strong>Wakayama / Tokyo</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
