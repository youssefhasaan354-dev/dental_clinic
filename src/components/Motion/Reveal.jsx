import React from 'react';
import { motion } from 'framer-motion';

export const Reveal = ({
  children,
  delay = 0,
  y = 28,
  duration = 0.65,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <motion.div
      className={`motion-reveal ${className}`}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
