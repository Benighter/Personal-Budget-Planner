import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      publicDir: 'public',
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        copyPublicDir: true,
        // Target modern Android WebView (Chromium 90+) — smaller, faster output
        target: 'es2020',
        rollupOptions: {
          output: {
            manualChunks: {
              // Core React — always needed
              'vendor-react': ['react', 'react-dom'],
              // Framer Motion — large, only needed for animations
              'vendor-framer': ['framer-motion'],
              // Firebase — large, load separately
              'vendor-firebase': [
                'firebase/app',
                'firebase/auth',
                'firebase/firestore',
                'firebase/storage',
              ],
              // Capacitor plugins
              'vendor-capacitor': [
                '@capacitor/core',
                '@capacitor/app',
                '@capgo/capacitor-native-biometric',
              ],
            },
          },
        },
      }
    };
});
