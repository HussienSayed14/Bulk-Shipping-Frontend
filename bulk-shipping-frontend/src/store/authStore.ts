import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username: string, password: string) => {
    const response = await authApi.login({ username, password });

    // Store tokens
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));

    set({
      user: response.user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    set({
      user: null,
      isAuthenticated: false,
    });
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      // Silently fail — interceptor handles 401
    }
  },

  initialize: async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    // Restore user from localStorage first (instant)
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        set({ user, isAuthenticated: true });
      } catch {
        // Corrupted data
      }
    }

    // Then verify token is still valid by calling /me
    try {
      const user = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token expired and refresh failed
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));