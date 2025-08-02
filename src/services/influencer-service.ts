import { ApiClient } from './api-client';
import { 
  InfluencerSaveRequest,
  InfluencerInfo,
  InfluencerListRequest,
  InfluencerListResponse,
  InfluencerIndexResponse,
  InfluencerTagUpdateRequest,
  InfluencerSignedRequest
} from '@/types';

export const influencerService = {
  // 获取达人首页数据
  async getInfluencerIndex(): Promise<InfluencerIndexResponse> {
    return ApiClient.post('/influencer_index', {});
  },

  // 获取达人列表
  async getInfluencerList(params: InfluencerListRequest): Promise<InfluencerListResponse> {
    return ApiClient.post('/influencer_list', params);
  },

  // 获取达人详细信息
  async getInfluencerInfo(id: number): Promise<InfluencerInfo> {
    return ApiClient.post('/influencer_info', { id });
  },

  // 创建或更新达人
  async saveInfluencer(data: InfluencerSaveRequest): Promise<{ id: number }> {
    return ApiClient.post('/influencer_save', data);
  },

  // 创建达人（便捷方法）
  async createInfluencer(data: Omit<InfluencerSaveRequest, 'id'>): Promise<{ id: number }> {
    return this.saveInfluencer({ ...data, id: 0 });
  },

  // 更新达人（便捷方法）
  async updateInfluencer(id: number, data: Omit<InfluencerSaveRequest, 'id'>): Promise<{ id: number }> {
    return this.saveInfluencer({ ...data, id });
  },

  // 删除达人
  async deleteInfluencer(id: number): Promise<void> {
    return ApiClient.post('/influencer_delete', { id });
  },

  // 更新达人标签
  async updateInfluencerTags(data: InfluencerTagUpdateRequest): Promise<void> {
    return ApiClient.post('/influencer_up_tag', data);
  },

  // 达人签约
  async signInfluencer(data: InfluencerSignedRequest): Promise<{ id: number }> {
    return ApiClient.post('/influencer_signed', data);
  },

  // 删除达人签约
  async deleteInfluencerSigned(id: number): Promise<{ id: number }> {
    return ApiClient.post('/influencer_del_signed', { id });
  },

  // 批量导入达人
  async importInfluencers(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    return ApiClient.post('/influencer_import', formData);
  },
};