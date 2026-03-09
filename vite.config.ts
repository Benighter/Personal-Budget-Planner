import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          'vendor-capacitor': [
            '@capacitor/core',
            '@capacitor/app',
            '@capgo/capacitor-native-biometric',
          ],
        },
      },
    },
  },
});
