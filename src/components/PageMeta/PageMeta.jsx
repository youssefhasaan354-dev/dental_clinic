import { useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { getSiteUrl } from '../../utils/siteUrl';

/**
 * Pure metadata values resolver for SEO tags.
 * Easily unit-testable without requiring a browser or mock DOM.
 */
export function resolvePageMetaValues({
  title = '',
  description = '',
  canonicalPath = '',
  image = '/assets/banner/1.png',
  type = 'website',
  noindex = false,
  language = 'ar',
  siteUrl = 'https://dentallclinic.vercel.app',
  allowIndexing = false,
} = {}) {
  const isAr = language === 'ar';
  const clinicName = isAr ? 'عيادة حياة لطب الأسنان' : 'Hayaah Dental Clinic';
  const defaultDesc = isAr
    ? 'عيادة حياة لطب الأسنان بمصر الجديدة، القاهرة. رعاية هادئة ودقيقة، أجهزة تعقيم معتمدة وأشعة رقمية منخفضة الجرعة. احجز موعدك أو تواصل معنا.'
    : 'Hayaah Dental Clinic in Heliopolis, Cairo. Gentle, precise dental care, certified sterilization and low-dose digital imaging. Book your appointment or contact us.';

  // 1. Resolve title
  let rawTitle = '';
  if (typeof title === 'object' && title !== null) {
    rawTitle = title[language] || title.ar || title.en || '';
  } else if (typeof title === 'string') {
    rawTitle = title.trim();
  }

  let fullTitle = '';
  if (rawTitle) {
    if (rawTitle.includes('عيادة حياة') || rawTitle.includes('Hayaah Dental')) {
      fullTitle = rawTitle;
    } else {
      fullTitle = `${rawTitle} | ${clinicName}`;
    }
  } else {
    fullTitle = `${clinicName} | ${isAr ? 'القاهرة، مصر الجديدة' : 'Heliopolis, Cairo'}`;
  }

  // 2. Resolve description
  let rawDesc = '';
  if (typeof description === 'object' && description !== null) {
    rawDesc = description[language] || description.ar || description.en || '';
  } else if (typeof description === 'string') {
    rawDesc = description.trim();
  }
  const pageDesc = rawDesc || defaultDesc;

  // 3. Resolve canonical URL
  const currentPath = canonicalPath || '/';
  const canonicalHref = `${siteUrl}${currentPath.startsWith('/') ? currentPath : `/${currentPath}`}`;

  // 4. Resolve absolute image URL
  const cleanImg = (image || '/assets/banner/1.png').trim();
  const fullImageUrl = cleanImg.startsWith('http')
    ? cleanImg
    : `${siteUrl}${cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`}`;

  // 5. Indexing policies
  const isRestricted =
    noindex ||
    !allowIndexing ||
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/booking/manage') ||
    currentPath === '/404';

  const robots = isRestricted ? 'noindex, nofollow' : 'index, follow';

  return {
    fullTitle,
    pageDesc,
    canonicalHref,
    fullImageUrl,
    robots,
    locale: isAr ? 'ar_EG' : 'en_US',
    siteName: clinicName,
    type,
  };
}

/**
 * Universal dynamic SEO & Meta Tags Controller
 * Handles document.title, description, canonical link, OpenGraph, Twitter Cards,
 * Robots indexing policies, and dynamic JSON-LD structured data.
 * Zero external dependencies.
 */
export function usePageMeta({
  title = '',
  description = '',
  canonicalPath = '',
  image = '/assets/banner/1.png',
  type = 'website',
  noindex = false,
  schema = null,
} = {}) {
  const { language } = useTranslation();

  useEffect(() => {
    try {
      if (typeof document === 'undefined') return;

      const siteUrl = getSiteUrl();
      const currentPath = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
      const allowIndexing = import.meta.env.VITE_ALLOW_INDEXING === 'true';

      const meta = resolvePageMetaValues({
        title,
        description,
        canonicalPath: currentPath,
        image,
        type,
        noindex,
        language,
        siteUrl,
        allowIndexing,
      });

      document.title = meta.fullTitle;

      // Helper to set meta tags
      const setMetaTag = (attrName, attrValue, content) => {
        let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute(attrName, attrValue);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      // Helper to set link tags
      const setLinkTag = (rel, href) => {
        let tag = document.querySelector(`link[rel="${rel}"]`);
        if (!tag) {
          tag = document.createElement('link');
          tag.setAttribute('rel', rel);
          document.head.appendChild(tag);
        }
        tag.setAttribute('href', href);
      };

      // Primary Meta
      setMetaTag('name', 'description', meta.pageDesc);
      setLinkTag('canonical', meta.canonicalHref);

      // Open Graph
      setMetaTag('property', 'og:title', meta.fullTitle);
      setMetaTag('property', 'og:description', meta.pageDesc);
      setMetaTag('property', 'og:url', meta.canonicalHref);
      setMetaTag('property', 'og:image', meta.fullImageUrl);
      setMetaTag('property', 'og:type', meta.type);
      setMetaTag('property', 'og:site_name', meta.siteName);
      setMetaTag('property', 'og:locale', meta.locale);

      // Twitter Cards
      setMetaTag('name', 'twitter:card', 'summary_large_image');
      setMetaTag('name', 'twitter:title', meta.fullTitle);
      setMetaTag('name', 'twitter:description', meta.pageDesc);
      setMetaTag('name', 'twitter:image', meta.fullImageUrl);

      // Search Engine Indexing
      setMetaTag('name', 'robots', meta.robots);

      // Dynamic JSON-LD Structured Data
      const SCRIPT_ID = 'dynamic-page-jsonld';
      let scriptTag = document.getElementById(SCRIPT_ID);

      if (schema) {
        if (!scriptTag) {
          scriptTag = document.createElement('script');
          scriptTag.id = SCRIPT_ID;
          scriptTag.type = 'application/ld+json';
          document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify(schema);
      } else if (scriptTag) {
        scriptTag.remove();
      }
    } catch (e) {
      console.warn('[PageMeta] Error updating meta tags:', e);
    }

    return () => {
      // Cleanup dynamic JSON-LD on unmount
      if (typeof document !== 'undefined') {
        const scriptTag = document.getElementById('dynamic-page-jsonld');
        if (scriptTag) {
          scriptTag.remove();
        }
      }
    };
  }, [title, description, canonicalPath, image, type, noindex, schema, language]);
}

/**
 * Declarative component wrapper for JSX usage
 */
export default function PageMeta(props) {
  usePageMeta(props);
  return null;
}
