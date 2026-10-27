import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ScrollScaleSection = ({
  children,
  className = '',
  style = {},
  initialScale = 0.94,
  initialRadius = '36px',
  finalRadius = '0px',
  ...props
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [initialScale, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [initialRadius, finalRadius]);

  return (
    <motion.section
      ref={ref}
      className={`scroll-scale-section ${className}`}
      style={{
        scale,
        borderRadius,
        transformOrigin: '50% 0%',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.section>
  );
};

export default ScrollScaleSection;
