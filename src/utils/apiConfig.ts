export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173',
  endpoints: {
    rtcConnect: '/api/rtc-connect'
  }
} as const; 