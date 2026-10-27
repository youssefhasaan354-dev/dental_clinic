import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{
        scaleX,
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--color-primary, #0E5C2F) 0%, var(--color-accent, #7AC143) 100%)',
        zIndex: 9999,
        transformOrigin: isAr ? '100% 50%' : '0% 50%',
        pointerEvents: 'none',
      }}
    />
  );
};

export default ScrollProgress;
