import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy 3D engine — loaded once, cached long-term
          'vendor-three': ['three'],
          // Animation library
          'vendor-gsap': ['gsap'],
          // Audio engine — only needed when user plays audio
          'vendor-tone': ['tone'],
          // React core — changes rarely
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
    // Raise the warning threshold now that we've split chunks
    chunkSizeWarningLimit: 700,
  },
});
