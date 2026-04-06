import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/Giao-Dien-MinBoo/',  // Bắt buộc cho GitHub Pages (tên repo)
  server: {
    port: 3000,
  },
  appType: 'spa',
})

//server: {
// port: 3000,           // bỏ open: true → không tự mở tab nữa
//},
//appType: 'spa',         // fix lỗi refresh / gõ URL thẳng
//})


