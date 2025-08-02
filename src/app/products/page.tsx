'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { productService } from '@/services';
import type { 
  ProductInfo, 
  ProductListRequest,
  ProductEditRequest
} from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductInfo | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    total: 0,
  });

  const [filters, setFilters] = useState<ProductListRequest>({
    page: 1,
    page_size: 12,
    search: '',
    category: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // 手动搜索
  const handleSearch = () => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    // 直接使用新的过滤条件进行搜索，而不是依赖状态更新
    loadProductsWithFilters(newFilters);
  };

  useEffect(() => {
    loadProducts();
  }, [filters.page, filters.category]); // 移除 filters.search，避免实时搜索

  const loadProducts = async () => {
    await loadProductsWithFilters(filters);
  };

  const loadProductsWithFilters = async (filterParams: ProductListRequest) => {
    try {
      setLoading(true);
      const response = await productService.getProductList({
        ...filterParams,
        page: pagination.page,
        page_size: pagination.page_size,
      });
      
      setProducts(response.list);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: Omit<ProductEditRequest, 'id'>) => {
    try {
      await productService.createProduct(productData);
      setIsCreateModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
      alert('创建产品失败：' + (error as Error).message);
    }
  };

  const handleUpdateProduct = async (productData: Omit<ProductEditRequest, 'id'>) => {
    if (!editingProduct) return;
    
    try {
      await productService.updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('更新产品失败：' + (error as Error).message);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('确定要删除这个产品吗？')) {
      try {
        await productService.deleteProduct(productId);
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('删除产品失败：' + (error as Error).message);
      }
    }
  };

  const ProductModal = ({ product, onClose, onSave }: {
    product?: ProductInfo | null;
    onClose: () => void;
    onSave: (data: Omit<ProductEditRequest, 'id'>) => void;
  }) => {
    const [formData, setFormData] = useState<Omit<ProductEditRequest, 'id'>>({
      name: product?.name || '',
      description: product?.description || '',
      brand: product?.brand || '',
      category: product?.category || '',
      price: product?.price || 0,
      currency: product?.currency || 'USD',
      budget: 0,
      target_audience: '',
      content_requirements: '',
      start_date: 0,
      end_date: 0,
      priority: product?.priority || 'medium',
      country: product?.country || '',
      sku_series: product?.sku_series || '',
    });

    // 表单数据验证和清理函数
    const validateAndCleanFormData = (data: Omit<ProductEditRequest, 'id'>): Omit<ProductEditRequest, 'id'> => {
      return {
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        brand: data.brand?.trim() || '',
        category: data.category?.trim() || '',
        price: isNaN(Number(data.price)) ? 0 : Number(data.price),
        currency: data.currency?.trim() || 'USD',
        budget: isNaN(Number(data.budget)) ? 0 : Number(data.budget),
        target_audience: data.target_audience?.trim() || '',
        content_requirements: data.content_requirements?.trim() || '',
        start_date: isNaN(Number(data.start_date)) ? 0 : Number(data.start_date),
        end_date: isNaN(Number(data.end_date)) ? 0 : Number(data.end_date),
        priority: data.priority?.trim() || 'medium',
        country: data.country?.trim() || '',
        sku_series: data.sku_series?.trim() || '',
      };
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 验证必填字段
      if (!formData.name?.trim()) {
        alert('请输入产品名称');
        return;
      }

      // 清理和验证数据
      const cleanedData = validateAndCleanFormData(formData);
      console.log('Form submitting with cleaned data:', cleanedData);
      
      onSave(cleanedData);
    };

    if (!isCreateModalOpen && !editingProduct) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {product ? '编辑产品' : '创建新产品'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  产品名称 *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入产品名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  品牌
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="输入品牌"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                产品描述
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入产品描述"
              />
            </div>

            {/* 分类和定价 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="输入分类"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  价格
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, price: 0 }));
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, price: numValue }));
                      }
                    }
                  }}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  货币
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预算
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.budget || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, budget: 0 }));
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, budget: numValue }));
                      }
                    }
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* 目标和要求 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目标受众
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.target_audience}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="描述目标受众..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容要求
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.content_requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_requirements: e.target.value }))}
                  placeholder="描述内容要求..."
                />
              </div>
            </div>

           

            {/* 时间和地区 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.start_date ? new Date(formData.start_date * 1000).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0;
                    setFormData(prev => ({ ...prev, start_date: timestamp }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.end_date ? new Date(formData.end_date * 1000).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0;
                    setFormData(prev => ({ ...prev, end_date: timestamp }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  国家
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="输入国家代码"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU系列
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.sku_series}
                onChange={(e) => setFormData(prev => ({ ...prev, sku_series: e.target.value }))}
                placeholder="输入SKU系列"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {product ? '更新产品' : '创建产品'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-12"> {/* 添加底部padding */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="h-8 w-8 mr-3 text-blue-600" />
                产品管理
              </h1>
              <p className="mt-2 text-gray-600">管理所有合作产品和商品信息</p>
            </div>
            
            <Link
              href="/products/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              创建产品
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总产品数</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">高优先级</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">中优先级</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.priority === 'medium').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">低优先级</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.priority === 'low').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索产品..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                搜索
              </button>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
            >
              <option value="">所有分类</option>
              <option value="electronics">电子产品</option>
              <option value="fashion">时尚</option>
              <option value="beauty">美妆</option>
              <option value="home">家居</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无产品数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Link 
                    href={`/products/${product.id}`}
                    className="font-medium text-gray-900 truncate hover:text-blue-600 cursor-pointer flex-1"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center space-x-1 ml-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="查看详情"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="编辑"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">品牌:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">价格:</span>
                    <span className="font-medium">{product.price} {product.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">分类:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">优先级:</span>
                    <span className={`font-medium ${
                      product.priority === 'high' ? 'text-red-600' :
                      product.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {product.priority === 'high' ? '高' : 
                       product.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示第 <span className="font-medium">{(pagination.page - 1) * pagination.page_size + 1}</span> 到{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.page_size, pagination.total)}
                </span>{' '}
                条，共 <span className="font-medium">{pagination.total}</span> 条记录
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  第 {pagination.page} 页，共 {Math.ceil(pagination.total / pagination.page_size)} 页
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.page_size)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Product Modal */}
        <ProductModal 
          product={editingProduct}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
        />
      </div>
    </div>
  );
} 