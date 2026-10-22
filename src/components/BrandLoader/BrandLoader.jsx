import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoSvg from '../../assets/logo.svg';
import EditableMedia from '../VisualEdit/EditableMedia';
import './BrandLoader.scss';

const BrandLoader = ({ onFinish }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (onFinish) onFinish();
    }, 900);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="brand-loader-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
        >
          <motion.div
            className="loader-logo-box text-center"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <EditableMedia
              slotId="slot-logo"
              defaultSrc={logoSvg}
              alt={{ ar: 'عيادة حياة لطب الأسنان', en: 'Hayaah Dental Clinic' }}
              className="loader-logo-img"
              width={240}
              height={60}
              inline
            />
            <div className="loader-progress-track mt-4">
              <motion.div
                className="loader-progress-bar"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.85, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandLoader;
