export const setupCSP = () => {
  // En desarrollo, podemos ser menos restrictivos con CSP
  if (import.meta.env.DEV) return;

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.openai.com ws: wss:;
    media-src 'self' blob:;
    worker-src 'self' blob:;
  `.replace(/\s+/g, ' ').trim();
  document.head.appendChild(meta);
};

const generateNonce = () => {
  const nonce = Math.random().toString(36).substring(2);
  // Agregar el nonce al window para que esté disponible globalmente
  (window as any).__CSP_NONCE__ = nonce;
  return nonce;
}; 