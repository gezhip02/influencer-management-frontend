import { ApiClient } from './api-client';
import { 
  ProductListRequest,
  ProductListResponse,
  ProductEditRequest,
  ProductOperationResponse
} from '@/types';

// 数据清理函数
const cleanProductData = (data: Omit<ProductEditRequest, 'id'> | ProductEditRequest): ProductEditRequest | Omit<ProductEditRequest, 'id'> => {
  return {
    ...data,
    name: data.name?.trim() || '',
    description: data.description?.trim() || '',
    brand: data.brand?.trim() || '',
    category: data.category?.trim() || '',
    price: Number(data.price) || 0,
    currency: data.currency?.trim() || 'USD',
    budget: Number(data.budget) || 0,
    target_audience: data.target_audience?.trim() || '',
    content_requirements: data.content_requirements?.trim() || '',
    start_date: Number(data.start_date) || 0,
    end_date: Number(data.end_date) || 0,
    priority: data.priority?.trim() || 'medium',
    country: data.country?.trim() || '',
    sku_series: data.sku_series?.trim() || '',
  };
};

export const productService = {
  // 获取产品列表
  async getProductList(params: ProductListRequest): Promise<ProductListResponse> {
    const cleanParams = {
      page: Number(params.page) || 1,
      page_size: Number(params.page_size) || 10,
      search: params.search?.trim() || '',
      category: params.category?.trim() || '',
    };
    return ApiClient.post('/cooperation_products_list', cleanParams);
  },

  // 编辑/创建产品 - 根据API文档，这个端点既用于创建也用于编辑
  async editProduct(data: ProductEditRequest): Promise<ProductOperationResponse> {
    const cleanData = cleanProductData(data);
    console.log('Sending product data:', cleanData); // 调试日志
    return ApiClient.post('/cooperation_products_edit', cleanData);
  },

  // 创建产品 - 不传id就是创建
  async createProduct(data: Omit<ProductEditRequest, 'id'>): Promise<ProductOperationResponse> {
    const cleanData = cleanProductData(data);
    console.log('Creating product with data:', cleanData); // 调试日志
    return ApiClient.post('/cooperation_products_edit', cleanData);
  },

  // 更新产品 - 传id就是更新
  async updateProduct(id: number, data: Omit<ProductEditRequest, 'id'>): Promise<ProductOperationResponse> {
    const cleanData = cleanProductData({ ...data, id: Number(id) });
    console.log('Updating product with data:', cleanData); // 调试日志
    return ApiClient.post('/cooperation_products_edit', cleanData);
  },

  // 删除产品
  async deleteProduct(id: number): Promise<ProductOperationResponse> {
    const deleteData = { id: Number(id) };
    console.log('Deleting product with data:', deleteData); // 调试日志
    return ApiClient.post('/cooperation_products_delete', deleteData);
  },
};