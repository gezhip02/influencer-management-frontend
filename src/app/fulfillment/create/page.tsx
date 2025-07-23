'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Users, Package, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fulfillmentService } from '@/services';

interface CreateFulfillmentFormData {
  influencerIds: string[];
  planId: string;
  productId: string;
  priority: number;
  requirements: {
    content: string;
    duration: number;
    format: string;
  };
  notes?: string;
}

const steps = [
  { id: 1, name: '选择达人', icon: Users },
  { id: 2, name: '选择产品', icon: Package },
  { id: 3, name: '合作方案', icon: Settings },
  { id: 4, name: '确认创建', icon: CheckCircle },
];

export default function CreateFulfillmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFulfillmentFormData>({
    influencerIds: [],
    planId: '',
    productId: '',
    priority: 2,
    requirements: {
      content: '',
      duration: 60,
      format: '竖屏视频',
    },
    notes: '',
  });

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
    try {
      setLoading(true);
      
      // 为每个选中的达人创建履约单
      const promises = formData.influencerIds.map(influencerId =>
        fulfillmentService.createFulfillmentRecord({
          influencerId,
          planId: formData.planId,
          priority: formData.priority,
          requirements: formData.requirements,
        })
      );

      await Promise.all(promises);
      
      // 创建成功后跳转到履约列表
      router.push('/fulfillment');
    } catch (error) {
      console.error('Failed to create fulfillment records:', error);
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.influencerIds.length > 0;
      case 2:
        return formData.productId !== '';
      case 3:
        return formData.requirements.content !== '';
      default:
        return true;
    }
  };

  const StepIndicator = () => (
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
  );

  const SelectInfluencers = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">选择合作达人</h3>
      
      {/* Mock influencer selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: '1', name: '美妆达人小雅CC2', platform: 'TikTok', followers: '85万', category: '美妆护肤' },
          { id: '2', name: '科技评测师张三', platform: '抖音', followers: '65万', category: '科技数码' },
          { id: '3', name: '健身达人Lisa', platform: 'TikTok', followers: '42万', category: '健身运动' },
          { id: '4', name: '美食博主小王', platform: '抖音', followers: '38万', category: '美食探店' },
        ].map((influencer) => (
          <div
            key={influencer.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              formData.influencerIds.includes(influencer.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              const isSelected = formData.influencerIds.includes(influencer.id);
              setFormData(prev => ({
                ...prev,
                influencerIds: isSelected
                  ? prev.influencerIds.filter(id => id !== influencer.id)
                  : [...prev.influencerIds, influencer.id]
              }));
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{influencer.name}</h4>
                <p className="text-sm text-gray-500">{influencer.platform} · {influencer.followers}粉丝</p>
                <p className="text-xs text-gray-400">{influencer.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          已选择 <span className="font-medium">{formData.influencerIds.length}</span> 位达人
          {formData.influencerIds.length > 0 && ' · 将为每位达人创建独立的履约单'}
        </p>
      </div>
    </div>
  );

  const SelectProduct = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">选择合作产品</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'plan_001', name: '兰蔻新品推广计划', budget: '5万', description: 'Q1兰蔻新品口红系列推广' },
          { id: 'plan_002', name: '小米手机评测计划', budget: '8万', description: '小米14系列手机评测推广' },
          { id: 'plan_003', name: '健身装备推广', budget: '3万', description: '春季健身装备推广活动' },
        ].map((plan) => (
          <div
            key={plan.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              formData.planId === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, planId: plan.id, productId: plan.id }))}
          >
            <div className="flex items-start">
              <Package className="h-8 w-8 text-gray-400 mt-1" />
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{plan.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">预算</span>
                  <span className="text-sm font-medium text-green-600">{plan.budget}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SetupRequirements = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">设置合作要求</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容要求 *
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="请详细描述内容创作要求..."
            value={formData.requirements.content}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              requirements: { ...prev.requirements, content: e.target.value }
            }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频时长（秒）
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.requirements.duration}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                requirements: { ...prev.requirements, duration: parseInt(e.target.value) }
              }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频格式
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.requirements.format}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                requirements: { ...prev.requirements, format: e.target.value }
              }))}
            >
              <option value="竖屏视频">竖屏视频</option>
              <option value="横屏视频">横屏视频</option>
              <option value="方形视频">方形视频</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            优先级
          </label>
          <div className="flex space-x-4">
            {[
              { value: 1, label: '高优先级', color: 'red' },
              { value: 2, label: '中优先级', color: 'yellow' },
              { value: 3, label: '低优先级', color: 'green' },
            ].map((priority) => (
              <label key={priority.value} className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priority: parseInt(e.target.value)
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{priority.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注信息
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="其他备注信息（可选）"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const ConfirmCreate = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">确认创建履约单</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">选中的达人</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              将为 <span className="font-medium text-blue-600">{formData.influencerIds.length}</span> 位达人创建履约单
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">合作方案</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">方案ID: {formData.planId}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">内容要求</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">{formData.requirements.content}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>时长: {formData.requirements.duration}秒</span>
              <span>格式: {formData.requirements.format}</span>
              <span>优先级: {formData.priority === 1 ? '高' : formData.priority === 2 ? '中' : '低'}</span>
            </div>
          </div>
        </div>

        {formData.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">备注</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">{formData.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <SelectInfluencers />;
      case 2:
        return <SelectProduct />;
      case 3:
        return <SetupRequirements />;
      case 4:
        return <ConfirmCreate />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
        <StepIndicator />

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}