'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Users, Package, Settings, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fulfillmentService, influencerService, productService } from '@/services';
import type { 
  Influencer, 
  Product, 
  CooperationPlan,
  InfluencerListItem,
  ProductInfo
} from '@/types';

interface CreateFulfillmentFormData {
  influencer: Influencer | null;
  product: Product | null;
  plan: CooperationPlan | null;
  priority: number;
  remark: string;
  createCount: number;
}

const steps = [
  { id: 1, name: '选择达人', icon: Users },
  { id: 2, name: '选择产品', icon: Package },
  { id: 3, name: '选择方案', icon: Settings },
  { id: 4, name: '其它设置', icon: CheckCircle },
];

export default function CreateFulfillmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFulfillmentFormData>({
    influencer: null,
    product: null,
    plan: null,
    priority: 2, // 默认中等优先级
    remark: '',
    createCount: 1,
  });

  // 搜索相关状态 - 修复类型
  const [influencerSearch, setInfluencerSearch] = useState('');
  const [influencerResults, setInfluencerResults] = useState<InfluencerListItem[]>([]);
  const [productList, setProductList] = useState<ProductInfo[]>([]);
  const [planList, setPlanList] = useState<CooperationPlan[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 加载产品列表
  useEffect(() => {
    if (currentStep === 2) {
      loadProducts();
    }
  }, [currentStep]);

  // 加载方案列表
  useEffect(() => {
    if (currentStep === 3) {
      loadPlans();
    }
  }, [currentStep]);

  // 搜索达人 - 使用useCallback优化
  const searchInfluencers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setInfluencerResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await influencerService.getInfluencerList({
        page: 1,
        page_size: 10,
        search: searchTerm,
        platform_id: 0,
        is_deleted: 0,
        source: 0,
        register_start_at: 0,
        register_end_at: 0,
        tag: '',
      });
      setInfluencerResults(response.list || []);
    } catch (error) {
      console.error('搜索达人失败:', error);
      setInfluencerResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleInfluencerSearch = useCallback(() => {
    searchInfluencers(influencerSearch);
  }, [influencerSearch, searchInfluencers]);

  // 加载产品列表
  const loadProducts = async () => {
    try {
      const response = await productService.getProductList({ 
        page: 1, 
        page_size: 100,
        search: '',
        category: '',
      });
      setProductList(response.list || []);
    } catch (error) {
      console.error('加载产品列表失败:', error);
      setProductList([]);
    }
  };

  // 加载方案列表
  const loadPlans = async () => {
    try {
      const response = await fulfillmentService.getFulfillmentIndex();
      setPlanList(response.cooperation_plan_list || []);
    } catch (error) {
      console.error('加载方案列表失败:', error);
      setPlanList([]);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.influencer || !formData.product || !formData.plan) {
      alert('请完成所有必填项');
      return;
    }

    setLoading(true);
    try {
      const promises = [];
      
      // 根据创建个数批量创建履约单
      for (let i = 1; i <= formData.createCount; i++) {
        const promise = fulfillmentService.saveFulfillment({
          influencer_id: parseInt(formData.influencer.id.toString()),
          cooperation_plan_id: parseInt(formData.plan.id.toString()),
          priority: formData.priority,
          remark: formData.remark + (formData.createCount > 1 ? ` (${i}/${formData.createCount})` : ''),
          product_id: parseInt(formData.product.id.toString()),
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      
      // 创建成功后跳转到履约列表
      router.push('/fulfillment');
    } catch (error) {
      console.error('创建履约单失败:', error);
      alert('创建履约单失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.influencer !== null;
      case 2:
        return formData.product !== null;
      case 3:
        return formData.plan !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // 使用 useMemo 稳定组件，防止重新创建导致焦点丢失
  const StepIndicator = useMemo(() => (
    <div className="mb-8">
      <nav className="flex items-center justify-center">
        <ol className="flex items-center space-x-6">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <li key={step.id} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-6" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  ), [currentStep]);

  const SelectInfluencer = useMemo(() => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">选择达人</h3>
      
      {/* 已选择的达人 */}
      {formData.influencer && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{formData.influencer.name}</h4>
                <p className="text-sm text-gray-500">
                  粉丝: {(formData.influencer as any).followers_count?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      )}
      
      {/* 搜索框 */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="输入达人名字进行搜索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={influencerSearch}
              onChange={(e) => setInfluencerSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInfluencerSearch()}
            />
          </div>
          <button
            onClick={handleInfluencerSearch}
            disabled={searchLoading || !influencerSearch.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>
      
      {/* 搜索结果 */}
      {searchLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">搜索中...</p>
        </div>
      ) : influencerResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {influencerResults.map((influencer) => (
            <div
              key={influencer.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                formData.influencer?.id === influencer.id.toString()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                influencer: {
                  id: influencer.id.toString(),
                  creatorId: influencer.id.toString(),
                  name: influencer.display_name,
                  platform: 'tiktok', // 默认平台
                } as Influencer
              }))}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{influencer.display_name}</h4>
                  <p className="text-sm text-gray-500">
                    ID: {influencer.id}
                  </p>
                  <p className="text-xs text-gray-400">来源: {influencer.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : influencerSearch ? (
        <div className="text-center py-8 text-gray-500">
          未找到匹配的达人
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          请输入达人名字进行搜索
        </div>
      )}
    </div>
  ), [formData.influencer, influencerSearch, influencerResults, searchLoading, handleInfluencerSearch]);

  const SelectProduct = useMemo(() => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">选择产品</h3>
      
      {/* 已选择的产品 */}
      {formData.product && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{formData.product.name}</h4>
                <p className="text-sm text-gray-500">
                  价格: ¥{formData.product.price || 0}
                </p>
              </div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      )}
      
      {/* 产品列表 */}
      {productList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productList.map((product) => (
            <div
              key={product.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                formData.product?.id === product.id.toString()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                product: {
                  id: product.id.toString(),
                  name: product.name,
                  description: product.description,
                  category: product.category,
                  price: product.price,
                  is_deleted: 0
                } as Product
              }))}
            >
              <div className="flex items-start">
                <Package className="h-8 w-8 text-gray-400 mt-1" />
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{product.description || '暂无描述'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">价格</span>
                    <span className="text-sm font-medium text-green-600">¥{product.price || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          暂无可用产品
        </div>
      )}
    </div>
  ), [formData.product, productList]);

  const SelectPlan = useMemo(() => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">选择合作方案</h3>
      
      {/* 已选择的方案 */}
      {formData.plan && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{(formData.plan as any).name || '未知方案'}</h4>
                <p className="text-sm text-gray-500">
                  {formData.plan.description || '无描述'}
                </p>
              </div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      )}
      
      {/* 方案列表 */}
      {planList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planList.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                formData.plan?.id === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, plan }))}
            >
              <div className="flex items-start">
                <Settings className="h-8 w-8 text-gray-400 mt-1" />
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{plan.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{plan.description || '无描述'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          暂无可用合作方案
        </div>
      )}
    </div>
  ), [formData.plan, planList]);

  const OtherSettings = useMemo(() => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">其它设置</h3>
      
      <div className="space-y-6">
        {/* 优先级设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            履约单优先级（默认中等）
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 1, label: '高优先级', color: 'red', desc: '紧急处理' },
              { value: 2, label: '中优先级', color: 'yellow', desc: '正常处理' },
              { value: 3, label: '低优先级', color: 'green', desc: '可延后处理' },
            ].map((priority) => (
              <div
                key={priority.value}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                  formData.priority === priority.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    readOnly
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{priority.label}</div>
                    <div className="text-sm text-gray-500">{priority.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 备注设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注（选填）
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入履约单备注信息..."
            value={formData.remark}
            onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
          />
        </div>

        {/* 创建个数设置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            创建履约单个数（1-20个）
          </label>
          <input
            type="number"
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.createCount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setFormData(prev => ({ ...prev, createCount: 1 }));
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setFormData(prev => ({ ...prev, createCount: numValue }));
                }
              }
            }}
            onBlur={(e) => {
              const count = Math.max(1, Math.min(20, formData.createCount));
              setFormData(prev => ({ ...prev, createCount: count }));
            }}
          />
          <p className="mt-1 text-sm text-gray-500">
            将根据当前选择的达人、产品和方案创建 {formData.createCount} 个履约单
          </p>
        </div>
      </div>
    </div>
  ), [formData.priority, formData.remark, formData.createCount]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return SelectInfluencer;
      case 2:
        return SelectProduct;
      case 3:
        return SelectPlan;
      case 4:
        return OtherSettings;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-12"> {/* 添加底部padding */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/fulfillment"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回履约列表
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">创建履约单</h1>
          <p className="text-gray-600">通过向导快速创建新的履约合作记录</p>
        </div>

        {/* Step Indicator */}
        {StepIndicator}

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* 底部按钮 */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0 z-10 shadow-lg">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              上一步
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                disabled={!canGoNext()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                下一步
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    创建履约单
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}