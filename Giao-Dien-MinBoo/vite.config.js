import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis', // hoặc 'window'
  },
  base: command === 'serve' ? '/' : '/Giao-Dien-MinBoo/', // Dev thì dùng /, Build deploy thì dùng repo name
  server: {
    port: 3000,
    proxy: {
      // Proxy cho REST API
      '/api': {
        target: 'https://www.minboo-be.io.vn',
        changeOrigin: true,
        secure: false,
      },
      // Proxy cho WebSocket SockJS
      '/ws': {
        target: 'https://www.minboo-be.io.vn',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ws/, ''),
      },
  },
  appType: 'spa',
}}));

//server: {
// port: 3000,           // bỏ open: true → không tự mở tab nữa
//},
//appType: 'spa',         // fix lỗi refresh / gõ URL thẳng
//})
