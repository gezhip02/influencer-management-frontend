import { ApiClient } from './api-client';
import { BdPerformance, QueryParams, PaginatedResponse } from '@/types';

export const bdPerformanceService = {
  // 获取BD绩效列表
  async getBdPerformances(params?: QueryParams): Promise<PaginatedResponse<BdPerformance>> {
    return ApiClient.get('/bd-performance', params);
  },

  // 获取单个BD绩效
  async getBdPerformanceById(bdId: string): Promise<BdPerformance> {
    return ApiClient.get(`/bd-performance/${bdId}`);
  },

  // 获取BD绩效排名
  async getBdRanking(params?: QueryParams): Promise<unknown> {
    return ApiClient.get('/bd-performance/ranking', params);
  },

  // 导入订单数据
  async importOrders(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post('/bd-performance/import-orders', formData);
  },

  // 导入历史数据
  async importHistory(file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return ApiClient.post('/bd-performance/import-history', formData);
  },

  // 计算绩效
  async calculatePerformance(bdId?: string): Promise<unknown> {
    if (bdId) {
      return ApiClient.post(`/bd-performance/calculate`, { bdId });
    }
    return ApiClient.post('/bd-performance/calculate-all');
  },

  // 导出数据
  async exportData(params?: QueryParams): Promise<Blob> {
    return ApiClient.get('/bd-performance/export', params);
  },

  // 获取导入历史
  async getImportHistory(): Promise<unknown[]> {
    return ApiClient.get('/bd-performance/import-history');
  },

  // 数据管理 - 导入Excel文件
  async importExcel(file: File, fileType: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    return ApiClient.post('/performance_import_excel', formData);
  },
};