import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ── Request interceptor: attach JWT token ──
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 + token refresh ──
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);

          // If we also got a new refresh token (rotation), save it
          if (response.data.refresh) {
            localStorage.setItem('refresh_token', response.data.refresh);
          }

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return client(originalRequest);
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        // No refresh token — redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ── Helper to extract error message from API responses ──
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;

    // Check common error response formats
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;

    // DRF validation errors come as { field: [errors] }
    if (data && typeof data === 'object') {
      const messages: string[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          messages.push(`${key}: ${value.join(', ')}`);
        } else if (typeof value === 'string') {
          messages.push(`${key}: ${value}`);
        }
      }
      if (messages.length > 0) return messages.join('\n');
    }

    // HTTP status fallbacks
    if (error.response?.status === 401) return 'Session expired. Please log in again.';
    if (error.response?.status === 403) return 'You don\'t have permission to do this.';
    if (error.response?.status === 404) return 'Resource not found.';
    if (error.response?.status === 500) return 'Server error. Please try again later.';

    // Network errors
    if (error.code === 'ERR_NETWORK') return 'Cannot connect to the server. Please check your connection.';
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  }

  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export default client;