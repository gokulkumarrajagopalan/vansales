import axios from 'axios';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Auto-inject stored JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens / 401s without forcing full-page reload inside SPA
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API 401] Unauthorized or token expired');
      localStorage.removeItem('token');
      localStorage.removeItem('backend_user');
    }
    return Promise.reject(error);
  }
);
