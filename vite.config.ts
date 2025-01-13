import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/rtc-connect': {
        target: 'https://api.openai.com/v1/realtime',
        changeOrigin: true,
        rewrite: (path) => '',
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            // Copiar el header de autorización
            const authHeader = req.headers.authorization;
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader);
            }

            // Asegurar que el Content-Type es correcto
            proxyReq.setHeader('Content-Type', 'application/sdp');

            // Agregar los parámetros de consulta necesarios
            const url = new URL(proxyReq.path, 'https://api.openai.com');
            url.searchParams.set('model', 'gpt-4o-realtime-preview-2024-12-17');
            url.searchParams.set('voice', 'alloy');
            proxyReq.path = url.pathname + url.search;
          });
        },
      },
      // Mantener otros proxies si los necesitas
    },
  },
});
