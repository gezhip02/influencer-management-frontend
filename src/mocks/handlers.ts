import { http, HttpResponse } from 'msw';
import { 
  mockInfluencers, 
  mockTags, 
  mockDashboardStats
} from './data';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "爆款私模小球机",
    description: "墨西哥安防爆款私模小球机",
    brand: "cozycast",
    category: "electronics",
    price: 269,
    currency: "USD",
    priority: "high",
    country: "MX",
    sku_series: ""
  },
  {
    id: 2,
    name: "普通小球机",
    description: "墨西哥安防普通小球机",
    brand: "cozycast",
    category: "electronics",
    price: 199,
    currency: "USD",
    priority: "medium",
    country: "MX",
    sku_series: ""
  },
  {
    id: 3,
    name: "菱形10灯小球机",
    description: "墨西哥安防菱形10灯小球机",
    brand: "cozycast",
    category: "electronics",
    price: 239,
    currency: "USD",
    priority: "medium",
    country: "MX",
    sku_series: ""
  },
  {
    id: 4,
    name: "双目摄像头",
    description: "墨西哥安防双目摄像头",
    brand: "cozycast",
    category: "electronics",
    price: 438,
    currency: "USD",
    priority: "medium",
    country: "MX",
    sku_series: ""
  },
  {
    id: 5,
    name: "灯泡摄像头",
    description: "墨西哥安防灯泡摄像头",
    brand: "cozycast",
    category: "electronics",
    price: 180,
    currency: "USD",
    priority: "medium",
    country: "MX",
    sku_series: ""
  },
  {
    id: 6,
    name: "套机摄像头",
    description: "墨西哥安防套机摄像头",
    brand: "cozycast",
    category: "electronics",
    price: 1600,
    currency: "USD",
    priority: "medium",
    country: "MX",
    sku_series: ""
  },
  {
    id: 7,
    name: "墨西哥投影仪",
    description: "墨西哥圆筒投影仪",
    brand: "HALIMOMO",
    category: "electronics",
    price: 720,
    currency: "USD",
    priority: "medium",
    country: "MX",
    sku_series: ""
  },
  {
    id: 8,
    name: "巴西投影仪",
    description: "巴西圆筒投影仪",
    brand: "DAOYEE",
    category: "electronics",
    price: 210,
    currency: "USD",
    priority: "medium",
    country: "BR",
    sku_series: ""
  }
];

// Mock fulfillment data
const mockFulfillmentIndex = {
  cooperation_plan_list: [
    {
      id: 1,
      title: "达人自制短视频寄样品",
      description: "达人自制短视频内容，需要寄送样品",
      tags: "短视频,需要寄样,达人自制"
    },
    {
      id: 2,
      title: "达人自制短视频不寄样品",
      description: "达人自制短视频内容，不需要寄送样品",
      tags: "短视频,达人自制"
    },
    {
      id: 3,
      title: "直播寄样品",
      description: "直播带货形式，需要寄送样品",
      tags: "直播带货,需要寄样,达人自制"
    },
    {
      id: 4,
      title: "直播不寄样品",
      description: "直播带货形式，不需要寄送样品",
      tags: "直播带货,达人自制"
    },
    {
      id: 5,
      title: "商家提供短视频不寄样品",
      description: "商家提供短视频素材，达人发布，不需要寄送样品",
      tags: "短视频"
    }
  ],
  priority_list: [
    { id: 1, name: "高" },
    { id: 2, name: "中" },
    { id: 3, name: "低" }
  ],
  status_list: [
    { id: "pending", name: "待寄样" },
    { id: "sent", name: "已寄样" },
    { id: "received", name: "已签收" },
    { id: "content_created", name: "内容制作" },
    { id: "published", name: "已发布" },
    { id: "sales_conversion", name: "销售转化" },
    { id: "completed", name: "已完成" },
    { id: "canceled", name: "取消" },
    { id: "timeout", name: "超时" }
  ],
  handler_user_list: [
    { id: 1, name: "张管理员" },
    { id: 2, name: "李运营" },
    { id: 3, name: "王商务" }
  ]
};

