/**
 * Authentication Service - Integrates with backend API
 */

import { apiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async register(
    email: string,
    username: string,
    password: string
  ): Promise<RegisterResponse> {
    const response = await apiClient.post<{ data: RegisterResponse }>('/users/register', {
      email,
      username,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>('/users/login', {
      email,
      password,
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/users/profile');
    return response.data;
  },

  async updateProfile(username?: string, email?: string): Promise<User> {
    const response = await apiClient.put<{ data: User }>('/users/profile', {
      username,
      email,
    });
    return response.data;
  },

  logout(): void {
    apiClient.clearToken();
  },
};
