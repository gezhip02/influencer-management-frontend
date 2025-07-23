import { ApiClient } from './api-client';
import { Influencer, QueryParams, PaginatedResponse } from '@/types';

export const influencerService = {
  // 获取达人列表
  async getInfluencers(params?: QueryParams): Promise<PaginatedResponse<Influencer>> {
    return ApiClient.get('/influencers', params);
  },

  // 获取单个达人
  async getInfluencerById(id: string): Promise<Influencer> {
    return ApiClient.get(`/influencers/${id}`);
  },

  // 创建达人
  async createInfluencer(data: Partial<Influencer>): Promise<Influencer> {
    return ApiClient.post('/influencers', data);
  },

  // 更新达人
  async updateInfluencer(id: string, data: Partial<Influencer>): Promise<Influencer> {
    return ApiClient.put(`/influencers/${id}`, data);
  },

  // 删除达人
  async deleteInfluencer(id: string): Promise<void> {
    return ApiClient.delete(`/influencers/${id}`);
  },

  // 批量操作
  async batchUpdateInfluencers(ids: string[], data: Partial<Influencer>): Promise<void> {
    return ApiClient.post('/influencers/batch', { ids, data });
  },

  // 获取达人合同信息
  async getInfluencerContract(id: string): Promise<any> {
    return ApiClient.get(`/influencers/${id}/contract`);
  },

  // 更新达人合同
  async updateInfluencerContract(id: string, contractData: any): Promise<any> {
    return ApiClient.put(`/influencers/${id}/contract`, contractData);
  },
};