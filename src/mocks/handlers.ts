import { http, HttpResponse } from 'msw';
import { 
  mockInfluencers, 
  mockFulfillmentRecords, 
  mockTags, 
  mockDashboardStats,
  mockEnhancedStats,
  mockAdditionalStats,
  mockRoiRanking,
  mockTimeoutStats,
  mockTaskProgressStats,
  mockTopTimeouts,
  mockUsers,
  mockBdPerformances,
  mockBdRanking,
  mockImportHistory
} from './data';

// 获取API基础URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
  }
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

export const handlers = [
  // Test handler first
  http.get(`${API_BASE_URL}/test`, () => {
    console.log('🎯 Mock拦截到test请求');
    return HttpResponse.json({ message: 'MSW is working!' });
  }),

  // Test with simpler path too
  http.get('/api/test', () => {
    console.log('🎯 Mock拦截到/api/test请求');
    return HttpResponse.json({ message: 'MSW is working via /api!' });
  }),

  // Influencers API - 两种URL模式都支持
  http.get(`${API_BASE_URL}/influencers`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    
    console.log('🎯 Mock拦截到influencers请求 (完整URL):', request.url, { page, pageSize, search });
    
    let filteredInfluencers = mockInfluencers;
    
    if (search) {
      filteredInfluencers = mockInfluencers.filter(influencer => 
        influencer.name.toLowerCase().includes(search.toLowerCase()) ||
        influencer.platform.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredInfluencers.slice(startIndex, endIndex);
    
    const response = {
      code: 200,
      success: true,
      data: {
        data: paginatedData,
        total: filteredInfluencers.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredInfluencers.length / pageSize)
      },
      message: 'Success'
    };
    
    console.log('📤 Mock返回influencers数据:', { 
      total: response.data.total, 
      currentPageCount: paginatedData.length 
    });
    
    return HttpResponse.json(response);
  }),

  http.get('/api/influencers', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    
    console.log('🎯 Mock拦截到influencers请求 (简单路径):', request.url, { page, pageSize, search });
    
    let filteredInfluencers = mockInfluencers;
    
    if (search) {
      filteredInfluencers = mockInfluencers.filter(influencer => 
        influencer.name.toLowerCase().includes(search.toLowerCase()) ||
        influencer.platform.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredInfluencers.slice(startIndex, endIndex);
    
    const response = {
      code: 200,
      success: true,
      data: {
        data: paginatedData,
        total: filteredInfluencers.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredInfluencers.length / pageSize)
      },
      message: 'Success'
    };
    
    console.log('📤 Mock返回influencers数据:', { 
      total: response.data.total, 
      currentPageCount: paginatedData.length 
    });
    
    return HttpResponse.json(response);
  }),

  // Tags API - 两种URL模式都支持
  http.get(`${API_BASE_URL}/tags`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    console.log('🎯 Mock拦截到tags请求 (完整URL):', request.url, { page, pageSize });
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = mockTags.slice(startIndex, endIndex);
    
    const response = {
      code: 200,
      success: true,
      data: {
        data: paginatedData,
        total: mockTags.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockTags.length / pageSize)
      },
      message: 'Success'
    };
    
    console.log('📤 Mock返回tags数据:', { 
      total: response.data.total, 
      currentPageCount: paginatedData.length 
    });
    
    return HttpResponse.json(response);
  }),

  http.get('/api/tags', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    console.log('🎯 Mock拦截到tags请求 (简单路径):', request.url, { page, pageSize });
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = mockTags.slice(startIndex, endIndex);
    
    const response = {
      code: 200,
      success: true,
      data: {
        data: paginatedData,
        total: mockTags.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockTags.length / pageSize)
      },
      message: 'Success'
    };
    
    console.log('📤 Mock返回tags数据:', { 
      total: response.data.total, 
      currentPageCount: paginatedData.length 
    });
    
    return HttpResponse.json(response);
  }),

  // Fulfillment Records API - 两种URL模式都支持
  http.get(`${API_BASE_URL}/fulfillment-records`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');
    
    console.log('🎯 Mock拦截到fulfillment-records请求 (完整URL):', request.url, { page, pageSize, status });
    
    let filteredRecords = mockFulfillmentRecords;
    
    if (status) {
      filteredRecords = mockFulfillmentRecords.filter(record => record.status === status);
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredRecords.slice(startIndex, endIndex);
    
    const response = {
      code: 200,
      success: true,
      data: {
        data: paginatedData,
        total: filteredRecords.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredRecords.length / pageSize)
      },
      message: 'Success'
    };
    
    console.log('📤 Mock返回fulfillment-records数据:', { 
      total: response.data.total, 
      currentPageCount: paginatedData.length 
    });
    
    return HttpResponse.json(response);
  }),

  http.get('/api/fulfillment-records', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');
    
    console.log('🎯 Mock拦截到fulfillment-records请求 (简单路径):', request.url, { page, pageSize, status });
    
    let filteredRecords = mockFulfillmentRecords;
    
    if (status) {
      filteredRecords = mockFulfillmentRecords.filter(record => record.status === status);
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredRecords.slice(startIndex, endIndex);
    
    const response = {
      code: 200,
      success: true,
      data: {
        data: paginatedData,
        total: filteredRecords.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredRecords.length / pageSize)
      },
      message: 'Success'
    };
    
    console.log('📤 Mock返回fulfillment-records数据:', { 
      total: response.data.total, 
      currentPageCount: paginatedData.length 
    });
    
    return HttpResponse.json(response);
  }),

  // Dashboard API
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      code: 200,
      success: true,
      data: mockDashboardStats,
      message: 'Success'
    });
  }),

  // 其他所有API都使用通配符模式
  http.get('*/api/*', ({ request }) => {
    const url = new URL(request.url);
    console.log('❌ 未处理的API请求:', url.pathname, url.search);
    
    // 返回默认的空数据响应
    return HttpResponse.json({
      code: 200,
      success: true,
      data: {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      },
      message: 'Mock fallback response'
    });
  }),
];