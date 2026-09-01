'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Layers, ShieldCheck, Cpu, Droplet, Scissors } from 'lucide-react';
import styles from './BrandStory.module.css';

const CRAFT_FEATURES = [
  {
    num: '01',
    jpLabel: '生地 — FABRIC',
    title: 'JAPANESE HEAVYWEIGHT COTTON',
    desc: 'Custom-knit 500 GSM loopback cotton from Wakayama, engineered for architectural boxy drape, dense hand-feel, and generational durability.',
    image: '/images/detail-embroidery-nika.jpg',
    spec: '500 GSM // WAKAYAMA KNIT',
    attributes: ['100% Long-Staple Cotton', 'Enzyme Pre-Shrunk', 'Anti-Sag Collar']
  },
  {
    num: '02',
    jpLabel: '印刷 — PRINT',
    title: 'CRAFTED GRAPHICS & PUFF PRINT',
    desc: 'Multi-layer discharge printing and 3D tactile puff ink that fuses into the fabric grain without cracking, fading, or stiffening with wear.',
    image: '/images/detail-wano-dragon.jpg',
    spec: 'DISCHARGE & 3D PUFF INK',
    attributes: ['Discharge Pigment Extraction', 'Tactile Dimensional Ink', 'Ukiyo-e Woodblock Grain']
  },
  {
    num: '03',
    jpLabel: '限定 — LIMITED',
    title: 'NUMBERED EDITIONS',
    desc: 'Strict restricted production batches of 250 individually numbered units. Once allocated, patterns and garment dies are locked forever.',
    image: '/images/detail-woven-label.jpg',
    spec: 'RESTRICTED TO 250 PIECES',
    attributes: ['Damask Woven Label', 'Individually Serialized', 'Zero Re-Issue Policy']
  },
];

const ARCHIVAL_DATA_POINTS = [
  {
    label: 'LOOM TYPE',
    value: 'VINTAGE TSURIEKI LOOPWHEEL',
    sub: 'WAKAYAMA, JAPAN // 1 METRE PER HOUR'
  },
  {
    label: 'DYE PROCESS',
    value: 'DISCHARGE MINERAL PIGMENT',
    sub: 'KOJIMA ENZYME BATH // COLORFAST'
  },
  {
    label: 'COLLAR REINFORCEMENT',
    value: '1.25" HEAVYWEIGHT 2X2 RIB',
    sub: 'DOUBLE-NEEDLE FLATLOCK SEAMS'
  },
  {
    label: 'ALLOCATION MODEL',
    value: '250 SERIALIZED UNITS PER DROP',
    sub: 'NEVER REPRODUCED // ARCHIVE ONLY'
  }
];

export const BrandStory: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      {/* SECTION 1 — REDESIGNED THREE HORIZONTAL FEATURE PANELS */}
      <section id="craft" className={styles.featureSection} aria-label="Craftsmanship Philosophy">
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.eyebrow}>
              <span className={styles.crimsonDot} />
              <span>THE ARCHIVAL STANDARD // 職人技術</span>
            </div>
            <h2 className={styles.sectionTitle}>
              ENGINEERED WITH RESTRAINT.
            </h2>
            <p className={styles.sectionSubtitle}>
              Three founding principles behind every garment crafted for the Shin Sekai archive.
            </p>
          </motion.div>

          <div className={styles.featureGrid}>
            {CRAFT_FEATURES.map((item, idx) => (
              <motion.div
                key={item.num}
                className={styles.featurePanel}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.panelTop}>
                  <span className={styles.panelNum}>{item.num}</span>
                  <span className={styles.panelJpLabel}>{item.jpLabel}</span>
                </div>

                <div className={styles.panelImageWrapper} style={{ position: 'relative' }}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.panelImg}
                  />
                  <div className={styles.panelImgOverlay} />
                  <span className={styles.panelSpecBadge}>{item.spec}</span>
                </div>

                <div className={styles.panelContent}>
                  <h3 className={styles.panelTitle}>{item.title}</h3>
                  <p className={styles.panelDesc}>{item.desc}</p>
                  
                  <div className={styles.panelAttributes}>
                    {item.attributes.map((attr, aIdx) => (
                      <span key={aIdx} className={styles.attrPill}>{attr}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2 — JAPANESE CRAFT / MATERIAL STORY: FROM FABRIC TO FORM */}
      <section className={styles.materialSection} aria-label="From Fabric to Form Material Story">
        <div className={styles.container}>
          <div className={styles.materialGrid}>
            {/* Left: Craftsmanship Visual */}
            <motion.div
              className={styles.materialImageCard}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.materialImageWrapper} style={{ position: 'relative' }}>
                <Image
                  src="/images/lookbook-craft.jpg"
                  alt="Japanese Loopback Cotton Textile Craftsmanship"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={styles.materialImg}
                />
                <div className={styles.materialImageGradient} />
                <div className={styles.materialImageBadge}>
                  <Sparkles size={13} />
                  <span>WAKAYAMA TERRY // ARCHIVE TEXTILE</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Construction Philosophy & Specs */}
            <motion.div
              className={styles.materialTextCol}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.materialHeader}>
                <span className={styles.materialSuper}>生地から形へ // FROM FABRIC TO FORM</span>
                <h3 className={styles.materialHeadline}>
                  “Built with intention, <br />
                  <span className={styles.crimsonAccent}>not excess.”</span>
                </h3>
              </div>

              <p className={styles.materialLead}>
                Every piece begins with weight, proportion, and movement. From dense cotton to oversized silhouettes, each detail is chosen to create garments that feel structured, lived-in, and unmistakably individual.
              </p>

              {/* Technical Specifications Grid */}
              <div className={styles.specGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>WEIGHT</span>
                  <strong className={styles.specValue}>500 GSM</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>FIT</span>
                  <strong className={styles.specValue}>RELAXED / OVERSIZED</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>PRODUCTION</span>
                  <strong className={styles.specValue}>LIMITED RUN (250)</strong>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>ORIGIN</span>
                  <strong className={styles.specValue}>TOKYO INSPIRED</strong>
                </div>
              </div>

              {/* Rich Technical Telemetry Data Table */}
              <div className={styles.telemetryTable}>
                {ARCHIVAL_DATA_POINTS.map((pt, pIdx) => (
                  <div key={pIdx} className={styles.telemetryRow}>
                    <div className={styles.telemetryKey}>{pt.label}</div>
                    <div className={styles.telemetryValWrap}>
                      <span className={styles.telemetryVal}>{pt.value}</span>
                      <span className={styles.telemetrySub}>{pt.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — CINEMATIC FULL-WIDTH VISUAL BREAK */}
      <section className={styles.visualBreakSection} aria-label="Tokyo Cinematic Visual Statement">
        <div className={styles.visualBreakWrapper} style={{ position: 'relative' }}>
          <Image
            src="/images/collection-red-hair.jpg"
            alt="Tokyo Nightfall Streetwear Cinematic Visual"
            fill
            sizes="100vw"
            className={styles.visualBreakImg}
          />
          <div className={styles.visualBreakScrim} />
          
          <motion.div
            className={styles.visualBreakContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.visualBreakSuper}>SHIBUYA TRANSIT // 23:45 JST</span>
            <h2 className={styles.visualBreakTitle}>
              TOKYO IS NOT A TREND.
            </h2>
            <p className={styles.visualBreakSubtitle}>
              It is a language.
            </p>
            <div className={styles.visualBreakJp}>
              東京は流行ではない。文化である。
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
