import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to parse simple .env files if present (without external dependencies)
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1) {
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

// Merge envs: process.env has highest priority, then .env.local, then .env
const localEnv = loadEnvFile(path.join(rootDir, '.env.local'));
const baseEnv = loadEnvFile(path.join(rootDir, '.env'));

const rawSiteUrl =
  process.env.VITE_SITE_URL ||
  localEnv.VITE_SITE_URL ||
  baseEnv.VITE_SITE_URL ||
  'https://dentallclinic.vercel.app';

const siteUrl = rawSiteUrl.replace(/\/+$/, '');

const rawAllowIndexing =
  process.env.VITE_ALLOW_INDEXING ||
  localEnv.VITE_ALLOW_INDEXING ||
  baseEnv.VITE_ALLOW_INDEXING ||
  'false';

const allowIndexing = rawAllowIndexing.toLowerCase() === 'true';

const publicDir = path.join(rootDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate robots.txt
let robotsContent = '';
if (allowIndexing) {
  robotsContent = `# Hayaah Dental Clinic - Robots Configuration (Production Live)
User-agent: *
Disallow: /admin
Disallow: /admin/*
Disallow: /booking/manage

Sitemap: ${siteUrl}/sitemap.xml
`;
} else {
  robotsContent = `# Hayaah Dental Clinic - Robots Configuration (Indexing Disabled / Demo)
User-agent: *
Disallow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf-8');
console.log(`[SEO-GEN] Generated public/robots.txt (allowIndexing = ${allowIndexing})`);

// 2. Generate sitemap.xml
// Real routes that actually exist and render pages (verified against App.jsx)
const sitemapRoutes = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/services', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/blogs', changefreq: 'weekly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

const sitemapEntries = sitemapRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path || '/'}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Public Marketing Pages Only (Admin & /booking/manage strictly excluded) -->
${sitemapEntries}
</urlset>
`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent, 'utf-8');
console.log(`[SEO-GEN] Generated public/sitemap.xml (${sitemapRoutes.length} routes pointing to ${siteUrl})`);

// 3. Ensure public/assets contains static assets (emergency.png, banner/1.png, logo.svg)
const srcAssetsDir = path.join(rootDir, 'src', 'assets');
const publicAssetsDir = path.join(publicDir, 'assets');
if (fs.existsSync(srcAssetsDir)) {
  fs.cpSync(srcAssetsDir, publicAssetsDir, { recursive: true });
  console.log('[SEO-GEN] Synced src/assets -> public/assets for static crawler and social availability');
}

