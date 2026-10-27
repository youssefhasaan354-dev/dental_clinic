import React from 'react';
import { motion } from 'framer-motion';

export const Stagger = ({
  children,
  staggerDelay = 0.08,
  delayChildren = 0.1,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <motion.div
      className={`motion-stagger ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
        hidden: {},
      }}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  y = 24,
  duration = 0.55,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <motion.div
      className={`motion-stagger-item ${className}`}
      variants={{
        hidden: { opacity: 0, y, filter: 'blur(4px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Stagger;
