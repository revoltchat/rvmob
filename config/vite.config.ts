import {defineConfig} from 'vite';

import react from '@vitejs/plugin-react';
import reactNativeWeb from 'vite-plugin-react-native-web';
import svgr from '@svgr/rollup';

import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), reactNativeWeb(), svgr()],
  resolve: {
    alias: {
      '@clerotri': path.resolve(__dirname, '../src'),
      '@clerotri-i18n': path.resolve(__dirname, '../i18n'),
    },
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        dir: 'dist/web',
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // https://github.com/vitejs/vite-plugin-react/issues/192#issuecomment-1627384670
      jsx: 'automatic',
    },
  },
});
