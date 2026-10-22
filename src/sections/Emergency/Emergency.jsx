import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import { FiPhoneCall, FiAlertCircle, FiShield } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import emergencyImg from '../../assets/emergency.png';
import './Emergency.scss';

const Emergency = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { clinicInfo } = useData();

  const isAr = language === 'ar';

  const emergencyWhatsAppMsg = isAr
    ? 'مرحباً، لدي حالة طوارئ أسنان عاجلة وأحتاج مساعدة سريعة في العيادة.'
    : 'Hello, I have an urgent dental emergency and need prompt evaluation.';

  const emergencyPhone = clinicInfo?.emergencyPhone || clinicInfo?.phone || '02 2635 5669';
  const telLink = `tel:${emergencyPhone.replace(/\s+/g, '')}`;

  return (
    <section className="emergency-section section-common py-5 my-5">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div
              className="emergency-img-wrapper"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <EditableMedia
                slotId="slot-emergency"
                defaultSrc={emergencyImg}
                alt={{ ar: 'طوارئ الأسنان - عيادة حياة', en: 'Dental Emergency - Hayaah Clinic' }}
                className="emergency-image"
                width={500}
                height={450}
                style={{ borderRadius: '16px' }}
              />
            </motion.div>
          </div>

          <div className="col-lg-6">
            <motion.div
              className="emergency-text-content"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="emergency-alert-tag d-inline-flex align-items-center gap-2 mb-3">
                <FiAlertCircle />
                <span>{isAr ? 'ألم الأسنان الحاد والطوارئ' : 'Urgent Pain & Dental Emergency'}</span>
              </div>

              <h2 className="emergency-heading">
                {isAr
                  ? 'رعاية سريعة وموجهة لحالات الألم الحاد'
                  : 'Prompt, Focused Care for Acute Dental Pain'}
              </h2>

              <p className="emergency-description">
                {isAr
                  ? 'إذا كنت تعاني من ألم مفاجئ، كسر في السن أو تورم مقلق أثناء ساعات العمل، اتصل بنا فوراً لنرتب لك فحصاً عاجلاً لتسكين الألم وحماية السن.'
                  : 'If you experience sudden severe pain, tooth fracture, or acute swelling during working hours, contact us immediately so we can prioritize your clinical evaluation.'}
              </p>

              <div className="emergency-actions d-flex flex-wrap gap-3 mt-4">
                <a
                  href={telLink}
                  className="btn-emergency-call d-inline-flex align-items-center gap-2"
                >
                  <FiPhoneCall className="icon-ring" />
                  <span>{isAr ? 'اتصل بالعيادة' : 'Call Clinic'}: {emergencyPhone}</span>
                </a>

                <a
                  href={`https://wa.me/${clinicInfo?.whatsapp?.replace(/[^0-9]/g, '') || '20226355669'}?text=${encodeURIComponent(emergencyWhatsAppMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-emergency-whatsapp d-inline-flex align-items-center gap-2"
                >
                  <FaWhatsapp />
                  <span>{isAr ? 'واتساب الطوارئ' : 'Emergency WhatsApp'}</span>
                </a>
              </div>

              {/* National Emergency Directive per Golden Rule 14 */}
              <div className="alert alert-danger d-flex align-items-start gap-2 mt-4 p-3 rounded-3" style={{ fontSize: '0.85rem' }}>
                <FiShield className="flex-shrink-0 mt-1" />
                <div>
                  <strong>{isAr ? 'توجيه طوارئ وطني:' : 'National Emergency Notice:'}</strong>{' '}
                  {isAr
                    ? (clinicInfo?.emergencyNotice?.ar || 'في حالات الطوارئ الطبية التي تهدد الحياة يرجى التوجه فوراً لأقرب مستشفى أو الاتصال بالإسعاف المصري على الرقم 123.')
                    : (clinicInfo?.emergencyNotice?.en || 'For life-threatening medical emergencies, go to the nearest hospital ER or call Egyptian Ambulance at 123.')}
                </div>
              </div>

              <p className="emergency-hours-note mt-2 text-muted">
                <small>
                  {isAr
                    ? (clinicInfo?.emergencyHoursNote?.ar || 'ساعات عمل العيادة: السبت إلى الخميس من 10 ص حتى 10 م')
                    : (clinicInfo?.emergencyHoursNote?.en || 'Clinic hours: Saturday - Thursday 10:00 AM - 10:00 PM')}
                </small>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Emergency;
