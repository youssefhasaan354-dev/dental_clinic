import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { FAQS } from '../../data/faq';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiPlus, FiMinus, FiHelpCircle } from 'react-icons/fi';
import './Faq.scss';

const Faq = ({ limit = 6 }) => {
  const { t, language } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const displayedFaqs = limit ? FAQS.slice(0, limit) : FAQS;

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq-interactive-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={t('faq.sectionSub')}
          title={t('faq.sectionTitle')}
          description={t('faq.sectionDesc')}
          align="center"
        />

        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="faq-accordion-group">
              {displayedFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <div
                    key={faq.id}
                    className={`faq-item-card ${isOpen ? 'is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleItem(idx)}
                      aria-expanded={isOpen}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <FiHelpCircle className="faq-q-icon" />
                        <span className="faq-question-text">
                          {language === 'ar' ? faq.q.ar : faq.q.en}
                        </span>
                      </div>
                      <div className="faq-toggle-icon">
                        {isOpen ? <FiMinus /> : <FiPlus />}
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          className="faq-answer-collapse"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="faq-answer-inner">
                            <p className="faq-answer-text">
                              {language === 'ar' ? faq.a.ar : faq.a.en}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
