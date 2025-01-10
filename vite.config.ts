import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envDir: '.',  // Especifica el directorio donde está .env
  server: {
    proxy: {
      '/api/v1/audio/transcriptions': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', ''),
        secure: false,
        headers: {
          'Origin': 'http://localhost:5173'
        },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending request to OpenAI:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received response from OpenAI:', proxyRes.statusCode);
          });
        }
      },
      '/api/v1/audio/speech': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', ''),
        secure: false,
        headers: {
          'Origin': 'http://localhost:5173'
        }
      },
      '/api/v1/chat/completions': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', ''),
        secure: false,
        headers: {
          'Origin': 'http://localhost:5173'
        }
      }
    }
  }
});
