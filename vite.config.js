import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  // Cho phép React Router xử lý tất cả routes khi refresh hoặc gõ URL thẳng
  appType: 'spa',
})
