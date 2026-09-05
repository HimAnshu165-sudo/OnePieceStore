'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowDownRight, Compass } from 'lucide-react';
import styles from './Hero.module.css';

/**
 * 2D DIRECTIONAL TIMELINE SYSTEM
 *
 * Maps 2D pointer coordinates (X, Y) relative to the hero center
 * into continuous 360-degree head rotation timestamps.
 *
 * Angle reference in browser coordinates (where Y grows downward):
 * - RIGHT:       angle = 0 rad (0 deg)
 * - DOWN-RIGHT:  angle = +PI/4 rad (+45 deg)
 * - DOWN:        angle = +PI/2 rad (+90 deg)
 * - DOWN-LEFT:   angle = +3PI/4 rad (+135 deg)
 * - LEFT:        angle = +/- PI rad (+/- 180 deg)
 * - UP-LEFT:     angle = -3PI/4 rad (-135 deg)
 * - UP:          angle = -PI/2 rad (-90 deg)
 * - UP-RIGHT:    angle = -PI/4 rad (-45 deg)
 */

interface DirectionKeyframe {
  angle: number; // in radians [-PI, PI]
  time: number;  // timestamp in video (seconds)
}

// Measured keyframe positions across the 10s 360-degree rotation animation
const KEYFRAMES: DirectionKeyframe[] = [
  { angle: 0, time: 5.5 },                    // RIGHT (0 deg)
  { angle: Math.PI * 0.25, time: 6.5 },       // DOWN-RIGHT (+45 deg)
  { angle: Math.PI * 0.5, time: 7.5 },        // DOWN (+90 deg)
  { angle: Math.PI * 0.75, time: 8.5 },       // DOWN-LEFT (+135 deg)
  { angle: Math.PI, time: 2.0 },              // LEFT (+180 deg)
  { angle: -Math.PI, time: 2.0 },             // LEFT (-180 deg)
  { angle: -Math.PI * 0.75, time: 2.75 },     // UP-LEFT (-135 deg)
  { angle: -Math.PI * 0.5, time: 3.5 },       // UP (-90 deg)
  { angle: -Math.PI * 0.25, time: 4.5 },      // UP-RIGHT (-45 deg)
];

const TIME_CENTER = 0.0; // Neutral forward-facing rest frame

/**
 * Calculates continuous directional video time from 2D normalized vector (nx, ny)
 */
