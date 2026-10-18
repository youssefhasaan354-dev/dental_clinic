import React from 'react';
import { motion } from 'framer-motion';
import './SectionTitle.scss';

const SectionTitle = ({ subTitle, title, description, align = 'center', className = '' }) => {
  return (
    <motion.div
      className={`section-title-wrapper text-${align} ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {subTitle && (
        <span className="section-subtitle-badge">
          <span className="badge-sparkle">✦</span>
          {subTitle}
        </span>
      )}
      {title && <h2 className="section-main-title">{title}</h2>}
      {description && <p className="section-description-text">{description}</p>}
    </motion.div>
  );
};

export default SectionTitle;
