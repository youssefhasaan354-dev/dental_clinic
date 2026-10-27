import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import ContactForm from '../components/ContactForm/ContactForm';
import Gallery from '../sections/Gallery/Gallery';
import EditableMedia from '../components/VisualEdit/EditableMedia';
import { getServiceBySlug, SERVICES } from '../data/services';
import { IMAGES } from '../data/images';
import { useTranslation } from '../i18n/LanguageContext';
import {
  FiClock,
  FiRepeat,
  FiCheckCircle,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import PageMeta from '../components/PageMeta/PageMeta';
import { getSiteUrl } from '../utils/siteUrl';
import './ServiceDetail.scss';

const ServiceDetail = () => {
  const { slug } = useParams();
  const { language, t } = useTranslation();
  const service = getServiceBySlug(slug);
  const siteUrl = getSiteUrl();
  const isAr = language === 'ar';

  const ArrowIcon = language === 'ar' ? FiArrowLeft : FiArrowRight;
  const ChevronIcon = language === 'ar' ? FiChevronLeft : FiChevronRight;

  // Filter 3 related services from same or other categories
  const relatedServices = service
    ? SERVICES.filter((s) => s.id !== service.id).slice(0, 3)
    : SERVICES.slice(0, 3);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const serviceTitle = service ? (service.title[language] || service.title.ar) : '';
  const serviceDesc = service ? (service.shortDesc[language] || service.shortDesc.ar) : '';

  const serviceSchema = service
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'MedicalProcedure',
            name: serviceTitle,
            description: service.fullDesc ? (service.fullDesc[language] || service.fullDesc.ar) : serviceDesc,
            procedureType: 'SurgicalOrDental',
            provider: {
              '@type': 'Dentist',
              name: isAr ? 'عيادة حياة لطب الأسنان' : 'Hayaah Dental Clinic',
              url: `${siteUrl}/`,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: isAr ? 'الرئيسية' : 'Home',
                item: `${siteUrl}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: isAr ? 'الخدمات' : 'Services',
                item: `${siteUrl}/services`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: serviceTitle,
                item: `${siteUrl}/services/${service.slug || service.id}`,
              },
            ],
          },
        ],
      }
    : null;

  return (
    <main id="main-content" className="service-detail-page-layout">
      <PageMeta
        title={service ? service.title : { ar: 'تفاصيل الخدمة', en: 'Service Details' }}
        description={service ? service.shortDesc : ''}
        canonicalPath={`/services/${slug}`}
        schema={serviceSchema}
        noindex={!service}
      />
      <Navbar />

      {/* Hero Banner for Service */}
      <section className="service-detail-hero section-bg section-common my-4 py-5">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="detail-breadcrumbs mb-3" aria-label="Breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <ChevronIcon className="breadcrumb-separator" />
            <Link to="/services">{t('nav.services')}</Link>
            <ChevronIcon className="breadcrumb-separator" />
            <span className="current-crumb">
              {language === 'ar' ? service.title.ar : service.title.en}
            </span>
          </nav>

          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="service-category-pill mb-3 d-inline-block">
                  {language === 'ar' ? 'عيادة حياة لطب الأسنان' : 'Hayaah Dental Clinic'}
                </span>

                <h1 className="service-detail-title mb-3">
                  {language === 'ar' ? service.title.ar : service.title.en}
                </h1>

                <p className="service-detail-lead mb-4">
                  {language === 'ar' ? service.shortDesc.ar : service.shortDesc.en}
                </p>

                {/* Quick Service Meta Badges */}
                <div className="service-meta-badges d-flex flex-wrap gap-3 mb-4">
                  {service.duration && (
                    <div className="meta-badge-box">
                      <FiClock className="text-primary" />
                      <div>
                        <small className="d-block text-muted">{language === 'ar' ? 'مدة الجلسة' : 'Duration'}</small>
                        <strong>{language === 'ar' ? service.duration.ar : service.duration.en}</strong>
                      </div>
                    </div>
                  )}

                  {service.recommendedFrequency && (
                    <div className="meta-badge-box">
                      <FiRepeat className="text-accent" />
                      <div>
                        <small className="d-block text-muted">{language === 'ar' ? 'التكرار الموصى به' : 'Frequency'}</small>
                        <strong>{language === 'ar' ? service.recommendedFrequency.ar : service.recommendedFrequency.en}</strong>
                      </div>
                    </div>
                  )}

                  <div className="meta-badge-box">
                    <FiCheckCircle className="text-success" />
                    <div>
                      <small className="d-block text-muted">{language === 'ar' ? 'الأمان والتعقيم' : 'Safety'}</small>
                      <strong>{language === 'ar' ? 'تعقيم فندقي معتمد' : 'Hospital-Grade Sterilization'}</strong>
                    </div>
                  </div>
                </div>

                <div className="theme-btn">
                  <a href="#book-service-now">
                    <FiCalendar />
                    <span>{language === 'ar' ? 'احجز موعد كشف لهذه الخدمة' : 'Book Appointment for this Service'}</span>
                  </a>
                </div>
              </motion.div>
            </div>

            <div className="col-lg-5 text-center">
              <div className="service-hero-media mb-4 overflow-hidden rounded-4 shadow-sm">
                <EditableMedia
                  slotId={service.imageSlotId || 'slot-service-detail-hero'}
                  defaultSrc={IMAGES.serviceDetails.hero}
                  alt={{ ar: service.title.ar, en: service.title.en }}
                  width="100%"
                  height={240}
                  style={{ objectFit: 'cover', borderRadius: '16px' }}
                />
              </div>
              <motion.div
                className="service-hero-card glass-card p-4 text-start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <h4 className="fw-bold mb-3 text-primary">
                  {language === 'ar' ? 'معايير الرعاية في هذا الإجراء' : 'Clinical Care Standards'}
                </h4>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  <li className="d-flex align-items-start gap-2">
                    <FiCheck className="text-success mt-1 fs-5" />
                    <span>{language === 'ar' ? 'تخدير موضعي لطيف يراعي راحة المريض' : 'Gentle, patient-paced local anesthesia'}</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <FiCheck className="text-success mt-1 fs-5" />
                    <span>{language === 'ar' ? 'خامات طبية متوافقة حيوياً ومعتمدة' : 'Biocompatible certified clinical materials'}</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <FiCheck className="text-success mt-1 fs-5" />
                    <span>{language === 'ar' ? 'أطباء معتمدون ومقيدون بنقابة أطباء الأسنان' : 'Licensed practitioners registered with Egyptian Dental Syndicate'}</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <FiCheck className="text-success mt-1 fs-5" />
                    <span>{language === 'ar' ? 'متابعة دورية مستمرة لضمان النتيجة' : 'Continuous follow-up ensuring lasting outcome'}</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Medical Details */}
      <section className="service-overview-section py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              <div className="service-rich-details pe-lg-4">
                <h2 className="section-subheading mb-3">
                  {language === 'ar' ? 'عن هذا الإجراء العلاجي' : 'About this Procedure'}
                </h2>
                <p className="detailed-paragraph mb-4">
                  {language === 'ar' ? service.fullDesc.ar : service.fullDesc.en}
                </p>

                {/* Procedure Steps (Timeline) */}
                {service.procedureSteps && service.procedureSteps.length > 0 && (
                  <div className="procedure-steps-container mt-5">
                    <h3 className="section-subheading mb-4">
                      {language === 'ar' ? 'خطوات العلاج خطوة بخطوة' : 'Treatment Steps: What to Expect'}
                    </h3>

                    <div className="procedure-steps-list">
                      {service.procedureSteps.map((stepItem) => (
                        <div key={stepItem.step} className="procedure-step-item d-flex gap-3 mb-4">
                          <div className="step-circle-badge">
                            <span>0{stepItem.step}</span>
                          </div>
                          <div className="step-content">
                            <h4 className="step-item-title mb-1">
                              {language === 'ar' ? stepItem.titleAr : stepItem.titleEn}
                            </h4>
                            <p className="step-item-desc mb-0">
                              {language === 'ar' ? stepItem.descAr : stepItem.descEn}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Who Needs It / Symptoms Box */}
            <div className="col-lg-4">
              <div className="who-needs-card p-4 rounded-4 shadow-sm border">
                <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FiHelpCircle className="text-primary" />
                  <span>{language === 'ar' ? 'متى تحتاج هذا الإجراء؟' : 'When Do You Need This?'}</span>
                </h4>
                <p className="small text-muted mb-3">
                  {language === 'ar'
                    ? 'إذا كنت تعاني من أحد الأعراض التالية، نوصيك بحجز موعد كشف:'
                    : 'If you experience any of these symptoms, a consultation is recommended:'}
                </p>

                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  {service.whoNeedsIt[language].map((item, idx) => (
                    <li key={idx} className="d-flex align-items-start gap-2">
                      <span className="dot-bullet">✦</span>
                      <span className="symptom-text-small">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service FAQs */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="service-faq-section py-5 bg-light-subtle">
          <div className="container">
            <SectionTitle
              subTitle={language === 'ar' ? 'استفسارات شائعة' : 'Common Questions'}
              title={
                language === 'ar'
                  ? `أسئلة شائعة حول ${service.title.ar}`
                  : `FAQs About ${service.title.en}`
              }
              align="center"
            />

            <div className="row justify-content-center">
              <div className="col-lg-8">
                {service.faqs.map((faq, idx) => (
                  <div key={idx} className="service-faq-box p-4 bg-white rounded-3 shadow-sm mb-3 border">
                    <h5 className="fw-bold text-primary mb-2">
                      {language === 'ar' ? faq.qAr : faq.qEn}
                    </h5>
                    <p className="mb-0 text-muted">
                      {language === 'ar' ? faq.aAr : faq.aEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Showcase */}
      <Gallery />

      {/* Related Services */}
      <section className="related-services-section py-5">
        <div className="container">
          <SectionTitle
            subTitle={language === 'ar' ? 'خدمات ذات صلة' : 'Related Services'}
            title={language === 'ar' ? 'خدمات أخرى قد تهمك' : 'Other Treatments You May Need'}
            align="center"
          />

          <div className="row g-4">
            {relatedServices.map((rSvc) => (
              <div key={rSvc.id} className="col-md-4">
                <div className="related-service-card p-4 rounded-4 border bg-white h-100 d-flex flex-column">
                  <h4 className="fw-bold mb-2">
                    <Link to={`/services/${rSvc.slug}`} className="text-dark text-decoration-none">
                      {language === 'ar' ? rSvc.title.ar : rSvc.title.en}
                    </Link>
                  </h4>
                  <p className="text-muted small mb-4 flex-grow-1">
                    {language === 'ar' ? rSvc.shortDesc.ar : rSvc.shortDesc.en}
                  </p>
                  <Link to={`/services/${rSvc.slug}`} className="fw-bold text-primary text-decoration-none d-flex align-items-center gap-1">
                    <span>{language === 'ar' ? 'التفاصيل' : 'Details'}</span>
                    <ArrowIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Booking Section with this service pre-selected */}
      <section id="book-service-now" className="py-5 bg-white">
        <div className="container">
          <SectionTitle
            subTitle={language === 'ar' ? 'حجز مباشر' : 'Fast Booking'}
            title={
              language === 'ar'
                ? `احجز موعد كشف لـ (${service.title.ar})`
                : `Book Consultation for (${service.title.en})`
            }
            align="center"
          />
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <ContactForm defaultService={service.id} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingActions />
    </main>
  );
};

export default ServiceDetail;
