import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import {
  FiArrowLeft,
  FiArrowRight,
  FiSearch,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
} from 'react-icons/fi';
import './Services.scss';

const Services = ({ limit = 8, showAllBtn = true }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { services, settings } = useData();
  const navigate = useNavigate();

  const isAr = language === 'ar';
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services
    .filter((s) => s.isVisible !== false)
    .filter((s) => {
      if (activeFilter === 'all') return true;
      return s.category === activeFilter;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (isAr ? s.title.ar : s.title.en).toLowerCase();
      const desc = (isAr ? s.shortDesc.ar : s.shortDesc.en).toLowerCase();
      const symptoms = (s.symptoms || [])
        .map((sym) => (isAr ? sym.ar : sym.en).toLowerCase())
        .join(' ');
      return title.includes(q) || desc.includes(q) || symptoms.includes(q);
    });

  const displayedServices = limit ? filteredServices.slice(0, limit) : filteredServices;
  const ArrowIcon = isAr ? FiArrowLeft : FiArrowRight;

  const handleAskAboutService = (serviceId) => {
    // Navigate to contact/booking form and pre-select service
    navigate(`/contact?service=${serviceId}`);
    setTimeout(() => {
      const formEl = document.getElementById('booking-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <section id="services-section" className="services-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={isAr ? 'تخصصات العيادة' : 'Clinical Specialties'}
          title={isAr ? 'خدمات طبية شاملة لجميع أفراد الأسرة' : 'Comprehensive Dental Care'}
          description={
            isAr
              ? 'نقدم رعاية علاجية ووقائية وتجميلية قائمة على أحدث أساليب طب الأسنان الآمن، وبخطة علاجية مخصصة تناسب احتياجات كل مريض.'
              : 'Evidence-based preventative, restorative, and cosmetic oral care tailored to your individual dental health.'
          }
          align="center"
        />

        {/* Live Search Bar */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-6 col-lg-5">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-white border-0 px-3 text-muted">
                <FiSearch size={18} />
              </span>
              <input
                type="text"
                className="form-control border-0 py-2"
                placeholder={isAr ? 'ابحث عن خدمة أو عرض (مثال: ألم العصب، تنظيف، زراعة)...' : 'Search service or symptom (e.g. root canal, cleaning)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn bg-white border-0 text-muted"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="service-filters-row d-flex justify-content-center flex-wrap gap-2 mb-5">
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {isAr ? 'جميع الخدمات' : 'All Services'}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'preventive' ? 'active' : ''}`}
            onClick={() => setActiveFilter('preventive')}
          >
            {isAr ? 'طب وقائي وتنظيف' : 'Preventative'}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'endodontics' ? 'active' : ''}`}
            onClick={() => setActiveFilter('endodontics')}
          >
            {isAr ? 'علاج الجذور والعصب' : 'Root Canal'}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'restorative' ? 'active' : ''}`}
            onClick={() => setActiveFilter('restorative')}
          >
            {isAr ? 'حشوات وترميم' : 'Restorative'}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'prosthodontics' ? 'active' : ''}`}
            onClick={() => setActiveFilter('prosthodontics')}
          >
            {isAr ? 'تركيبات وتيجان' : 'Crowns & Bridges'}
          </button>
          <button
            type="button"
            className={`filter-chip ${activeFilter === 'surgery' ? 'active' : ''}`}
            onClick={() => setActiveFilter('surgery')}
          >
            {isAr ? 'جراحة وزراعة' : 'Surgery & Implants'}
          </button>
        </div>

        {/* Services Grid */}
        <div className="row g-4">
          {displayedServices.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p className="text-muted">
                {isAr ? 'لا توجد خدمات مطابقة لبحثك الحالي.' : 'No matching services found for your search query.'}
              </p>
            </div>
          ) : (
            displayedServices.map((service, index) => (
              <div key={service.id} className="col-lg-4 col-md-6">
                <motion.div
                  className="service-card-premium h-100 d-flex flex-column p-4 rounded-4 shadow-sm bg-white border"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-light text-primary border px-3 py-2 rounded-pill small">
                      {isAr ? service.categoryAr || service.category : service.category}
                    </span>
                    {service.duration && (
                      <span className="d-inline-flex align-items-center gap-1 text-muted small">
                        <FiClock size={13} />
                        <span>{isAr ? service.duration.ar : service.duration.en}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="service-title h5 fw-bold mb-2">
                    <Link to={`/services/${service.slug}`} className="text-decoration-none text-dark">
                      {isAr ? service.title.ar : service.title.en}
                    </Link>
                  </h3>

                  <p className="service-desc text-secondary small flex-grow-1 mb-3" style={{ lineHeight: '1.6' }}>
                    {isAr ? service.shortDesc.ar : service.shortDesc.en}
                  </p>

                  {/* Golden Rule 11: Price hidden by default. If shown, labeled "Starting from" with note */}
                  {settings.showPrices && service.startingPrice && (
                    <div className="price-tag-box p-2 px-3 rounded-3 bg-light border mb-3 small d-flex justify-content-between align-items-center">
                      <span className="text-muted">{isAr ? 'التكلفة الاسترشادية:' : 'Indicative fee:'}</span>
                      <strong className="text-primary">
                        {isAr ? `تبدأ من ${service.startingPrice} ج.م` : `From ${service.startingPrice} EGP`}
                      </strong>
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top gap-2">
                    <Link to={`/services/${service.slug}`} className="service-arrow-link text-decoration-none d-inline-flex align-items-center gap-1 text-primary small fw-semibold">
                      <span>{isAr ? 'تفاصيل الإجراء' : 'Learn More'}</span>
                      <ArrowIcon size={14} />
                    </Link>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                      onClick={() => handleAskAboutService(service.id)}
                    >
                      <FiCalendar size={13} className="me-1" />
                      <span>{isAr ? 'حجز هذه الخدمة' : 'Book Service'}</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            ))
          )}
        </div>

        {/* View All CTA */}
        {showAllBtn && (
          <div className="text-center mt-5">
            <div className="theme-btn theme-btn-outline">
              <Link to="/services">
                <span>{isAr ? 'عرض كافة الخدمات الطبية' : 'View All Clinical Services'}</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
