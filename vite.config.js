import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || 'https://dentallclinic.vercel.app').replace(/\/+$/, '');
  const allowIndexing = (process.env.VITE_ALLOW_INDEXING || env.VITE_ALLOW_INDEXING) === 'true';
  const robotsMeta = allowIndexing ? 'index, follow' : 'noindex, nofollow';

  process.env.VITE_SITE_URL = siteUrl;
  process.env.VITE_ALLOW_INDEXING = allowIndexing ? 'true' : 'false';
  process.env.VITE_ROBOTS_META = robotsMeta;

  return {
    plugins: [
      {
        name: 'html-seo-transform',
        transformIndexHtml: {
          order: 'pre',
          handler(html) {
            return html
              .replace(/%VITE_SITE_URL%/g, siteUrl)
              .replace(/%VITE_ROBOTS_META%/g, robotsMeta);
          },
        },
      },
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    host: '127.0.0.1',
  },
};
});
