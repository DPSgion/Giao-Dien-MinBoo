import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: command === 'serve' ? '/' : '/Giao-Dien-MinBoo/', // Dev thì dùng /, Build deploy thì dùng repo name
  server: {
    port: 3000,
  },
  appType: 'spa',
}))

//server: {
// port: 3000,           // bỏ open: true → không tự mở tab nữa
//},
//appType: 'spa',         // fix lỗi refresh / gõ URL thẳng
//})


