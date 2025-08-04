import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// 导入MSW准备检查函数
let ensureWorkerReady: (() => Promise<void>) | null = null;

// 动态导入MSW检查函数（仅在开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@/mocks').then(module => {
    ensureWorkerReady = module.ensureWorkerReady;
  }).catch(() => {
    // MSW模块不存在或导入失败，忽略
  });
}

// API 配置
const getBaseURL = () => {
  // 开发环境下使用相对路径，利用Next.js的API代理功能
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  // 生产环境（静态导出）使用完整URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.knnector.com/api';
};

const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    // 确保在客户端环境下执行
    if (typeof window === 'undefined') {
      return config;
    }
    
    // 开发环境下等待MSW准备就绪
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_USE_MOCK !== 'false' &&
        ensureWorkerReady) {
      try {
        await ensureWorkerReady();
        console.log('🔄 MSW已准备就绪，发送API请求');
      } catch (error) {
        console.warn('⚠️ MSW未准备就绪，将尝试直接发送请求:', error);
      }
    }
    
    // 添加认证 token（如果存在）
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('⚠️ 无法获取认证token:', error);
    }
    
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        fullURL: config.url?.startsWith('http') ? config.url : `${config.baseURL}${config.url}`,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      // 开发环境详细错误日志
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error [${status}]:`, {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          response: data,
        });
      }
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转登录
          try {
            localStorage.removeItem('auth_token');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          } catch (error) {
            console.warn('⚠️ 无法清除认证token或跳转登录页:', error);
          }
          break;
        case 403:
          console.error('🚫 权限不足');
          break;
        case 404:
          console.error('🔍 资源未找到');
          break;
        case 500:
          console.error('💥 服务器内部错误');
          break;
        default:
          console.error(`❌ API Error [${status}]:`, data);
      }
    } else if (error.request) {
      console.error('🌐 网络错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 封装的请求方法
export class ApiClient {
  static async get<T>(url: string, params?: unknown): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    if (response.data.code !== 0) {
      throw new Error(response.data.msg);
    }
    return response.data.data;
  }
  
  static async post<T>(url: string, data?: unknown): Promise<T> {
    // 处理FormData
    const config: Record<string, unknown> = {};
    if (data instanceof FormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }
    
    // 开发环境额外日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 POST请求数据:', JSON.stringify(data, null, 2));
    }
    
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    if (response.data.code !== 0) {
      throw new Error(response.data.msg);
    }
    return response.data.data;
  }
  
  static async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    if (response.data.code !== 0) {
      throw new Error(response.data.msg);
    }
    return response.data.data;
  }
  
  static async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data);
    if (response.data.code !== 0) {
      throw new Error(response.data.msg);
    }
    return response.data.data;
  }
  
  static async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    if (response.data.code !== 0) {
      throw new Error(response.data.msg);
    }
    return response.data.data;
  }
}

export default apiClient;