import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, API calls go to the Express server on :4000 (override with API_URL).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': process.env.API_URL || 'http://localhost:4000' },
  },
});
