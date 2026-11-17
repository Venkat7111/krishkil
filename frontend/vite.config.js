import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // In local dev, proxy all /api, /auth, /chat, etc. calls to FastAPI
      '/auth': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/chat': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/crop': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/disease': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/weather': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/market': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/news': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/schemes': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/reports': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
