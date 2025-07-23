import { ApiClient } from './api-client';
import { User, QueryParams, PaginatedResponse } from '@/types';

export const userService = {
  // 获取用户列表
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    return ApiClient.get('/users', params);
  },

  // 获取单个用户
  async getUserById(id: string): Promise<User> {
    return ApiClient.get(`/users/${id}`);
  },

  // 创建用户
  async createUser(userData: Partial<User>): Promise<User> {
    return ApiClient.post('/users', userData);
  },

  // 更新用户
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return ApiClient.put(`/users/${id}`, userData);
  },

  // 删除用户
  async deleteUser(id: string): Promise<void> {
    return ApiClient.delete(`/users/${id}`);
  },

  // 批量操作
  async batchUpdateUsers(userIds: string[], updateData: Partial<User>): Promise<void> {
    return ApiClient.post('/users/batch', { ids: userIds, data: updateData });
  },
};