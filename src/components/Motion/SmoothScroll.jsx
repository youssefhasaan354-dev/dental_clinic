import React, { useEffect } from 'react';
import Lenis from 'lenis';

export const SmoothScroll = ({ children }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect accessibility & low-end touch devices
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const isTouch = window.matchMedia?.('(pointer: coarse)')?.matches;

    if (prefersReduced || isTouch) return;

    let lenis;
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
      });
      window.__lenis = lenis;
    } catch (e) {
      console.warn('[SmoothScroll] Lenis initialization skipped:', e);
      return;
    }

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      delete window.__lenis;
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
