import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.scss';
import App from './App';
import { initAnalytics } from './utils/analytics';

// Initialize privacy-friendly analytics if configured
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
