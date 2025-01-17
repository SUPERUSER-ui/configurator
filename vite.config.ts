import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/rtc-connect': {
        target: 'https://api.openai.com/v1/realtime',
        changeOrigin: true,
        secure: true,
        ws: true,
        configure: (proxy: any) => {
          proxy.on('proxyReq', (proxyReq: any, req: any) => {
            // Asegurar que el Content-Type es correcto
            proxyReq.setHeader('Content-Type', 'application/sdp');
            
            // Copiar el header de autorización
            const authHeader = req.headers.authorization;
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader);
            }

            // Agregar los parámetros de consulta necesarios
            proxyReq.path = proxyReq.path + '?model=gpt-4&voice=alloy';
          });
        }
      }
    }
  }
});
