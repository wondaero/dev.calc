import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [vue()],
  // base: process.env.NODE_ENV === 'production' ? '/test-page/calc/' : '/' //개발
  base: process.env.NODE_ENV === 'production' ? '/game.calc/' : '/' //운영
})