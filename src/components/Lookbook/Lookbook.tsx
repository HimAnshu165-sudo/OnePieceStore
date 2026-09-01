'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Camera, Sparkles, Compass, Maximize2 } from 'lucide-react';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox/ImageLightbox';
import styles from './Lookbook.module.css';

interface LookbookProps {
  onExploreProduct: (productId: string) => void;
}

const LOOKBOOK_GALLERY: {
  id: string;
  num: string;
  title: string;
  crew: string;
  location: string;
  productId: string;
  image: string;
  story: string;
}[] = [
  {
    id: 'look-01',
    num: 'LOOK 01',
    title: 'SUN GOD OVERSIZED HOODIE',
    crew: 'STRAW HAT SYNDICATE',
    location: 'SHIBUYA SECTOR 04 // 22:15 JST',
    productId: 'nika-01',
    image: '/images/editorial-luffy-hoodie.jpg',
    story: 'Heavyweight loopback obsidian fleece paired with wide-leg cargo pants in brutalist concrete Tokyo.'
  },
  {
    id: 'look-02',
    num: 'LOOK 02',
    title: 'WANO RONIN KIMONO JACKET',
    crew: 'WANO ARCHIVE',
    location: 'AOYAMA ATELIER // 15:30 JST',
    productId: 'zoro-02',
    image: '/images/editorial-zoro-wano.jpg',
    story: 'Deep forest moss green silhouette layered over drop-shoulder black base with blade slash embroidery.'
  },
  {
    id: 'look-03',
    num: 'LOOK 03',
    title: 'ROOM FISHTAIL PARKA',
    crew: 'HEART PIRATES',
    location: 'SHINAGAWA DOCKS // 19:40 JST',
    productId: 'law-03',
    image: '/images/editorial-law-parka.jpg',
    story: 'Surgical contrast yellow top-stitching with custom magnetic utility harness and weatherproof shell.'
  },
  {
    id: 'look-04',
    num: 'LOOK 04',
    title: 'CONQUEROR MA-1 BOMBER',
    crew: 'RED HAIR DIVISION',
    location: 'SHINJUKU ALLEYWAY // 23:10 JST',
    productId: 'shanks-04',
    image: '/images/editorial-shanks-bomber.jpg',
    story: 'Enzyme-washed crimson flight satin with triple claw distress marking and heavy ribbing.'
  },
  {
    id: 'look-05',
    num: 'LOOK 05',
    title: 'JUSTICE STRUCTURED TRENCH',
    crew: 'MARINE HEADQUARTERS',
    location: 'GINZA ART GALLERY // 14:00 JST',
    productId: 'marine-05',
    image: '/images/editorial-marine-trench.jpg',
    story: 'Architectural bone off-white unbleached canvas drape with crisp navy nautical typography.'
  },
  {
    id: 'look-06',
    num: 'LOOK 06',
    title: 'BLACK LEG TAILORED BLAZER',
    crew: 'STRAW HAT SYNDICATE',
    location: 'ROPPONGI LOUNGE // 01:20 JST',
    productId: 'sanji-06',
    image: '/images/editorial-sanji-suit.jpg',
    story: 'Double-breasted smoky slate wool-blend with subtle gold metallic flame lapel embroidery.'
  },
];

const LIGHTBOX_LOOKS: LightboxImage[] = LOOKBOOK_GALLERY.map((look) => ({
  src: look.image,
  title: look.title,
  category: `${look.num} // ${look.crew}`,
  location: look.location,
  story: look.story,
}));

export const Lookbook: React.FC<LookbookProps> = ({ onExploreProduct }) => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <section id="lookbook" className={styles.section} aria-label="Tokyo Editorial Lookbook">
      <div className={styles.container}>
        {/* Section Header: IN MOTION */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerTitleBlock}>
            <div className={styles.eyebrow}>
              <span className={styles.crimsonDot} />
              <span>EDITORIAL CAMPAIGN // TOKYO 2026 // 躍動</span>
            </div>
            <h2 className={styles.title}>
              IN MOTION.
            </h2>
            <p className={styles.subtitle}>
              Different cities. One direction.
            </p>
          </div>

          <div className={styles.headerTelemetry}>
            <span className={styles.telemetryTag}>6 HIGH-FASHION LOOKS</span>
            <span className={styles.telemetrySub}>CLICK TO EXPAND HIGH-RES LIGHTBOX</span>
          </div>
        </motion.div>

        {/* 6-Look Horizontal Editorial Visual Sequence */}
        <div className={styles.lookbookSequence}>
          {LOOKBOOK_GALLERY.map((look, index) => (
            <motion.div
              key={look.id}
              className={styles.lookCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={styles.lookImageWrapper}
                style={{ position: 'relative' }}
                onClick={() => setLightboxIdx(index)}
                role="button"
                tabIndex={0}
                aria-label={`Open high-res lightbox for ${look.title}`}
              >
                <Image
                  src={look.image}
                  alt={look.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.lookImg}
                />
                <div className={styles.lookOverlay} />
                
                {/* Look Badge */}
                <div className={styles.lookBadge}>
                  <span>{look.num}</span>
                </div>

                {/* Expand Indicator */}
                <div className={styles.expandTrigger}>
                  <Maximize2 size={13} />
                  <span>VIEW LOOK</span>
                </div>
              </div>

              {/* Look Info Footer */}
              <div className={styles.lookContent}>
                <div className={styles.lookCrew}>{look.crew}</div>
                <h3 className={styles.lookTitle}>{look.title}</h3>
                <div className={styles.lookLocation}>
                  <Compass size={11} className={styles.compassIcon} />
                  <span>{look.location}</span>
                </div>

                <button
                  className={styles.exploreGarmentBtn}
                  onClick={() => onExploreProduct(look.productId)}
                >
                  <span>EXPLORE GARMENT</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Editorial Visual Break 02 */}
        <motion.div
          className={styles.editorialBreak}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.breakImageWrapper} style={{ position: 'relative' }}>
            <Image
              src="/images/collection-grand-line.jpg"
              alt="Grand Line Freight Yard Tokyo Campaign"
              fill
              sizes="100vw"
              className={styles.breakImg}
            />
            <div className={styles.breakGradient} />
            <div className={styles.breakContent}>
              <div className={styles.breakBadge}>
                <Camera size={12} />
                <span>SHIN SEKAI // GRAND LINE SUPPLY CO.</span>
              </div>
              <h3 className={styles.breakHeadline}>BUILT FOR THE NEXT DISTANCE.</h3>
              <p className={styles.breakCopy}>
                500 GSM loopback Japanese cotton engineered for urban exploration and the voyage beyond.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={LIGHTBOX_LOOKS}
        currentIndex={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
        onNavigate={(idx) => setLightboxIdx(idx)}
      />
    </section>
  );
};


