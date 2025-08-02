import { ApiClient } from './api-client';

export interface LoginRequest {
  account: string;
  password: string;
  company_id?: number;
  is_sub_user?: boolean;
  main_user_account?: string;
}

export interface LoginResponse {
  token: string;
}

export const userService = {
  // 登录
  async login(data: LoginRequest): Promise<LoginResponse> {
    return ApiClient.post('/login', data);
  },
};