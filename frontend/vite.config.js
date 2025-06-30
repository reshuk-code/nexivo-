import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/v1/api': 'https://nexivo.onrender.com/'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // (KB) - optional, warning limit बढाउन
  },
  // Add SPA fallback
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  // Configure base path and output directory
  base: '/',
  outDir: 'dist'
})
