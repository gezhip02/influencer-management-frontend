import { ApiClient } from './api-client';
import { 
  TagEditRequest, 
  TagListRequest, 
  TagListResponse, 
  TagIndexResponse 
} from '@/types';

export const tagService = {
  // 标签首页统计数据
  async getTagIndex(params: TagListRequest): Promise<TagIndexResponse> {
    return ApiClient.post('/tag_index', params);
  },

  // 获取标签列表
  async getTagList(params: TagListRequest): Promise<TagListResponse> {
    return ApiClient.post('/tag_list', params);
  },

  // 编辑标签（新增或修改）
  async editTag(data: TagEditRequest): Promise<{ id: number }> {
    return ApiClient.post('/tag_edit', data);
  },

  // 删除标签
  async deleteTag(id: number): Promise<void> {
    return ApiClient.post('/tag_delete', { id });
  },

  // 批量删除标签（如果后端支持）
  async batchDeleteTags(tagIds: number[]): Promise<void> {
    // 目前后端只支持单个删除，这里循环调用
    for (const id of tagIds) {
      await this.deleteTag(id);
    }
  },

  // 创建标签（便捷方法）
  async createTag(data: Omit<TagEditRequest, 'id'>): Promise<{ id: number }> {
    return this.editTag({ ...data, id: 0 });
  },

  // 更新标签（便捷方法）
  async updateTag(id: number, data: Omit<TagEditRequest, 'id'>): Promise<{ id: number }> {
    return this.editTag({ ...data, id });
  },
};