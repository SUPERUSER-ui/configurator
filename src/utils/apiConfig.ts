const isProd = import.meta.env.PROD;

export const API_CONFIG = {
  baseUrl: isProd 
    ? 'https://template-car-configuratorl-749024317314.us-central1.run.app'
    : '',
  endpoints: {
    rtcConnect: '/api/rtc-connect',
    sendTemplate: '/send_template'
  }
} as const; 