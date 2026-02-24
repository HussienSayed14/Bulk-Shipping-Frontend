import client from './client';
import type { LoginRequest, LoginResponse, User } from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await client.post<LoginResponse>('/auth/login/', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await client.post('/auth/refresh/', { refresh: refreshToken });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await client.get<User>('/auth/me/');
    return response.data;
  },
};