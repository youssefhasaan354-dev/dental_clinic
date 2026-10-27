import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ParallaxImage = ({
  children,
  offset = 8,
  className = '',
  style = {},
  ...props
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`-${offset}%`, `${offset}%`]);

  return (
    <div
      ref={containerRef}
      className={`motion-parallax-frame ${className}`}
      style={{ overflow: 'hidden', position: 'relative', ...style }}
      {...props}
    >
      <motion.div style={{ y, width: '100%', height: '100%' }}>
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxImage;
