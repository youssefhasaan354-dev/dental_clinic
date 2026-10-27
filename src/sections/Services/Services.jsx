import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslation, useLanguage } from '../../i18n/LanguageContext';
import { useData } from '../../context/DataContext';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import SmartServiceSelector from '../../components/SmartServiceSelector/SmartServiceSelector';
import {
  FiArrowLeft,
  FiArrowRight,
  FiSearch,
  FiCalendar,
  FiClock,
  FiHelpCircle,
} from 'react-icons/fi';
import './Services.scss';

const Services = ({ limit = 8, showAllBtn = true }) => {
  const { language } = useLanguage();
  const { services, settings } = useData();
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const isAr = language === 'ar';
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTriageOpen, setIsTriageOpen] = useState(false);

  const desktopScrollRef = useRef(null);

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
    navigate(`/contact?service=${serviceId}`);
    setTimeout(() => {
      const formEl = document.getElementById('booking-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Apple-style desktop horizontal pinned scroll
  const enableHorizontalScroll = displayedServices.length > 3 && !prefersReduced;
  const { scrollYProgress } = useScroll({
    target: desktopScrollRef,
    offset: ['start start', 'end end'],
  });

  const travelDistance = Math.max(0, (displayedServices.length - 2.4) * 400);
  const horizontalX = useTransform(
    scrollYProgress,
    [0, 1],
    isAr ? [0, travelDistance] : [0, -travelDistance]
  );

  const renderCard = (service, index) => (
    <motion.div
      key={service.id}
      className="service-card-premium h-100 d-flex flex-column p-4 rounded-4 shadow-sm bg-white border"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
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
  );

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

        {/* Smart Service Selector (Triage Guide) Trigger */}
        <div className="text-center mb-4">
          <button
            type="button"
            className="btn rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm border"
            onClick={() => setIsTriageOpen(true)}
            style={{ backgroundColor: '#f0fdfa', borderColor: '#99f6e4', color: '#0c6674', fontWeight: 600 }}
          >
            <FiHelpCircle className="fs-5" style={{ color: '#0c6674' }} />
            <span>{isAr ? 'محتار في اختيار الخدمة الأنسب لحالتك؟ (إيه مشكلتك؟)' : 'Need help deciding? Smart Service Guide'}</span>
          </button>
        </div>

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
                aria-label={isAr ? 'البحث في الخدمات الطبية' : 'Search clinical services'}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-link text-muted border-0 text-decoration-none pe-3"
                  onClick={() => setSearchQuery('')}
                  aria-label={isAr ? 'مسح البحث' : 'Clear search'}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="service-filters-row d-flex align-items-center justify-content-center flex-wrap gap-2 mb-5">
          {[
            { id: 'all', ar: 'جميع الخدمات', en: 'All Services' },
            { id: 'preventive', ar: 'طب وقائي وتنظيف', en: 'Preventative' },
            { id: 'endodontics', ar: 'علاج الجذور والعصب', en: 'Root Canal' },
            { id: 'restorative', ar: 'حشوات وترميم', en: 'Restorative' },
            { id: 'prosthodontics', ar: 'تركيبات وتيجان', en: 'Crowns & Bridges' },
            { id: 'surgery', ar: 'جراحة وزراعة', en: 'Surgery & Implants' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip ${activeFilter === cat.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {isAr ? cat.ar : cat.en}
            </button>
          ))}
        </div>
      </div>

      {displayedServices.length === 0 ? (
        <div className="container text-center py-5">
          <p className="text-muted">
            {isAr ? 'لا توجد خدمات مطابقة لبحثك الحالي.' : 'No matching services found for your search query.'}
          </p>
        </div>
      ) : enableHorizontalScroll ? (
        <>
          {/* Desktop Pinned Horizontal Scroll */}
          <div ref={desktopScrollRef} className="services-desktop-pinned d-none d-lg-block">
            <div className="services-sticky-viewport">
              <div className="container">
                <motion.div
                  className="services-horizontal-track"
                  style={{ x: horizontalX }}
                >
                  {displayedServices.map((service, index) => (
                    <div key={service.id} className="service-horizontal-item">
                      {renderCard(service, index)}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Vertical Grid */}
          <div className="container d-lg-none">
            <div className="row g-4">
              {displayedServices.map((service, index) => (
                <div key={service.id} className="col-md-6 col-12">
                  {renderCard(service, index)}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Standard Responsive Grid (when filtered or reduced motion) */
        <div className="container">
          <div className="row g-4">
            {displayedServices.map((service, index) => (
              <div key={service.id} className="col-lg-4 col-md-6 col-12">
                {renderCard(service, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View All CTA */}
      {showAllBtn && (
        <div className="container text-center mt-5">
          <div className="theme-btn theme-btn-outline">
            <Link to="/services">
              <span>{isAr ? 'عرض كافة الخدمات الطبية' : 'View All Clinical Services'}</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      )}

      {/* Smart Service Selector Modal */}
      <SmartServiceSelector
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
      />
    </section>
  );
};

export default Services;
