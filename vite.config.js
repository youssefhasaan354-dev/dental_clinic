import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // suppresses legacy JS API deprecation warning
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    host: '127.0.0.1',
  },
});
