'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, CategoryFilterType, SortOption } from '@/types';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter/CategoryFilter';
import { ImageLightbox, LightboxImage } from '@/components/ImageLightbox/ImageLightbox';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import styles from './ProductRail.module.css';

interface ProductRailProps {
  onOpenQuickView: (product: Product) => void;
  products?: Product[];
}

const COLLECTION_STORIES = [
  {
    id: 'east_blue',
    num: 'STORY 01',
    title: 'EAST BLUE // BEGINNING',
    japanese: '東の海 // 始動',
    mood: 'Clean • Optimistic • Minimalist Japanese Streetwear',
    image: '/images/collection-east-blue.jpg',
    crew: 'STRAW_HAT' as CategoryFilterType,
  },
  {
    id: 'grand_line',
    num: 'STORY 02',
    title: 'GRAND LINE // MOTION',
    japanese: '偉大なる航路 // 躍動',
    mood: 'Tactical Silhouettes • Industrial Tokyo Harbor',
    image: '/images/collection-grand-line.jpg',
    crew: 'ALL' as CategoryFilterType,
  },
  {
    id: 'red_hair',
    num: 'STORY 03',
    title: 'RED HAIR // MIDNIGHT',
    japanese: '赤髪 // 深夜',
    mood: 'Dark Obsidian • Deep Crimson Details • Tokyo Night',
    image: '/images/collection-red-hair.jpg',
    crew: 'RED_HAIR' as CategoryFilterType,
  },
  {
    id: 'marine',
    num: 'STORY 04',
    title: 'MARINE // STRUCTURE',
    japanese: '海軍 // 構築',
    mood: 'Architectural Cuts • Structured Nautical Typography',
    image: '/images/editorial-marine-trench.jpg',
    crew: 'MARINE' as CategoryFilterType,
  },
  {
    id: 'wano',
    num: 'STORY 05',
    title: 'WANO // CRAFT',
    japanese: 'ワノ国 // 工芸',
    mood: 'Ukiyo-e Woodblock Prints • Sashiko Craftsmanship',
    image: '/images/detail-wano-dragon.jpg',
    crew: 'WANO' as CategoryFilterType,
  },
];

const LIGHTBOX_GALLERY: LightboxImage[] = [
  {
    src: '/images/collection-east-blue.jpg',
    title: 'EAST BLUE HORIZON',
    category: 'STORY 01 // CAMPAIGN',
    location: 'TOKYO HARBOR PIER // 06:00 JST',
    story: 'Tranquil dawn horizons inspiring the clean, optimistic minimalism of the East Blue collection.'
  },
  {
    src: '/images/collection-grand-line.jpg',
    title: 'GRAND LINE INDUSTRIAL FREIGHT',
    category: 'STORY 02 // CAMPAIGN',
    location: 'SHINAGAWA FREIGHT YARD // 18:30 JST',
    story: 'Heavyweight loopback cotton and tactical cargo silhouettes built for continuous global transit.'
  },
  {
    src: '/images/collection-red-hair.jpg',
    title: 'RED HAIR MIDNIGHT VOYAGE',
    category: 'STORY 03 // CAMPAIGN',
    location: 'SHIBUYA ALLEYWAYS // 23:45 JST',
    story: 'Enzyme-washed deep crimson hues cutting through rainy neon reflections in Shibuya.'
  },
  {
    src: '/images/detail-embroidery-nika.jpg',
    title: 'SUN GOD METALLIC EMBROIDERY',
    category: 'GARMENT SPEC // DETAIL',
    location: 'TOKYO ATELIER // 500 GSM',
    story: 'Intricate metallic gold and silk thread embroidery forming the mythological warrior crest.'
  },
  {
    src: '/images/detail-wano-dragon.jpg',
    title: 'WANO AZURE DRAGON PUFF PRINT',
    category: 'GARMENT SPEC // DETAIL',
    location: 'KYOTO TEXTILE WORKSHOP',
    story: 'Multi-layer tactile discharge screen print with authentic vermilion red Hanko seal stamp.'
  },
  {
    src: '/images/detail-woven-label.jpg',
    title: 'DAMASK WOVEN ARCHIVE LABEL',
    category: 'GARMENT SPEC // DETAIL',
    location: 'GRAND LINE SUPPLY CO.',
    story: 'High-density satin woven label stitched into every limited-edition numbered piece.'
  }
];

