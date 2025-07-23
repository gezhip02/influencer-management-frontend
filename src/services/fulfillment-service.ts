import { ApiClient } from './api-client';
import { FulfillmentRecord, QueryParams, PaginatedResponse } from '@/types';

export const fulfillmentService = {
  // 获取履约记录列表
  async getFulfillmentRecords(params?: QueryParams): Promise<PaginatedResponse<FulfillmentRecord>> {
    return ApiClient.get('/fulfillment-records', params);
  },

  // 获取单个履约记录
  async getFulfillmentRecordById(id: string): Promise<FulfillmentRecord> {
    return ApiClient.get(`/fulfillment-records/${id}`);
  },

  // 创建履约记录
  async createFulfillmentRecord(data: Partial<FulfillmentRecord>): Promise<FulfillmentRecord> {
    return ApiClient.post('/fulfillment-records', data);
  },

  // 更新履约记录
  async updateFulfillmentRecord(id: string, data: Partial<FulfillmentRecord>): Promise<FulfillmentRecord> {
    return ApiClient.put(`/fulfillment-records/${id}`, data);
  },

  // 删除履约记录
  async deleteFulfillmentRecord(id: string): Promise<void> {
    return ApiClient.delete(`/fulfillment-records/${id}`);
  },

  // 更新履约状态
  async updateFulfillmentStatus(id: string, status: string, comment?: string): Promise<FulfillmentRecord> {
    return ApiClient.post(`/fulfillment-records/${id}/status`, { status, comment });
  },

  // 获取状态日志
  async getStatusLogs(id: string): Promise<any[]> {
    return ApiClient.get(`/fulfillment-records/${id}/status-logs`);
  },

  // 批量操作标签
  async batchUpdateTags(recordIds: string[], tagIds: string[]): Promise<void> {
    return ApiClient.post('/fulfillment-records/batch-tags', { recordIds, tagIds });
  },

  // 获取时效性数据
  async getTimelinessStats(params?: QueryParams): Promise<any> {
    return ApiClient.get('/fulfillment-records/timeliness', params);
  },

  // 获取绩效统计
  async getPerformanceStats(params?: QueryParams): Promise<any> {
    return ApiClient.get('/fulfillment-records/performance/top-performers', params);
  },
};