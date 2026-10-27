import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../../i18n/LanguageContext';
import { AuthProvider } from '../../../context/AuthContext';
import { DataProvider } from '../../../context/DataContext';
import Blogs from '../Blogs';

describe('Blogs Component Suite', () => {
  beforeEach(() => {
    let store: Record<string, string> = {};
    const mockStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { store = {}; },
    };
    (global as any).localStorage = mockStorage;
    (global as any).window = (global as any).window || {};
    (global as any).window.localStorage = mockStorage;
  });

  it('renders educational blog cards without property access crashes in Arabic', () => {
    localStorage.setItem('hayaah_lang', 'ar');
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <DataProvider>
              <Blogs limit={3} showAllBtn={true} />
            </DataProvider>
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(html).toContain('blogs-preview-section');
    expect(html).toContain('blog-card-modern');
    expect(html).toContain('الطريقة الصحيحة لتنظيف الأسنان');
  });

  it('renders educational blog cards in English without error', () => {
    localStorage.setItem('hayaah_lang', 'en');
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <DataProvider>
              <Blogs limit={3} showAllBtn={true} />
            </DataProvider>
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(html).toContain('blogs-preview-section');
    expect(html).toContain('blog-card-modern');
    expect(html).toContain('The Gold Standard for Brushing');
  });
});
