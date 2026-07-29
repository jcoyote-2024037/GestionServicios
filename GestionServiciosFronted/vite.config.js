import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/gestionservicio': {
        target: 'http://localhost:3006',
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-hot-toast', 'react-hook-form', 'zustand'],
          maps: ['leaflet', 'react-leaflet'],
          socket: ['socket.io-client'],
        },
      },
    },
    sourcemap: false,
  },
})
