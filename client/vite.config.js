import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['leaflet-polylineoffset']
  },
  // During local development, proxy API requests to the backend server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    include: ['test/**/*-test.{js,jsx}'],
    environment: 'jsdom'
  }
})

