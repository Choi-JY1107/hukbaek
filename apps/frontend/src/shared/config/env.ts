export const ENV = {
  API_BASE: import.meta.env.VITE_API_BASE || '/api',
  WS_URL: import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
} as const;
