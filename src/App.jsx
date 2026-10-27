import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Public Pages (Core bundle)
import Home from './pages/Home';
import About from './pages/About';
import ServicesPage from './pages/ServicesPage';
import ServiceDetail from './pages/ServiceDetail';
import BlogsPage from './pages/BlogsPage';
import SingleBlog from './pages/SingleBlog';
import ContactPage from './pages/ContactPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsPage } from './pages/TermsPage';
import { ManageBooking } from './pages/ManageBooking';
import NotFound from './pages/NotFound';

// Global Public Components
import BrandLoader from './components/BrandLoader/BrandLoader';
import { ImageSlotModal } from './components/VisualEdit/ImageSlotModal';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { SmoothScroll, ScrollProgress } from './components/Motion';

// Admin System (Lazy-Loaded for performance and bundle isolation)
const AdminLayout = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('./admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminGuard = lazy(() => import('./admin/AdminGuard').then(m => ({ default: m.AdminGuard })));
const DashboardHome = lazy(() => import('./admin/pages/DashboardHome').then(m => ({ default: m.DashboardHome })));
const AppointmentsManager = lazy(() => import('./admin/pages/AppointmentsManager').then(m => ({ default: m.AppointmentsManager })));
const PatientsManager = lazy(() => import('./admin/pages/PatientsManager').then(m => ({ default: m.PatientsManager })));
const BookingSettingsManager = lazy(() => import('./admin/pages/BookingSettingsManager').then(m => ({ default: m.BookingSettingsManager })));
const RequestsInbox = AppointmentsManager; // Alias so legacy route renders new AppointmentsManager
const ServicesManager = lazy(() => import('./admin/pages/ServicesManager').then(m => ({ default: m.ServicesManager })));
const DoctorsManager = lazy(() => import('./admin/pages/DoctorsManager').then(m => ({ default: m.DoctorsManager })));
const ImageSlotsManager = lazy(() => import('./admin/pages/ImageSlotsManager').then(m => ({ default: m.ImageSlotsManager })));
const TextsManager = lazy(() => import('./admin/pages/TextsManager').then(m => ({ default: m.TextsManager })));
const SectionsManager = lazy(() => import('./admin/pages/SectionsManager').then(m => ({ default: m.SectionsManager })));
const ArticlesManager = lazy(() => import('./admin/pages/ArticlesManager').then(m => ({ default: m.ArticlesManager })));
const FaqManager = lazy(() => import('./admin/pages/FaqManager').then(m => ({ default: m.FaqManager })));
const LocationsManager = lazy(() => import('./admin/pages/LocationsManager').then(m => ({ default: m.LocationsManager })));
const RatingsManager = lazy(() => import('./admin/pages/RatingsManager').then(m => ({ default: m.RatingsManager })));
const BrandingManager = lazy(() => import('./admin/pages/BrandingManager').then(m => ({ default: m.BrandingManager })));
const SeoManager = lazy(() => import('./admin/pages/SeoManager').then(m => ({ default: m.SeoManager })));
const QrGenerator = lazy(() => import('./admin/pages/QrGenerator').then(m => ({ default: m.QrGenerator })));
const VersionsManager = lazy(() => import('./admin/pages/VersionsManager').then(m => ({ default: m.VersionsManager })));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
};

// Page transition wrapper for public pages
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Admin Loading Spinner
const AdminFallback = () => (
  <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading Admin...</span>
    </div>
  </div>
);

// Dynamic Robots & Indexation Controller
const SeoMetaController = ({ pathname }) => {
  useEffect(() => {
    try {
      const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
      const allowIndexing = import.meta.env.VITE_ALLOW_INDEXING === 'true';
      const isRestrictedRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/booking/manage');

      let metaTag = document.querySelector('meta[name="robots"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'robots');
        document.head.appendChild(metaTag);
      }

      if (isRestrictedRoute || !allowIndexing) {
        metaTag.setAttribute('content', 'noindex, nofollow');
      } else {
        metaTag.setAttribute('content', 'index, follow');
      }
    } catch (err) {
      console.warn('[SeoMetaController] Failed to update robots meta:', err);
    }
  }, [pathname]);

  return null;
};

function App() {
  const location = useLocation();
  const [initialLoading, setInitialLoading] = useState(true);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <DataProvider>
        <SmoothScroll>
          {!isAdminRoute && <ScrollProgress />}
          {initialLoading && <BrandLoader onFinish={() => setInitialLoading(false)} />}
          <ScrollToTop />
          <SeoMetaController pathname={location.pathname} />

          <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            {/* Public Site Routes */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
            <Route path="/services/:slug" element={<PageTransition><ServiceDetail /></PageTransition>} />
            <Route path="/singleservice" element={<Navigate to="/services/checkup-cleaning" replace />} />
            <Route path="/blogs" element={<PageTransition><BlogsPage /></PageTransition>} />
            <Route path="/blog/:url" element={<PageTransition><SingleBlog /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
            <Route path="/booking" element={<Navigate to="/contact" replace />} />
            <Route path="/booking/manage" element={<PageTransition><ManageBooking /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />

            {/* Admin Portal Authentication */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />

            {/* Protected Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                </Suspense>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route
                path="requests"
                element={
                  <AdminGuard allowedRoles={['owner', 'receptionist', 'viewer']}>
                    <AppointmentsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="appointments"
                element={
                  <AdminGuard allowedRoles={['owner', 'receptionist', 'viewer']}>
                    <AppointmentsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="patients"
                element={
                  <AdminGuard allowedRoles={['owner', 'receptionist', 'viewer']}>
                    <PatientsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="booking-settings"
                element={
                  <AdminGuard allowedRoles={['owner', 'viewer']}>
                    <BookingSettingsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="settings"
                element={
                  <AdminGuard allowedRoles={['owner', 'viewer']}>
                    <BookingSettingsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="services"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <ServicesManager />
                  </AdminGuard>
                }
              />
              <Route
                path="doctors"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <DoctorsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="images"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <ImageSlotsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="texts"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <TextsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="sections"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <SectionsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="articles"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <ArticlesManager />
                  </AdminGuard>
                }
              />
              <Route
                path="faq"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <FaqManager />
                  </AdminGuard>
                }
              />
              <Route
                path="locations"
                element={
                  <AdminGuard allowedRoles={['owner', 'editor', 'viewer']}>
                    <LocationsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="ratings"
                element={
                  <AdminGuard allowedRoles={['owner', 'viewer']}>
                    <RatingsManager />
                  </AdminGuard>
                }
              />
              <Route
                path="branding"
                element={
                  <AdminGuard allowedRoles={['owner', 'viewer']}>
                    <BrandingManager />
                  </AdminGuard>
                }
              />
              <Route
                path="seo"
                element={
                  <AdminGuard allowedRoles={['owner', 'viewer']}>
                    <SeoManager />
                  </AdminGuard>
                }
              />
              <Route
                path="qr"
                element={
                  <AdminGuard allowedRoles={['owner', 'receptionist', 'editor', 'viewer']}>
                    <QrGenerator />
                  </AdminGuard>
                }
              />
              <Route
                path="versions"
                element={
                  <AdminGuard allowedRoles={['owner', 'viewer']}>
                    <VersionsManager />
                  </AdminGuard>
                }
              />
            </Route>

            {/* Custom 404 Route */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </ErrorBoundary>

      {/* In-Place Image Edit Modal */}
        <ImageSlotModal />
        </SmoothScroll>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
