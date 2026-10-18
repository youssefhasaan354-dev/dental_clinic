import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiPlus, FiMinus, FiHelpCircle, FiInfo } from 'react-icons/fi';
import './Faq.scss';

const Faq = ({ limit = 6 }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { faqs } = useData();
  const [openIndex, setOpenIndex] = useState(0);

  const isAr = language === 'ar';
  const displayedFaqs = limit ? faqs.slice(0, limit) : faqs;

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq-interactive-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={isAr ? 'إجابات واضحة' : 'Clear Answers'}
          title={isAr ? 'الأسئلة الشائعة حول الكشف والعلاج' : 'Frequently Asked Questions'}
          description={
            isAr
              ? 'إجابات مباشرة ومطمئنة لأكثر الاستفسارات تكراراً لدى مراجعي عيادة حياة لطب الأسنان.'
              : 'Direct, reassuring information answering common patient inquiries.'
          }
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
                    className={`faq-item-card mb-3 rounded-4 bg-white border shadow-sm overflow-hidden ${isOpen ? 'is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn w-100 p-3 px-4 d-flex align-items-center justify-content-between text-start border-0 bg-transparent"
                      onClick={() => toggleItem(idx)}
                      aria-expanded={isOpen}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <FiHelpCircle className="faq-q-icon text-primary flex-shrink-0" size={20} />
                        <span className="faq-question-text fw-bold text-dark">
                          {isAr ? faq.question.ar : faq.question.en}
                        </span>
                        {faq.isSample && (
                          <span className="badge bg-light text-muted border small ms-2" style={{ fontSize: '0.7rem' }}>
                            {isAr ? 'سؤال استرشادي (Sample)' : 'Sample Question'}
                          </span>
                        )}
                      </div>
                      <div className="faq-toggle-icon text-muted">
                        {isOpen ? <FiMinus size={18} /> : <FiPlus size={18} />}
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
                          <div className="faq-answer-inner px-4 pb-4 pt-1 text-secondary" style={{ lineHeight: '1.8' }}>
                            <p className="faq-answer-text mb-0">
                              {isAr ? faq.answer.ar : faq.answer.en}
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
