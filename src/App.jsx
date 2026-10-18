import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy load pages for fast load times & code-splitting
import Home from './pages/Home';
import About from './pages/About';
import ServicesPage from './pages/ServicesPage';
import ServiceDetail from './pages/ServiceDetail';
import BlogsPage from './pages/BlogsPage';
import SingleBlog from './pages/SingleBlog';
import ContactPage from './pages/ContactPage';
import NotFound from './pages/NotFound';
import BrandLoader from './components/BrandLoader/BrandLoader';

// Scroll to top on every route change
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

// Page transition wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const location = useLocation();
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <>
      {initialLoading && <BrandLoader onFinish={() => setInitialLoading(false)} />}
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <About />
              </PageTransition>
            }
          />
          <Route
            path="/services"
            element={
              <PageTransition>
                <ServicesPage />
              </PageTransition>
            }
          />
          <Route
            path="/services/:slug"
            element={
              <PageTransition>
                <ServiceDetail />
              </PageTransition>
            }
          />
          {/* Backwards compatibility for template's old link */}
          <Route
            path="/singleservice"
            element={<Navigate to="/services/scaling-polishing" replace />}
          />
          <Route
            path="/blogs"
            element={
              <PageTransition>
                <BlogsPage />
              </PageTransition>
            }
          />
          <Route
            path="/blog/:url"
            element={
              <PageTransition>
                <SingleBlog />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <ContactPage />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