const mockFulfillmentRecords = [
  {
    id: 1,
    influencer_id: 1,
    influencer_name: "美妆达人小雅",
    product_name: "爆款私模小球机",
    status: "content_created",
    status_text: "内容制作",
    priority: 1,
    priority_text: "高",
    created_at: Math.floor(Date.now() / 1000),
    remark: "内容制作中",
    cooperation_plan: "达人自制短视频寄样品",
    end_time: Math.floor(Date.now() / 1000) + 86400 * 7 // 7天后
  },
  {
    id: 2,
    influencer_id: 2,
    influencer_name: "科技评测师张三",
    product_name: "双目摄像头",
    status: "sent",
    status_text: "已寄样",
    priority: 2,
    priority_text: "中",
    created_at: Math.floor(Date.now() / 1000) - 86400 * 2,
    remark: "已寄样，等待签收",
    cooperation_plan: "达人自制短视频寄样品",
    end_time: Math.floor(Date.now() / 1000) + 86400 * 5
  },
  {
    id: 3,
    influencer_id: 3,
    influencer_name: "时尚博主Lisa",
    product_name: "墨西哥投影仪",
    status: "completed",
    status_text: "已完成",
    priority: 1,
    priority_text: "高",
    created_at: Math.floor(Date.now() / 1000) - 86400 * 10,
    remark: "合作完成",
    cooperation_plan: "直播寄样品",
    end_time: Math.floor(Date.now() / 1000) - 86400
  }
];

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

  // === 履约管理API ===
  // 履约首页 - POST 方法
  http.post('/api/fulfillment_index', async ({ request }) => {
    console.log('🎯 Mock拦截到履约首页请求');
    
    const response = {
      code: 0,
      msg: 'success',
      data: mockFulfillmentIndex
    };
    
    console.log('📤 Mock返回履约首页数据');
    return HttpResponse.json(response);
  }),

  // 履约列表 - POST 方法
  http.post('/api/fulfillment_list', async ({ request }) => {
    console.log('🎯 Mock拦截到履约列表请求');
    
    try {
      const body = await request.json() as any;
      const { page = 1, page_size = 10, search = '', status = '', priority = 0, id = null } = body;
      
      console.log('📋 履约列表请求参数:', { page, page_size, search, status, priority, id });
      
      let filteredRecords = [...mockFulfillmentRecords];
      
      // 按ID过滤
      if (id) {
        filteredRecords = filteredRecords.filter(record => record.id === Number(id));
      }
      
      // 搜索过滤
      if (search) {
        filteredRecords = filteredRecords.filter(record => 
          record.influencer_name.toLowerCase().includes(search.toLowerCase()) ||
          record.product_name.toLowerCase().includes(search.toLowerCase()) ||
          record.cooperation_plan.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // 状态过滤
      if (status) {
        filteredRecords = filteredRecords.filter(record => record.status === status);
      }
      
      // 优先级过滤
      if (priority > 0) {
        filteredRecords = filteredRecords.filter(record => record.priority === Number(priority));
      }
      
      // 分页处理
      const startIndex = (page - 1) * page_size;
      const endIndex = startIndex + page_size;
      const paginatedData = filteredRecords.slice(startIndex, endIndex);
      
      const response = {
        code: 0,
        msg: 'success',
        data: {
          total: filteredRecords.length,
          list: paginatedData
        }
      };
      
      console.log('📤 Mock返回履约列表数据:', { 
        total: response.data.total, 
        currentPageCount: paginatedData.length 
      });
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 履约列表处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 创建履约单 - POST 方法
  http.post('/api/fulfillment_save', async ({ request }) => {
    console.log('🎯 Mock拦截到创建履约单请求');
    
    try {
      const body = await request.json() as any;
      console.log('📝 创建履约单请求数据:', body);
      
      // 模拟创建履约单
      const newId = Math.max(...mockFulfillmentRecords.map(r => r.id)) + 1;
      
      const newRecord = {
        id: newId,
        influencer_id: Number(body.influencer_id),
        influencer_name: "新达人", // 实际应该从达人库获取
        product_name: "新产品", // 实际应该从产品库获取
        status: "pending",
        status_text: "待寄样",
        priority: Number(body.priority),
        priority_text: body.priority === 1 ? "高" : body.priority === 2 ? "中" : "低",
        created_at: Math.floor(Date.now() / 1000),
        remark: body.remark || '',
        cooperation_plan: "达人自制短视频寄样品", // 实际应该从合作方案获取
        end_time: Math.floor(Date.now() / 1000) + 86400 * 7
      };
      
      mockFulfillmentRecords.push(newRecord);
      
      const response = {
        code: 0,
        msg: 'success',
        data: { id: newId }
      };
      
      console.log('✅ 履约单创建成功:', newId);
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 创建履约单处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 更新履约单状态 - POST 方法
  http.post('/api/fulfillment_update', async ({ request }) => {
    console.log('🎯 Mock拦截到更新履约单请求');
    
    try {
      const body = await request.json() as any;
      console.log('📝 更新履约单请求数据:', body);
      
      const { id, status, remark } = body;
      const index = mockFulfillmentRecords.findIndex(r => r.id === Number(id));
      
      if (index >= 0) {
        // 更新记录
        mockFulfillmentRecords[index] = {
          ...mockFulfillmentRecords[index],
          status,
          status_text: mockFulfillmentIndex.status_list.find(s => s.id === status)?.name || status,
          remark: remark || mockFulfillmentRecords[index].remark
        };
        
        console.log('✅ 履约单更新成功:', id);
        
        const response = {
          code: 0,
          msg: 'success',
          data: { id: Number(id) }
        };
        
        return HttpResponse.json(response);
      } else {
        return HttpResponse.json({
          code: 1,
          msg: '履约单不存在',
          data: null
        });
      }
    } catch (error) {
      console.error('❌ 更新履约单处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 删除履约单 - POST 方法
  http.post('/api/fulfillment_delete', async ({ request }) => {
    console.log('🎯 Mock拦截到删除履约单请求');
    
    try {
      const body = await request.json() as { id: number };
      const { id } = body;
      
      console.log('🗑️ 删除履约单ID:', id);
      
      const index = mockFulfillmentRecords.findIndex(r => r.id === Number(id));
      if (index >= 0) {
        mockFulfillmentRecords.splice(index, 1);
        console.log('✅ 履约单删除成功:', id);
      }
      
      const response = {
        code: 0,
        msg: 'success',
        data: {}
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 删除履约单处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 履约单报表 - POST 方法
  http.post('/api/fulfillment_report', async ({ request }) => {
    console.log('🎯 Mock拦截到履约单报表请求');
    
    try {
      const body = await request.json() as any;
      const { report_type } = body;
      
      console.log('📊 报表类型:', report_type);
      
      // 模拟不同类型的报表数据
      const response = {
        code: 0,
        msg: 'success',
        data: {
          report_data_1: report_type === 1 ? [
            { product_id: 1, product_name: "爆款私模小球机", count: 3 },
            { product_id: 2, product_name: "双目摄像头", count: 2 },
            { product_id: 3, product_name: "墨西哥投影仪", count: 1 }
          ] : null,
          report_data_2: report_type === 2 ? [
            { status: "completed", count: 1 },
            { status: "content_created", count: 1 },
            { status: "sent", count: 1 }
          ] : null,
          report_data_3: null,
          report_data_4: null,
          report_data_5: null,
          report_data_6: null,
          report_data_7: null,
          report_data_8: null
        }
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 履约单报表处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 履约单明细列表 - POST 方法
  http.post('/api/fulfillment_details', async ({ request }) => {
    console.log('🎯 Mock拦截到履约单明细请求');
    
    try {
      const body = await request.json() as any;
      const { page = 1, page_size = 10, search = '', status = '', product_id = 0 } = body;
      
      // 模拟明细数据
      let mockDetails = mockFulfillmentRecords.map(record => ({
        id: record.id,
        product_name: record.product_name,
        influencer_name: record.influencer_name,
        status: record.status_text,
        status_timeout_at: 0,
        timeout_at: 0,
        nickname: "负责人" + record.id,
        start_time: record.created_at
      }));
      
      // 过滤
      if (search) {
        mockDetails = mockDetails.filter(detail => 
          detail.product_name.toLowerCase().includes(search.toLowerCase()) ||
          detail.influencer_name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (status) {
        mockDetails = mockDetails.filter(detail => detail.status === status);
      }
      
      if (product_id > 0) {
        // 这里简化处理，实际应该根据product_id过滤
      }
      
      // 分页
      const startIndex = (page - 1) * page_size;
      const endIndex = startIndex + page_size;
      const paginatedData = mockDetails.slice(startIndex, endIndex);
      
      const response = {
        code: 0,
        msg: 'success',
        data: {
          total: mockDetails.length,
          list: paginatedData
        }
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 履约单明细处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // === 产品管理API ===
  // 产品列表 - POST 方法
  http.post('/api/cooperation_products_list', async ({ request }) => {
    console.log('🎯 Mock拦截到产品列表请求');
    
    try {
      const body = await request.json() as { page: number; page_size: number; search: string; category: string };
      const { page = 1, page_size = 10, search = '', category = '' } = body;
      
      console.log('📋 产品列表请求参数:', { page, page_size, search, category });
      
      let filteredProducts = [...mockProducts];
      
      // 搜索过滤
      if (search) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase()) ||
          product.brand.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // 分类过滤
      if (category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // 分页处理
      const startIndex = (page - 1) * page_size;
      const endIndex = startIndex + page_size;
      const paginatedData = filteredProducts.slice(startIndex, endIndex);
      
      const response = {
        code: 0,
        msg: 'success',
        data: {
          total: filteredProducts.length,
          list: paginatedData
        }
      };
      
      console.log('📤 Mock返回产品列表数据:', { 
        total: response.data.total, 
        currentPageCount: paginatedData.length 
      });
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 产品列表处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 产品编辑/创建 - POST 方法
  http.post('/api/cooperation_products_edit', async ({ request }) => {
    console.log('🎯 Mock拦截到产品编辑请求');
    
    try {
      const body = await request.json() as any;
      console.log('📝 产品编辑请求数据:', body);
      
      // 模拟创建或更新
      const productId = body.id || Math.max(...mockProducts.map(p => p.id)) + 1;
      
      if (body.id) {
        // 更新现有产品
        const index = mockProducts.findIndex(p => p.id === body.id);
        if (index >= 0) {
          mockProducts[index] = { ...mockProducts[index], ...body };
          console.log('✅ 产品更新成功:', productId);
        }
      } else {
        // 创建新产品
        const newProduct = {
          id: productId,
          name: body.name || '',
          description: body.description || '',
          brand: body.brand || '',
          category: body.category || '',
          price: Number(body.price) || 0,
          currency: body.currency || 'USD',
          priority: body.priority || 'medium',
          country: body.country || '',
          sku_series: body.sku_series || ''
        };
        mockProducts.push(newProduct);
        console.log('✅ 产品创建成功:', productId);
      }
      
      const response = {
        code: 0,
        msg: 'success',
        data: { id: productId }
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 产品编辑处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 产品删除 - POST 方法
  http.post('/api/cooperation_products_delete', async ({ request }) => {
    console.log('🎯 Mock拦截到产品删除请求');
    
    try {
      const body = await request.json() as { id: number };
      const { id } = body;
      
      console.log('🗑️ 删除产品ID:', id);
      
      const index = mockProducts.findIndex(p => p.id === id);
      if (index >= 0) {
        mockProducts.splice(index, 1);
        console.log('✅ 产品删除成功:', id);
      }
      
      const response = {
        code: 0,
        msg: 'success',
        data: { id }
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 产品删除处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
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

  // === 标签管理API ===
  // 标签首页统计数据 - POST 方法
  http.post('/api/tag_index', async ({ request }) => {
    console.log('🎯 Mock拦截到标签首页请求');
    
    try {
      const body = await request.json() as any;
      console.log('📋 标签首页请求参数:', body);
      
      const response = {
        code: 0,
        msg: 'success',
        data: {
          tag_total: mockTags.length,
          influencer_total: mockInfluencers.length,
          tag_category_total: 3,
          tag_category_list: [
            { id: 1, name: "产品标签" },
            { id: 2, name: "达人标签" },
            { id: 3, name: "合作标签" }
          ]
        }
      };
      
      console.log('📤 Mock返回标签首页数据:', response.data);
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 标签首页处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 标签列表 - POST 方法
  http.post('/api/tag_list', async ({ request }) => {
    console.log('🎯 Mock拦截到标签列表请求');
    
    try {
      const body = await request.json() as any;
      const { page = 1, page_size = 20, search = '' } = body;
      
      console.log('📋 标签列表请求参数:', { page, page_size, search });
      
      let filteredTags = [...mockTags];
      
      // 搜索过滤
      if (search) {
        filteredTags = filteredTags.filter(tag => 
          tag.name.toLowerCase().includes(search.toLowerCase()) ||
          tag.display_name?.toLowerCase().includes(search.toLowerCase()) ||
          tag.remark?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // 分页处理
      const startIndex = (page - 1) * page_size;
      const endIndex = startIndex + page_size;
      const paginatedData = filteredTags.slice(startIndex, endIndex);
      
      const response = {
        code: 0,
        msg: 'success',
        data: {
          total: filteredTags.length,
          list: paginatedData
        }
      };
      
      console.log('📤 Mock返回标签列表数据:', { 
        total: response.data.total, 
        currentPageCount: paginatedData.length 
      });
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 标签列表处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 标签编辑 - POST 方法
  http.post('/api/tag_edit', async ({ request }) => {
    console.log('🎯 Mock拦截到标签编辑请求');
    
    try {
      const body = await request.json() as any;
      console.log('📝 标签编辑请求数据:', body);
      
      const { id, name, display_name, category, color, icon, remark } = body;
      
      if (id === 0) {
        // 创建新标签
        const newId = Math.max(...mockTags.map(t => t.id)) + 1;
        const newTag = {
          id: newId,
          name: name || display_name,
          display_name: display_name || name,
          category: category || 1,
          category_name: "产品标签",
          color: color || '#6B7280',
          icon: icon || '',
          remark: remark || '',
          influencer_count: 0,
          created_at: Math.floor(Date.now() / 1000)
        };
        
        mockTags.push(newTag);
        console.log('✅ 标签创建成功:', newId);
        
        return HttpResponse.json({
          code: 0,
          msg: 'success',
          data: { id: newId }
        });
      } else {
        // 更新现有标签
        const index = mockTags.findIndex(t => t.id === id);
        if (index >= 0) {
          mockTags[index] = {
            ...mockTags[index],
            name: name || mockTags[index].name,
            display_name: display_name || mockTags[index].display_name,
            category: category || mockTags[index].category,
            color: color || mockTags[index].color,
            icon: icon || mockTags[index].icon,
            remark: remark || mockTags[index].remark
          };
          
          console.log('✅ 标签更新成功:', id);
          
          return HttpResponse.json({
            code: 0,
            msg: 'success',
            data: { id }
          });
        } else {
          return HttpResponse.json({
            code: 1,
            msg: '标签不存在',
            data: null
          });
        }
      }
    } catch (error) {
      console.error('❌ 标签编辑处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
  }),

  // 标签删除 - POST 方法
  http.post('/api/tag_delete', async ({ request }) => {
    console.log('🎯 Mock拦截到标签删除请求');
    
    try {
      const body = await request.json() as { id: number };
      const { id } = body;
      
      console.log('🗑️ 删除标签ID:', id);
      
      const index = mockTags.findIndex(t => t.id === id);
      if (index >= 0) {
        mockTags.splice(index, 1);
        console.log('✅ 标签删除成功:', id);
      }
      
      const response = {
        code: 0,
        msg: 'success',
        data: {}
      };
      
      return HttpResponse.json(response);
    } catch (error) {
      console.error('❌ 标签删除处理失败:', error);
      return HttpResponse.json({
        code: 1,
        msg: 'Internal server error',
        data: null
      }, { status: 500 });
    }
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