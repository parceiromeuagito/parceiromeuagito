import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './source'),
      '@/components': path.resolve(__dirname, './source/components'),
      '@/hooks': path.resolve(__dirname, './source/hooks'),
      '@/lib': path.resolve(__dirname, './source/lib'),
      '@/contexts': path.resolve(__dirname, './source/contexts'),
      '@/store': path.resolve(__dirname, './source/store'),
      '@/types': path.resolve(__dirname, './source/types'),
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
