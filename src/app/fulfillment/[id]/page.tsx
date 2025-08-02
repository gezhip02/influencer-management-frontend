'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Package, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Truck,
  Video,
  BarChart3,
  Edit
} from 'lucide-react';
import { fulfillmentService } from '@/services';
import type { 
  FulfillmentListItem, 
  FulfillmentUpdateRequest,
  FulfillmentIndexResponse
} from '@/types';
import Link from 'next/link';

export default function FulfillmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fulfillmentId = Number(params.id);

  const [record, setRecord] = useState<FulfillmentListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [indexData, setIndexData] = useState<FulfillmentIndexResponse>({
    cooperation_plan_list: [],
    priority_list: [],
    status_list: [],
    handler_user_list: [],
  });

  useEffect(() => {
    loadIndexData();
    loadRecord();
  }, [fulfillmentId]);

  const loadIndexData = async () => {
    try {
      const response = await fulfillmentService.getFulfillmentIndex();
      setIndexData(response);
    } catch (error) {
      console.error('Failed to load index data:', error);
    }
  };

  const loadRecord = async () => {
    try {
      setLoading(true);
      const response = await fulfillmentService.getFulfillmentList({
        page: 1,
        page_size: 1,
        search: '',
        status: '',
        priority: 0,
        start_time: 0,
        end_time: 0,
        handler_user_id: 0,
        id: fulfillmentId
      });
      
      if (response.list && response.list.length > 0) {
        setRecord(response.list[0]);
      }
    } catch (error) {
      console.error('Failed to load fulfillment record:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'sent':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'received':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'content_created':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'published':
        return <BarChart3 className="h-5 w-5 text-indigo-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'canceled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'content_created':
        return 'bg-purple-100 text-purple-800';
      case 'published':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'timeout':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (updateData: FulfillmentUpdateRequest) => {
    try {
      await fulfillmentService.updateFulfillment(updateData);
      setIsEditModalOpen(false);
      loadRecord(); // 重新加载数据
    } catch (error) {
      console.error('Failed to update fulfillment:', error);
      alert('更新履约单失败：' + (error as Error).message);
    }
  };

  const StatusUpdateModal = ({ onClose, onSave }: {
    onClose: () => void;
    onSave: (data: FulfillmentUpdateRequest) => void;
  }) => {
    const [formData, setFormData] = useState<FulfillmentUpdateRequest>({
      id: fulfillmentId,
      remark: record?.remark || '',
      status: record?.status || '',
      status_remark: '',
      tags: '',
      shipping_no: '',
      received_at: 0,
      video_url: '',
      video_id: '',
      ad_code: '',
      ads_roi: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    if (!isEditModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            更新履约单状态
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态 *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                {indexData.status_list.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
                placeholder="输入备注信息..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态备注
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.status_remark}
                onChange={(e) => setFormData(prev => ({ ...prev, status_remark: e.target.value }))}
                placeholder="状态相关备注..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="逗号分隔的标签..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  物流单号
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.shipping_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_no: e.target.value }))}
                  placeholder="物流单号..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  视频链接
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="视频链接..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  视频ID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.video_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_id: e.target.value }))}
                  placeholder="视频ID..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  投流码
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.ad_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, ad_code: e.target.value }))}
                  placeholder="投流码..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  广告ROI
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.ads_roi || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, ads_roi: 0 }));
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, ads_roi: numValue }));
                      }
                    }
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                签收时间
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.received_at ? new Date(formData.received_at * 1000).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0;
                  setFormData(prev => ({ ...prev, received_at: timestamp }));
                }}
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
                更新状态
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">履约单不存在</h2>
            <p className="text-gray-600 mb-4">找不到指定的履约单记录</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-12"> {/* 添加底部padding */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/fulfillment"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回履约列表
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">履约单详情</h1>
              {record && (
                <p className="text-gray-600">履约单号: #{record.id}</p>
              )}
            </div>
            
            {record && (
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  record.priority === 1 ? 'bg-red-100 text-red-800' :
                  record.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {record.priority_text}
                </span>
                
                <div className="flex items-center">
                  {getStatusIcon(record.status_text)}
                  <span className="ml-2 text-sm font-medium">{record.status_text}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(record.status)}
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">当前状态</h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status_text}
                  </span>
                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.priority === 1 ? 'bg-red-100 text-red-800' :
                    record.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {record.priority_text}优先级
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">截止时间</p>
              <p className="text-sm font-medium text-gray-900">
                {record.end_time 
                  ? new Date(record.end_time * 1000).toLocaleDateString('zh-CN')
                  : '未设置'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 达人信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">达人信息</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">达人姓名</label>
                <p className="text-sm font-medium text-gray-900">{record.influencer_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">达人ID</label>
                <p className="text-sm font-medium text-gray-900">#{record.influencer_id}</p>
              </div>
            </div>
          </div>

          {/* 产品信息 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-green-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">产品信息</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">产品名称</label>
                <p className="text-sm font-medium text-gray-900">{record.product_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 合作方案和备注 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">合作详情</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">合作方案</label>
              <p className="text-sm font-medium text-gray-900 mt-1">{record.cooperation_plan}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">备注信息</label>
              <p className="text-sm text-gray-900 mt-1">{record.remark || '暂无备注'}</p>
            </div>
          </div>
        </div>

        {/* Status Update Modal */}
        <StatusUpdateModal 
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleStatusUpdate}
        />
      </div>
    </div>
  );
}