const get2DVideoTime = (nx: number, ny: number): number => {
  const distance = Math.sqrt(nx * nx + ny * ny);

  // Center dead zone: subtle 6% radius around center
  if (distance < 0.06) {
    return TIME_CENTER;
  }

  // Calculate 2D angle in [-PI, PI]
  const angle = Math.atan2(ny, nx);

  // Sort keyframes by angle to find the two bounding directions
  const sorted = [...KEYFRAMES].sort((a, b) => a.angle - b.angle);

  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (angle >= sorted[i].angle && angle <= sorted[i + 1].angle) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  // Interpolate along the directional arc between lower and upper keyframes
  const span = upper.angle - lower.angle;
  const ratio = span === 0 ? 0 : (angle - lower.angle) / span;
  const directionalTime = lower.time + ratio * (upper.time - lower.time);

  // Blend with center based on distance intensity (subtle near center, full at perimeter)
  const intensity = Math.min(1.0, (distance - 0.06) / 0.7);
  return TIME_CENTER + (directionalTime - TIME_CENTER) * intensity;
};

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // 2D tracking refs (zero React state overhead for 60fps tracking)
  const targetTimeRef = useRef<number>(TIME_CENTER);
  const isInteractingRef = useRef<boolean>(false);
  const isTouchActiveRef = useRef<boolean>(false);

  // Accessibility state
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  // Continuous frame loop: instant updates during interaction, gentle settle on mouse leave
  const startFrameLoop = useCallback(() => {
    if (rafIdRef.current) return;

    const loop = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const target = targetTimeRef.current;
        const current = video.currentTime;
        const diff = target - current;

        if (isInteractingRef.current) {
          // DIRECT TRACKING: Immediate frame assignment with zero delay
          if (Math.abs(diff) > 0.008) {
            const clamped = Math.max(0, Math.min(video.duration - 0.02, target));
            try {
              video.currentTime = clamped;
            } catch (err) {}
          }
        } else {
          // MOUSE LEAVE: Smooth return to center
          if (Math.abs(diff) > 0.01) {
            const next = current + diff * 0.15;
            const clamped = Math.max(0, Math.min(video.duration - 0.02, next));
            try {
              video.currentTime = clamped;
            } catch (err) {}
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    queueMicrotask(() => {
      setIsReducedMotion(mediaQuery.matches);
    });

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.currentTime = TIME_CENTER;
      }
    };
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    const video = videoRef.current;
    if (video) {
      // STRICT REQUIREMENT: Keep paused at all times. Never call play().
      video.pause();

      const initCenterFrame = () => {
        targetTimeRef.current = TIME_CENTER;
        try {
          video.currentTime = TIME_CENTER;
        } catch (err) {}
      };

      if (video.readyState >= 1) {
        initCenterFrame();
      } else {
        video.addEventListener('loadedmetadata', initCenterFrame);
      }

      if (!mediaQuery.matches) {
        startFrameLoop();
      }

      return () => {
        video.removeEventListener('loadedmetadata', initCenterFrame);
        mediaQuery.removeEventListener('change', handleReducedMotionChange);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }
  }, [startFrameLoop]);

  // 2D Pointer Movement Tracking (Hero Bounded)
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (isReducedMotion || !videoRef.current) return;

    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 2D offset from hero center
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    // Normalized to [-1, 1]
    const nx = Math.max(-1, Math.min(1, x / (rect.width / 2)));
    const ny = Math.max(-1, Math.min(1, y / (rect.height / 2)));

    const directTime = get2DVideoTime(nx, ny);
    targetTimeRef.current = directTime;
    isInteractingRef.current = true;

    // Apply immediately to eliminate perceptible latency
    try {
      videoRef.current.currentTime = directTime;
    } catch (err) {}
  };

  // Mouse leave: smooth return to center
  const handlePointerLeave = () => {
    if (isReducedMotion || !videoRef.current) return;
    targetTimeRef.current = TIME_CENTER;
    isInteractingRef.current = false;
  };

  // 2D Touch handling for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (isReducedMotion || !videoRef.current) return;
    if (e.touches.length === 1) {
      isTouchActiveRef.current = true;
      isInteractingRef.current = true;
      const hero = heroRef.current;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const nx = Math.max(-1, Math.min(1, (e.touches[0].clientX - centerX) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.touches[0].clientY - centerY) / (rect.height / 2)));
        const directTime = get2DVideoTime(nx, ny);
        targetTimeRef.current = directTime;
        try {
          videoRef.current.currentTime = directTime;
        } catch (err) {}
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!isTouchActiveRef.current || isReducedMotion || !videoRef.current) return;
    if (e.touches.length === 1) {
      const hero = heroRef.current;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const nx = Math.max(-1, Math.min(1, (e.touches[0].clientX - centerX) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.touches[0].clientY - centerY) / (rect.height / 2)));
        const directTime = get2DVideoTime(nx, ny);
        targetTimeRef.current = directTime;
        try {
          videoRef.current.currentTime = directTime;
        } catch (err) {}
      }
    }
  };

  const handleTouchEnd = () => {
    isTouchActiveRef.current = false;
    isInteractingRef.current = false;
    targetTimeRef.current = TIME_CENTER;
  };

  return (
    <section
      ref={heroRef}
      className={styles.heroSection}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Grand Line Streetwear Hero Campaign"
    >
      {/* Background Ambience / Subtle Grid Lines */}
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.vignetteOverlay} aria-hidden="true" />

      {/* Centerpiece: Interactive Character Video (2D Directional Head Tracking) */}
      <div className={styles.videoStage}>
        <video
          ref={videoRef}
          src="/assets/hero-character.mp4"
          className={styles.characterVideo}
          playsInline
          muted
          preload="auto"
          aria-label="Interactive character head rotation timeline directly mapped to 2D cursor position"
        />
        {/* Soft atmospheric aura behind character */}
        <div className={styles.characterGazeAura} aria-hidden="true" />
      </div>

      {/* Editorial UI Layer: Asymmetrical High-Fashion Composition */}
      <div className={styles.editorialContent}>
        
        {/* Top Left Drop Specifier */}
        <div className={styles.topLeftBadge}>
          <div className={styles.badgePill}>
            <span className={styles.pillPulse} />
            <span>EXPEDITION NO. 001</span>
          </div>
          <div className={styles.japaneseSub}>新世界 // 航海ストリートウェア</div>
        </div>

        {/* Top Right Coordinates & Telemetry */}
        <div className={styles.topRightSpecs}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>FABRIC WEAVE</span>
            <span className={styles.specValue}>500 GSM LOOPBACK</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>SILHOUETTE</span>
            <span className={styles.specValue}>TOKYO BOXY DROP</span>
          </div>
        </div>

        {/* Lower Left: Dominant Editorial Statement & CTAs */}
        <div className={styles.lowerLeft}>
          <div className={styles.categorySuper}>SHIN SEKAI ARCHIVE</div>
          <h1 className={styles.mainHeadline}>
            WEAR THE <br />
            <span className={styles.crimsonAccent}>VOYAGE.</span>
          </h1>
          <p className={styles.subStatement}>
            Heavyweight Japanese cotton garments constructed for the pirate king era.
            Limited 250 numbered pieces worldwide.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="#collection" className={styles.primaryCta}>
              <span>EXPLORE DROP 01</span>
              <ArrowDownRight size={18} className={styles.ctaArrow} />
            </Link>
            <Link href="#lookbook" className={styles.secondaryCta}>
              <span>VIEW LOOKBOOK</span>
            </Link>
          </div>
        </div>

        {/* Lower Right: Interactive Hint & Garment Provenance */}
        <div className={styles.lowerRight}>
          <div className={styles.interactiveIndicator}>
            <Compass size={14} className={styles.compassIcon} />
            <span className={styles.indicatorText}>360° CURSOR HEAD TRACKING</span>
          </div>
          <div className={styles.provenanceBlock}>
            <div className={styles.provenanceRow}>
              <span>ORIGIN</span>
              <strong>TOKYO // EAST BLUE</strong>
            </div>
            <div className={styles.provenanceRow}>
              <span>PRINT DENSITY</span>
              <strong>HIGH DENSITY PUFF</strong>
            </div>
            <div className={styles.provenanceRow}>
              <span>STATUS</span>
              <strong className={styles.statusLive}>ALLOCATED & READY</strong>
            </div>
          </div>
        </div>

        {/* Giant Atmospheric Watermark Typography in Background */}
        <div className={styles.backgroundTypography} aria-hidden="true">
          GRAND LINE
        </div>
      </div>
    </section>
  );
};
