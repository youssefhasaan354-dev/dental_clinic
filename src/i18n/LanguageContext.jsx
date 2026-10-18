import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from './ar';
import { en } from './en';

const dictionaries = { ar, en };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('hayaah_lang');
      return saved === 'en' ? 'en' : 'ar'; // Default Arabic
    } catch (e) {
      return 'ar';
    }
  });

  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem('hayaah_lang', language);
    } catch (e) {
      // ignore localStorage quota or privacy errors
    }

    // Update document element attributes for global browser RTL/LTR & font rendering
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.className = `lang-${language} dir-${dir}`;
  }, [language, dir]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLanguage = (lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  /**
   * Helper to retrieve nested translations, e.g. t('nav.home') or t('hero.titleMain')
   */
  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = dictionaries[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Arabic if missing in English
        let fallbackCurrent = dictionaries.ar;
        for (const fbKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fbKey];
          } else {
            return fallback || path;
          }
        }
        return fallbackCurrent || fallback || path;
      }
    }

    return current || fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRtl,
        dir,
        toggleLanguage,
        setLanguage,
        t,
        dict: dictionaries[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
