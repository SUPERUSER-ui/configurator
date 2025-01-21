export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '',
  endpoints: {
    rtcConnect: '/api/rtc-connect',
    sendTemplate: '/send_template'
  }
} as const; 