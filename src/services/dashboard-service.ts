import { ApiClient } from './api-client';
import { QueryParams } from '@/types';

export const dashboardService = {
  // 获取基础统计数据
  async getStats(): Promise<unknown> {
    return ApiClient.get('/dashboard/stats');
  },

  // 获取增强统计数据
  async getEnhancedStats(): Promise<unknown> {
    return ApiClient.get('/dashboard/enhanced-stats');
  },

  // 获取额外统计数据
  async getAdditionalStats(): Promise<unknown> {
    return ApiClient.get('/dashboard/additional-stats');
  },

  // 获取ROI排名
  async getRoiRanking(params?: QueryParams): Promise<unknown> {
    return ApiClient.get('/dashboard/roi-ranking', params);
  },

  // 获取达人超时统计
  async getInfluencerTimeoutStats(): Promise<unknown> {
    return ApiClient.get('/dashboard/influencer-timeout-stats');
  },

  // 获取任务进度统计
  async getTaskProgressStats(): Promise<unknown> {
    return ApiClient.get('/dashboard/task-progress-stats');
  },

  // 获取最高超时记录
  async getTopTimeouts(): Promise<unknown> {
    return ApiClient.get('/dashboard/top-timeouts');
  },
};