import { ApiClient } from './api-client';
import { Tag, QueryParams, PaginatedResponse } from '@/types';

export const tagService = {
  // 获取标签列表
  async getTags(params?: QueryParams): Promise<PaginatedResponse<Tag>> {
    return ApiClient.get('/tags', params);
  },

  // 获取单个标签
  async getTagById(id: string): Promise<Tag> {
    return ApiClient.get(`/tags/${id}`);
  },

  // 创建标签
  async createTag(data: Partial<Tag>): Promise<Tag> {
    return ApiClient.post('/tags', data);
  },

  // 更新标签
  async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
    return ApiClient.put(`/tags/${id}`, data);
  },

  // 删除标签
  async deleteTag(id: string): Promise<void> {
    return ApiClient.delete(`/tags/${id}`);
  },

  // 批量删除标签
  async batchDeleteTags(tagIds: string[]): Promise<void> {
    return ApiClient.post('/tags/batch-delete', { ids: tagIds });
  },
};