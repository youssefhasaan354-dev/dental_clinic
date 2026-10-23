import { describe, it, expect } from 'vitest';
import { resolvePageMetaValues } from '../PageMeta';

describe('resolvePageMetaValues', () => {
  it('resolves localized title and description correctly', () => {
    const metaAr = resolvePageMetaValues({
      title: { ar: 'من نحن', en: 'About Us' },
      description: { ar: 'وصف عن عيادة حياة', en: 'About description' },
      canonicalPath: '/about',
      language: 'ar',
      siteUrl: 'https://dentallclinic.vercel.app',
      allowIndexing: true,
    });

    expect(metaAr.fullTitle).toContain('من نحن');
    expect(metaAr.fullTitle).toContain('عيادة حياة لطب الأسنان');
    expect(metaAr.pageDesc).toBe('وصف عن عيادة حياة');
    expect(metaAr.canonicalHref).toBe('https://dentallclinic.vercel.app/about');
    expect(metaAr.robots).toBe('index, follow');
    expect(metaAr.locale).toBe('ar_EG');

    const metaEn = resolvePageMetaValues({
      title: { ar: 'من نحن', en: 'About Us' },
      description: { ar: 'وصف عن عيادة حياة', en: 'About description' },
      canonicalPath: '/about',
      language: 'en',
      siteUrl: 'https://dentallclinic.vercel.app',
      allowIndexing: true,
    });

    expect(metaEn.fullTitle).toContain('About Us');
    expect(metaEn.fullTitle).toContain('Hayaah Dental Clinic');
    expect(metaEn.pageDesc).toBe('About description');
    expect(metaEn.locale).toBe('en_US');
  });

  it('enforces noindex for restricted paths or when noindex is set', () => {
    const metaAdmin = resolvePageMetaValues({
      canonicalPath: '/admin/appointments',
      language: 'ar',
      allowIndexing: true,
    });
    expect(metaAdmin.robots).toBe('noindex, nofollow');

    const metaManage = resolvePageMetaValues({
      canonicalPath: '/booking/manage',
      language: 'ar',
      allowIndexing: true,
    });
    expect(metaManage.robots).toBe('noindex, nofollow');

    const metaExplicit = resolvePageMetaValues({
      canonicalPath: '/special-promo',
      noindex: true,
      allowIndexing: true,
    });
    expect(metaExplicit.robots).toBe('noindex, nofollow');
  });

  it('enforces noindex when allowIndexing is false', () => {
    const meta = resolvePageMetaValues({
      canonicalPath: '/services',
      allowIndexing: false,
    });
    expect(meta.robots).toBe('noindex, nofollow');
  });
});
