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
          // Tone.js is intentionally NOT listed here: AudioEngine loads it
          // with a dynamic import on first user gesture, so Rollup splits
          // it into a lazy chunk outside the critical path.
          // React core — changes rarely
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
    // Raise the warning threshold now that we've split chunks
    chunkSizeWarningLimit: 700,
  },
});
