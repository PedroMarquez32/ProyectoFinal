import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false
      }
    },
    allowedHosts: [
      'proyectofinalfrontend-production-e48b.up.railway.app'
    ]
  },
  css: {
    postcss: './postcss.config.js'
  }
})
