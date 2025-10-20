export const ENV = {
  API_BASE: import.meta.env.VITE_API_BASE || '/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:4000',
} as const;
