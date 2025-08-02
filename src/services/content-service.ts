import { ApiClient } from './api-client';
import { 
  ContentIndexResponse,
  ContentListRequest,
  ContentListResponse,
  ContentEditRequest
} from '@/types';

export const contentService = {
  // 内容管理首页统计数据
  async getContentIndex(): Promise<ContentIndexResponse> {
    return ApiClient.post('/content_index', {});
  },

  // 获取内容列表
  async getContentList(params: ContentListRequest): Promise<ContentListResponse> {
    return ApiClient.post('/content_list', params);
  },

  // 编辑内容
  async editContent(data: ContentEditRequest): Promise<void> {
    return ApiClient.post('/content_edit', data);
  },

  // 导入内容数据
  async importContentExcel(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post('/content_import_excel', formData);
  },
};