import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 0,
        proxyTimeout: 0,
        onError: (err, req, res) => {
          console.log('Proxy error:', err.message);
        },
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
        timeout: 0,
        proxyTimeout: 0,
        onError: (err, req, res) => {
          // Suppress ECONNRESET and ECONNABORTED errors which happen on page reload/disconnect
          if (err.code !== 'ECONNABORTED' && err.code !== 'ECONNRESET') {
            console.log('WS Proxy error:', err.message);
          }
        },
      },
    },
  },
})
