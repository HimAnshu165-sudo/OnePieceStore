'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import styles from './ImageLightbox.module.css';

export interface LightboxImage {
  src: string;
  title: string;
  category: string;
  location?: string;
  story?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < images.length;
  const currentImage = isOpen ? images[currentIndex] : null;

  const handleNext = useCallback(() => {
    if (currentIndex === null) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Editorial Image Viewer"
      >
        {/* Top Header Bar */}
        <div className={styles.topBar} onClick={(e) => e.stopPropagation()}>
          <div className={styles.telemetry}>
            <span className={styles.dot} />
            <span>SHIN SEKAI ARCHIVE // {currentIndex + 1} OF {images.length}</span>
            <span className={styles.jpTag}>新世界</span>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Close image viewer">
            <X size={20} />
          </button>
        </div>

        {/* Center Main Stage */}
        <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
          <button className={styles.navBtnLeft} onClick={handlePrev} aria-label="Previous image">
            <ChevronLeft size={24} />
          </button>

          <motion.div
            key={currentImage.src}
            className={styles.imageWrapper}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={currentImage.src}
              alt={currentImage.title}
              fill
              sizes="(max-width: 1200px) 90vw, 70vw"
              className={styles.mainImg}
              priority
            />
          </motion.div>

          <button className={styles.navBtnRight} onClick={handleNext} aria-label="Next image">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bottom Caption Bar */}
        <div className={styles.captionBar} onClick={(e) => e.stopPropagation()}>
          <div className={styles.captionInfo}>
            <span className={styles.captionCategory}>{currentImage.category}</span>
            <h4 className={styles.captionTitle}>{currentImage.title}</h4>
            {currentImage.location && (
              <span className={styles.captionLocation}>
                <Compass size={12} className={styles.compass} />
                {currentImage.location}
              </span>
            )}
          </div>
          {currentImage.story && (
            <p className={styles.captionStory}>{currentImage.story}</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
