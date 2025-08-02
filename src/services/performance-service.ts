import { ApiClient } from './api-client';

export const performanceService = {
  // 数据管理 - 上传Excel文件
  async importExcel(file: File, fileType: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    return ApiClient.post('/performance_import_excel', formData);
  },

  // 榜单
  async ranking(file: File, fileType: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    
    return ApiClient.post('/performance_ranking', formData);
  },
};