import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El backend corre en :3001. En desarrollo, /api se proxea hacia él.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
