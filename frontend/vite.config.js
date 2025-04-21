import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Tải biến môi trường từ file .env dựa trên mode (development, production, ...)
  const env = process.env;

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000', // Sử dụng process.env
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''), // Loại bỏ /api khỏi path
        },
      },
    },
  };
});