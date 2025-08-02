import { ApiClient } from './api-client';
import { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  // 用户登录
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await ApiClient.post<LoginResponse>('/login', loginData);
    
    // 保存 token 到 localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  // 退出登录
  logout(): void {
    localStorage.removeItem('auth_token');
    // 重定向到登录页面
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // 检查是否已登录
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  // 获取当前 token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },
};