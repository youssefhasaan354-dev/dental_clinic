import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import EditableMedia from '../../components/VisualEdit/EditableMedia';
import { FiCalendar, FiAward, FiGlobe, FiUserCheck } from 'react-icons/fi';
import './Team.scss';

const Team = () => {
  const { language } = useTranslation();
  const { doctors } = useData();
  const navigate = useNavigate();

  const isAr = language === 'ar';

  const handleBookWithDoctor = (docName) => {
    navigate(`/contact?doctor=${encodeURIComponent(docName)}`);
    setTimeout(() => {
      const formEl = document.getElementById('booking-section');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="team-specialists-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={isAr ? 'الكادر الطبي' : 'Clinical Team'}
          title={isAr ? 'أطباء معتمدون ومقيدون بنقابة أطباء الأسنان' : 'Registered Dental Practitioners'}
          description={
            isAr
              ? 'يقوم على علاجك نخبة من أطباء الأسنان المتخصصين وفق أعلى معايير الممارسة الإكلينيكية المعاصرة.'
              : 'Our licensed clinical team provides patient-first dental care adhering to Egyptian syndicate guidelines.'
          }
          align="center"
        />

        <div className="row g-4 justify-content-center">
          {doctors
            .filter((d) => d.isVisible !== false)
            .map((doctor, idx) => (
              <div key={doctor.id} className="col-lg-5 col-md-6">
                <motion.div
                  className="team-card-styled h-100 p-4 rounded-4 bg-white shadow-sm border d-flex flex-column"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <EditableMedia
                      slotId={`slot-doctor-${doctor.id.replace('doc-', '')}`}
                      defaultSrc={doctor.photoUrl || ''}
                      alt={{ ar: doctor.name.ar, en: doctor.name.en }}
                      width={74}
                      height={74}
                      inline
                      style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover' }}
                      fallback={(
                        <div
                          className="doctor-avatar-circle flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '74px',
                            height: '74px',
                            backgroundColor: '#e0f4f4',
                            color: '#0c6674',
                            fontSize: '1.8rem',
                          }}
                        >
                          <FiUserCheck size={36} />
                        </div>
                      )}
                    />
                    <div>
                      <h4 className="h5 fw-bold mb-1 text-dark">
                        {isAr ? doctor.name.ar : doctor.name.en}
                      </h4>
                      <p className="text-primary small mb-0 fw-semibold">
                        {isAr ? doctor.specialty.ar : doctor.specialty.en}
                      </p>
                      <small className="text-muted">
                        {isAr ? doctor.title.ar : doctor.title.en}
                      </small>
                    </div>
                  </div>

                  <p className="doctor-bio text-secondary small flex-grow-1 mb-3" style={{ lineHeight: '1.7' }}>
                    {isAr ? doctor.bio.ar : doctor.bio.en}
                  </p>

                  {/* Credentials / Memberships per Golden Rule 7 */}
                  {doctor.credentials && doctor.credentials.length > 0 && (
                    <div className="doctor-credentials-box p-2 px-3 rounded-3 bg-light border mb-3 small">
                      <div className="d-flex align-items-center gap-1 text-dark fw-bold mb-1">
                        <FiAward className="text-warning" />
                        <span>{isAr ? 'المؤهلات والعضويات المعتمدة:' : 'Accreditations:'}</span>
                      </div>
                      <ul className="list-unstyled mb-0 text-muted ps-3">
                        {doctor.credentials.map((cred, i) => (
                          <li key={i} className="mb-1">
                            • {isAr ? cred.ar : cred.en}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Languages Spoken */}
                  {doctor.languages && doctor.languages.length > 0 && (
                    <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
                      <FiGlobe size={14} className="text-secondary" />
                      <span>{isAr ? 'اللغات:' : 'Languages:'}</span>
                      <strong className="text-dark">{doctor.languages.join(' • ')}</strong>
                    </div>
                  )}

                  <div className="pt-2 border-top mt-auto">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleBookWithDoctor(isAr ? doctor.name.ar : doctor.name.en)}
                    >
                      <FiCalendar size={14} />
                      <span>
                        {isAr
                          ? `طلب استشارة مع ${doctor.name.ar}`
                          : `Request Consultation with ${doctor.name.en}`}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
