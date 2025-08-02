'use client';

import { useState, useEffect } from 'react';
import { Users, ClipboardList, AlertCircle, CheckCircle, Clock, Plus, Search, Filter, Edit, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fulfillmentService } from '@/services';
import type { 
  FulfillmentListItem, 
  FulfillmentListRequest,
  FulfillmentIndexResponse,
  FulfillmentUpdateRequest
} from '@/types';

export default function FulfillmentPage() {
  const [records, setRecords] = useState<FulfillmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
  });

  const [filters, setFilters] = useState<FulfillmentListRequest>({
    page: 1,
    page_size: 10,
    search: '',
    status: '',
    priority: 0,
    start_time: 0,
    end_time: 0,
    handler_user_id: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [indexData, setIndexData] = useState<FulfillmentIndexResponse>({
    cooperation_plan_list: [],
    priority_list: [],
    status_list: [],
    handler_user_list: [],
  });

  const [quickUpdateId, setQuickUpdateId] = useState<number | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FulfillmentListItem | null>(null);

  useEffect(() => {
    loadIndexData();
    loadRecords();
  }, [filters.page, filters.status]); // 移除 filters.search，避免实时搜索

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickUpdateId !== null) {
        const target = event.target as Element;
        if (!target.closest('.status-dropdown')) {
          setQuickUpdateId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [quickUpdateId]);

  const handleSearch = () => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    // 直接使用新的过滤条件进行搜索，而不是依赖状态更新
    loadRecordsWithFilters(newFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadIndexData = async () => {
    try {
      const response = await fulfillmentService.getFulfillmentIndex();
      setIndexData(response);
    } catch (error) {
      console.error('Failed to load index data:', error);
    }
  };

  const loadRecords = async () => {
    await loadRecordsWithFilters(filters);
  };

  const loadRecordsWithFilters = async (filterParams: FulfillmentListRequest) => {
    try {
      setLoading(true);
      const response = await fulfillmentService.getFulfillmentList({
        ...filterParams,
        page: pagination.page,
        page_size: pagination.page_size,
      });
      
      setRecords(response.list);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Failed to load fulfillment records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (recordId: number, newStatus: string) => {
    try {
      const statusName = indexData?.status_list?.find(s => s.id === newStatus)?.name || newStatus;
      const updateData: FulfillmentUpdateRequest = {
        id: recordId,
        remark: '',
        status: newStatus,
        status_remark: `快速更新到${statusName}`,
        tags: '',
        shipping_no: '',
        received_at: 0,
        video_url: '',
        video_id: '',
        ad_code: '',
        ads_roi: 0
      };

      await fulfillmentService.updateFulfillment(updateData);
      loadRecords(); // 重新加载列表
      setQuickUpdateId(null);
    } catch (error) {
      console.error('Failed to update fulfillment status:', error);
      alert('更新状态失败：' + (error as Error).message);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    // 根据用户提供的状态流程：待寄样 -> 已寄样 -> 已签收 -> 内容制作 -> 已发布 -> 销售转化 -> 已完成
    const statusFlow = [
      'pending',         // 待寄样
      'sent',           // 已寄样
      'received',       // 已签收
      'content_created', // 内容制作
      'published',      // 已发布
      'sales_conversion', // 销售转化
      'completed'       // 已完成
    ];
    
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getStatusDisplayName = (status: string): string => {
    const statusNameMap: Record<string, string> = {
      'pending': '待寄样',
      'sent': '已寄样',
      'received': '已签收',
      'content_created': '内容制作',
      'published': '已发布',
      'sales_conversion': '销售转化',
      'completed': '已完成',
      'canceled': '取消',
      'timeout': '超时'
    };
    return statusNameMap[status] || status;
  };

  const getNextStatusName = (currentStatus: string): string | null => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      return getStatusDisplayName(nextStatus);
    }
    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case '已完成':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'content_created':
      case 'published':
      case 'sales_conversion':
      case '内容制作':
      case '已发布':
      case '销售转化':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'canceled':
      case '取消':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'timeout':
      case '超时':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const QuickStatusDropdown = ({ record }: { record: FulfillmentListItem }) => {
    if (quickUpdateId !== record.id) return null;

    // 添加空值检查，防止 status_list 为 undefined
    const statusList = indexData?.status_list || [];
    
    return (
      <div className="status-dropdown absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg min-w-40">
        <div className="py-1">
          {statusList
            .filter(status => status.id !== record.status)
            .map(status => (
              <button
                key={status.id}
                onClick={() => handleQuickStatusUpdate(record.id, status.id)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {status.name}
              </button>
            ))}
        </div>
      </div>
    );
  };

  // 状态推进模态框组件
  const StatusUpdateModal = () => {
    const [formData, setFormData] = useState<FulfillmentUpdateRequest>({
      id: selectedRecord?.id || 0,
      remark: selectedRecord?.remark || '',
      status: selectedRecord?.status || '',
      status_remark: '',
      tags: '',
      shipping_no: '',
      received_at: 0,
      video_url: '',
      video_id: '',
      ad_code: '',
      ads_roi: 0
    });

    // 定义正确的8种状态，按推进顺序
    const [statusFlow] = useState([
      { id: 'pending', name: '待寄样', desc: '等待寄出样品给达人' },
      { id: 'sent', name: '已寄样', desc: '样品已寄出，等待达人签收' },
      { id: 'received', name: '已签收', desc: '达人已签收样品' },
      { id: 'content_created', name: '内容制作', desc: '达人正在制作内容' },
      { id: 'published', name: '已发布', desc: '内容已发布到平台' },
      { id: 'sales_conversion', name: '销售转化', desc: '正在跟踪销售数据' },
      { id: 'completed', name: '已完成', desc: '履约任务已全部完成' },
      { id: 'canceled', name: '取消', desc: '履约任务已取消' }
    ]);

    // 获取当前状态可以推进到的状态列表
    const getAvailableStatuses = (currentStatus: string) => {
      const currentIndex = statusFlow.findIndex(s => s.id === currentStatus);
      const availableStatuses = [];
      
      // 如果不是最后一个状态（已完成）且不是取消状态，可以推进到下一个状态
      if (currentIndex >= 0 && currentIndex < statusFlow.length - 2 && currentStatus !== 'canceled') {
        availableStatuses.push(statusFlow[currentIndex + 1]);
      }
      
      // 所有状态都可以推进到取消（除了已经是取消状态）
      if (currentStatus !== 'canceled') {
        availableStatuses.push(statusFlow.find(s => s.id === 'canceled')!);
      }
      
      return availableStatuses;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedRecord) return;

      try {
        await fulfillmentService.updateFulfillment(formData);
        alert('状态更新成功！');
        setIsStatusModalOpen(false);
        setSelectedRecord(null);
        loadRecords(); // 重新加载列表
      } catch (error) {
        console.error('Failed to update fulfillment status:', error);
        alert('更新失败：' + (error as Error).message);
      }
    };

    if (!isStatusModalOpen || !selectedRecord) return null;

    const availableStatuses = getAvailableStatuses(selectedRecord.status);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">推进履约状态</h2>
            <button
              onClick={() => {
                setIsStatusModalOpen(false);
                setSelectedRecord(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 当前信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">当前状态</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">合作信息：</span>
                  <span className="font-medium">{selectedRecord.influencer_name} × {selectedRecord.product_name || '产品'}</span>
                </div>
                <div>
                  <span className="text-gray-500">当前状态：</span>
                  <span className="font-medium text-blue-600">{getStatusDisplayName(selectedRecord.status)}</span>
                </div>
                <div>
                  <span className="text-gray-500">优先级：</span>
                  <span className="font-medium">{selectedRecord.priority_text}</span>
                </div>
                <div>
                  <span className="text-gray-500">创建时间：</span>
                  <span className="font-medium">
                    {selectedRecord.created_at 
                      ? new Date(selectedRecord.created_at * 1000).toLocaleDateString('zh-CN')
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* 选择新状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择目标状态
              </label>
              {availableStatuses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>当前状态无法继续推进</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableStatuses.map(status => (
                    <div key={status.id} className="relative">
                      <label className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        status.id === 'canceled' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="radio"
                          name="status"
                          value={status.id}
                          checked={formData.status === status.id}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="mt-1 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${status.id === 'canceled' ? 'text-red-700' : 'text-gray-900'}`}>
                            {status.name}
                          </div>
                          <div className={`text-sm ${status.id === 'canceled' ? 'text-red-600' : 'text-gray-500'}`}>
                            {status.desc}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 状态备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态备注 <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入状态更新备注（必填）..."
                value={formData.status_remark}
                onChange={(e) => setFormData(prev => ({ ...prev, status_remark: e.target.value }))}
                required
              />
            </div>

            {/* 根据状态显示不同的字段 */}
            {(formData.status === 'sent' || formData.status === 'received') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    快递单号
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入快递单号..."
                    value={formData.shipping_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_no: e.target.value }))}
                  />
                </div>
                
                {formData.status === 'received' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                )}
              </div>
            )}

            {(formData.status === 'published' || formData.status === 'sales_conversion') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频链接
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入视频链接..."
                    value={formData.video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入视频ID..."
                    value={formData.video_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_id: e.target.value }))}
                  />
                </div>

                {formData.status === 'sales_conversion' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        广告代码
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="输入广告代码..."
                        value={formData.ad_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, ad_code: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        广告ROI
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
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
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入标签，用逗号分隔..."
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            {/* 履约备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                履约单备注
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入履约单备注信息..."
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              />
              <p className="mt-1 text-sm text-gray-500">
                这是履约单的备注信息，将在履约单列表中显示
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!formData.status || !formData.status_remark}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认推进
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
                <ClipboardList className="h-8 w-8 mr-3 text-purple-600" />
                履约管理
              </h1>
              <p className="mt-2 text-gray-600">管理所有达人履约记录和合作状态</p>
            </div>
            
            <div className="flex space-x-4">
              <Link
                href="/fulfillment/dashboard"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                履约仪表板
              </Link>
              
              <Link
                href="/fulfillment/create"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                创建履约单
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总履约单</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">已完成</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.status_text === '已完成').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">进行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => r.status_text === '进行中').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">超时预警</p>
                <p className="text-2xl font-bold text-gray-900">
                  {records.filter(r => ['预警', '超时'].includes(r.status_text)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="col-span-2">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索履约单、达人、产品..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  搜索
                </button>
              </div>
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">全部状态</option>
              {(indexData?.status_list || []).map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: Number(e.target.value) }))}
            >
              <option value={0}>全部优先级</option>
              {(indexData?.priority_list || []).map(priority => (
                <option key={priority.id} value={priority.id}>{priority.name}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.handler_user_id}
              onChange={(e) => setFilters(prev => ({ ...prev, handler_user_id: Number(e.target.value) }))}
            >
              <option value={0}>全部员工</option>
              {(indexData?.handler_user_list || []).map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            
            <button
              onClick={loadRecords}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              刷新
            </button>
          </div>

          {/* 时间筛选 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.start_time ? new Date(filters.start_time * 1000).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0;
                  setFilters(prev => ({ ...prev, start_time: timestamp }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束时间
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.end_time ? new Date(filters.end_time * 1000).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const timestamp = e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : 0;
                  setFilters(prev => ({ ...prev, end_time: timestamp }));
                }}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    start_time: 0,
                    end_time: 0,
                    status: '',
                    priority: 0,
                    handler_user_id: 0,
                    search: ''
                  }));
                  setSearchTerm(''); // 重置搜索框
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                重置筛选
              </button>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">履约记录</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无履约记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      履约单信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      优先级
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      进度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      负责人
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      备注
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-2">
                          {/* 合作信息 */}
                          <div className="font-medium text-base">
                            {record.influencer_name || '未知达人'} × {record.product_name || '未知产品'} 合作
                          </div>
                          {/* 合作描述 */}
                          <div className="text-sm text-gray-600">
                            {record.cooperation_plan || '达人自制短视频寄样品'}
                          </div>
                          {/* 时间信息 */}
                          <div className="text-xs text-gray-500">
                            环节开始时间 {record.created_at 
                              ? new Date(record.created_at * 1000).toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'
                            } · 整体截止时间 {record.end_time 
                              ? new Date(record.end_time * 1000).toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {getStatusIcon(record.status_text)}
                          <span className="ml-2">{record.status_text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.priority === 1 ? 'bg-red-100 text-red-800' :
                          record.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {record.priority_text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(record as any).progress || 10}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{(record as any).progress || 10}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(record as any).handler_user_name || '未分配'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.created_at 
                          ? new Date(record.created_at * 1000).toLocaleDateString('zh-CN')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={record.remark}>
                          {record.remark || '无'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/fulfillment/${record.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看详情
                          </Link>
                          
                          {/* 状态推进按钮 */}
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsStatusModalOpen(true);
                            }}
                            className="inline-flex items-center text-green-600 hover:text-green-900"
                            title="推进状态"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            推进
                          </button>
                          
                          {/* 快速状态更新按钮 */}
                          {getNextStatus(record.status) && (
                            <button
                              onClick={() => handleQuickStatusUpdate(record.id, getNextStatus(record.status)!)}
                              className="inline-flex items-center text-orange-600 hover:text-orange-900"
                              title={`快速推进到${getNextStatusName(record.status)}`}
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              快进
                            </button>
                          )}
                          
                          {/* 状态选择下拉 */}
                          <div className="relative status-dropdown">
                            <button
                              onClick={() => setQuickUpdateId(quickUpdateId === record.id ? null : record.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="选择状态"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <QuickStatusDropdown record={record} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {records.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page >= Math.ceil(pagination.total / pagination.page_size)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      显示第 <span className="font-medium">{(filters.page - 1) * pagination.page_size + 1}</span> 到{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * pagination.page_size, pagination.total)}
                      </span>{' '}
                      条，共 <span className="font-medium">{pagination.total}</span> 条记录
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={filters.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        上一页
                      </button>
                      
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        第 {filters.page} 页，共 {Math.ceil(pagination.total / pagination.page_size)} 页
                      </span>
                      
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={filters.page >= Math.ceil(pagination.total / pagination.page_size)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        下一页
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <StatusUpdateModal />
    </div>
  );
}