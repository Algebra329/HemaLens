import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Pre-cache the Vite build output (JS, CSS, HTML, SVGs)
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],

        // Runtime-cache the heavy files on first fetch
        runtimeCaching: [
          {
            // Cache the two .onnx model files (~22 MB combined)
            urlPattern: /\/models\/.*\.onnx$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'onnx-models',
              expiration: { maxEntries: 5, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: false,
            },
          },
          {
            // Cache self-hosted ONNX Runtime WASM binaries
            urlPattern: /\/wasm\/.*\.(wasm|mjs)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ort-wasm-runtime',
              expiration: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        // Bump the default 2MB pre-cache size limit for large assets
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
      },

      // PWA web app manifest
      manifest: {
        name: 'HemaLens — RBC Morphology Analysis',
        short_name: 'HemaLens',
        description: 'Point-of-care offline red blood cell morphology classification',
        theme_color: '#001437',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    open: false,
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web']
  }
});