export const ProductRail: React.FC<ProductRailProps> = ({ onOpenQuickView }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterType>('ALL');
  const [activeSort, setActiveSort] = useState<SortOption>('FEATURED');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    if (activeCategory !== 'ALL') {
      result = result.filter((p) => p.crew === activeCategory);
    }

    switch (activeSort) {
      case 'PRICE_LOW':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'PRICE_HIGH':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'GSM':
        result.sort((a, b) => b.gsm - a.gsm);
        break;
      case 'NEWEST':
        result.sort((a, b) => (b.isNewDrop ? 1 : 0) - (a.isNewDrop ? 1 : 0));
        break;
      default:
        // FEATURED
        break;
    }

    return result;
  }, [PRODUCTS, activeCategory, activeSort]);

  return (
    <section id="collection" className={styles.section} aria-label="Streetwear Collection Archive">
      {/* Background Japanese Watermark */}
      <div className={styles.bgWatermark} aria-hidden="true">
        001
      </div>

      <div className={styles.innerContainer}>
        {/* 01 — Collection Intro */}
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.crimsonDot} />
              <span>01 / THE CURRENT DROP</span>
            </div>

            <h2 className={styles.headerTitle}>
              CURATED FOR <br />
              <span className={styles.crimsonAccent}>THE JOURNEY.</span>
            </h2>

            <p className={styles.headerSubtitle}>
              Limited pieces shaped by Japanese street culture, <br />
              designed for movement beyond the everyday.
            </p>
          </div>

          {/* 02 — Premium Collection Detail (Garment Archival Stamp) */}
          <div className={styles.headerRight}>
            <div className={styles.editorialGarmentTag}>
              <span className={styles.hankoSeal}>新世界</span>
              <div className={styles.tagContent}>
                <span className={styles.tagTitle}>LIMITED RELEASE // ARCHIVE 001</span>
                <span className={styles.tagSubtitle}>500 GSM HEAVYWEIGHT • TOKYO CRAFT</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5 Visual Collection Stories Strip */}
        <div className={styles.storiesContainer}>
          <div className={styles.storiesHeader}>
            <span className={styles.storiesSuper}>ARCHIVAL NARRATIVES // 5 COLLECTION CHAPTERS</span>
            <span className={styles.storiesHint}>CLICK STORY TO EXPLORE</span>
          </div>

          <div className={styles.storiesTrack}>
            {COLLECTION_STORIES.map((story, idx) => (
              <div
                key={story.id}
                className={`${styles.storyCard} ${activeCategory === story.crew ? styles.activeStoryCard : ''}`}
                onClick={() => {
                  if (story.crew !== 'ALL') setActiveCategory(story.crew);
                  else setActiveCategory('ALL');
                }}
              >
                <div className={styles.storyImgWrapper} style={{ position: 'relative' }}>
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className={styles.storyImg}
                  />
                  <div className={styles.storyOverlay} />
                  <span className={styles.storyNum}>{story.num}</span>
                </div>
                <div className={styles.storyMeta}>
                  <h4 className={styles.storyTitle}>{story.title}</h4>
                  <span className={styles.storyJapanese}>{story.japanese}</span>
                  <p className={styles.storyMood}>{story.mood}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 03 & 04 — Category Filter Controls & Count */}
        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          activeSort={activeSort}
          onSelectSort={setActiveSort}
          totalProductsCount={PRODUCTS.length}
          filteredCount={filteredProducts.length}
        />

        {/* 06 — Product Editorial Grid */}
        <motion.div
          className={styles.productGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard
                  product={product}
                  onOpenQuickView={onOpenQuickView}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Editorial Visual Break 01 */}
        <motion.div
          className={styles.editorialBreak}
          onClick={() => setLightboxIndex(0)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.breakImageWrapper} style={{ position: 'relative' }}>
            <Image
              src="/images/collection-east-blue.jpg"
              alt="East Blue Horizon Tokyo Campaign"
              fill
              sizes="100vw"
              className={styles.breakImg}
            />
            <div className={styles.breakGradient} />
            <div className={styles.breakContent}>
              <div className={styles.breakBadge}>
                <Compass size={12} />
                <span>EXPEDITION SERIES // 001</span>
              </div>
              <h3 className={styles.breakHeadline}>THE JOURNEY CONTINUES.</h3>
              <p className={styles.breakCopy}>
                Crafted in Tokyo. Engineered for every horizon ahead.
              </p>
              <div className={styles.breakAction}>
                <span>EXPAND CAMPAIGN VISUAL</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      <ImageLightbox
        images={LIGHTBOX_GALLERY}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </section>
  );
};




