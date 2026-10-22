import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { IMAGES } from '../../data/images';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import { FiCheckCircle, FiShield, FiHeart, FiClock } from 'react-icons/fi';
import './Expert.scss';

const Expert = () => {
  const { t, language } = useTranslation();

  const qualityPoints = [
    { text: t('expert.point1'), icon: <FiShield /> },
    { text: t('expert.point2'), icon: <FiCheckCircle /> },
    { text: t('expert.point3'), icon: <FiClock /> },
    { text: t('expert.point4'), icon: <FiHeart /> },
  ];

  return (
    <section className="expert-about-section section-bg section-common pt-100 pb-70 my-5">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Column 1: Clinic Story & Strengths */}
          <div className="col-lg-6">
            <motion.div
              className="expert-story-text"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionTitle
                subTitle={t('expert.sectionSub')}
                title={t('expert.sectionTitle')}
                align="start"
                className="mb-4"
              />

              <p className="expert-lead-p">
                {t('expert.desc1')}
              </p>

              <p className="expert-secondary-p">
                {t('expert.desc2')}
              </p>

              <div className="quality-points-grid mt-4">
                {qualityPoints.map((point, idx) => (
                  <div key={idx} className="point-item d-flex align-items-center gap-3 mb-3">
                    <div className="point-icon-badge">{point.icon}</div>
                    <span className="point-text">{point.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Column 2: Imagery */}
          <div className="col-lg-6">
            <motion.div
              className="expert-img-container text-center position-relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <EditableMedia
                slotId="slot-home-expert"
                defaultSrc={IMAGES.sections.expert}
                alt={{ ar: 'تجهيزات وفريق عيادة حياة لطب الأسنان', en: 'Hayaah Dental Clinic Facility & Practitioners' }}
                className="expert-main-img"
                width={520}
                height={500}
              />

              <div className="expert-floating-card glass-card">
                <span className="big-stat">+١٠</span>
                <span className="stat-label">
                  {language === 'ar' ? 'سنوات من الخبرة والثقة المستمرة' : 'Years of Trusted Excellence'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Expert;
