'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Edit, Trash2, Calendar, DollarSign, Tag, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { productService } from '@/services';
import type { ProductInfo } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // 注意：这里假设后端有获取单个产品的接口，如果没有需要从列表接口中获取
      // const response = await productService.getProduct(Number(productId));
      // setProduct(response);
      
      // 临时从列表中获取
      const response = await productService.getProductList({
        page: 1,
        page_size: 100,
        search: '',
        category: '',
      });
      
      const foundProduct = response.list.find(p => p.id === Number(productId));
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        throw new Error('产品未找到');
      }
    } catch (error) {
      console.error('加载产品详情失败:', error);
      alert('加载产品详情失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (!confirm('确定要删除这个产品吗？此操作不可撤销。')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await productService.deleteProduct(product.id);
      alert('产品删除成功');
      router.push('/products');
    } catch (error) {
      console.error('删除产品失败:', error);
      alert('删除产品失败：' + (error as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">产品未找到</h2>
          <p className="text-gray-600 mb-4">请检查产品ID是否正确</p>
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回产品列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/products"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回产品列表
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/products/${productId}/edit`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑产品
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              删除产品
            </button>
          </div>
        </div>

        {/* 产品信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 产品头部 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-6">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description || '暂无描述'}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {product.brand && (
                    <div className="flex items-center text-gray-600">
                      <Tag className="h-4 w-4 mr-1" />
                      品牌：{product.brand}
                    </div>
                  )}
                  {product.category && (
                    <div className="flex items-center text-gray-600">
                      <Tag className="h-4 w-4 mr-1" />
                      类别：{product.category}
                    </div>
                  )}
                  {product.country && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      地区：{product.country}
                    </div>
                  )}
                </div>
              </div>
              
              {product.price > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ¥{product.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{product.currency || 'CNY'}</div>
                </div>
              )}
            </div>
          </div>

          {/* 详细信息 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">产品ID</label>
                    <p className="text-sm text-gray-900">{product.id}</p>
                  </div>
                  {product.sku_series && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SKU系列</label>
                      <p className="text-sm text-gray-900">{product.sku_series}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">优先级</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.priority === 'high' ? 'bg-red-100 text-red-800' :
                      product.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.priority === 'high' ? '高' : 
                       product.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 营销信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">营销信息</h3>
                <div className="space-y-3">
                  {/* 预算信息暂时移除，因为ProductInfo接口中没有budget字段 */}
                  <div>
                    <p className="text-sm text-gray-500">营销信息需要后端接口支持</p>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">时间信息</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">时间信息需要后端接口支持</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 内容要求 - 暂时移除，字段不存在于ProductInfo接口 */}
          </div>
        </div>
      </div>
    </div>
  );
} 