import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from one level up (to access ../data folder)
      allow: ['..']
    },
    proxy: {
      // Proxy requests to /data to the parent data folder
      '/data': {
        target: 'http://localhost:5173',
        configure: (proxy, options) => {
          // This is handled by publicDir below
        }
      }
    }
  },
  publicDir: '../data',
  build: {
    outDir: 'dist'
  }
})
