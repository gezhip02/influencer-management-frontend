'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Package, Clock, AlertTriangle, CheckCircle, Edit, Tag } from 'lucide-react';
import Link from 'next/link';
import { fulfillmentService } from '@/services';
import type { FulfillmentRecord } from '@/types';

export default function FulfillmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;
  
  const [record, setRecord] = useState<FulfillmentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);

  useEffect(() => {
    if (recordId) {
      loadRecord();
      loadStatusLogs();
    }
  }, [recordId]);

  const loadRecord = async () => {
    try {
      const data = await fulfillmentService.getFulfillmentRecordById(recordId);
      setRecord(data);
    } catch (error) {
      console.error('Failed to load fulfillment record:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatusLogs = async () => {
    try {
      const logs = await fulfillmentService.getStatusLogs(recordId);
      setStatusLogs(logs);
    } catch (error) {
      console.error('Failed to load status logs:', error);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await fulfillmentService.updateFulfillmentStatus(recordId, newStatus);
      loadRecord();
      loadStatusLogs();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'timeout':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: '已完成',
      in_progress: '进行中',
      warning: '预警',
      timeout: '超时',
      pending: '待处理',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'timeout':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">履约单不存在</p>
          <Link href="/fulfillment" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
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
              <p className="text-gray-600">#{record.id}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                {getStatusIcon(record.status)}
                <span className="ml-2">{getStatusText(record.status)}</span>
              </span>
              
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">达人信息</h3>
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{record.influencer?.name}</p>
                      <p className="text-sm text-gray-500">{record.influencer?.platform}</p>
                      <p className="text-xs text-gray-400">
                        {record.influencer?.followersCount?.toLocaleString()} 粉丝
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">合作方案</h3>
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{record.plan?.name}</p>
                      <p className="text-sm text-gray-500">{record.plan?.description}</p>
                      <p className="text-xs text-gray-400">
                        预算: {record.plan?.budget?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">优先级</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  record.priority === 1 ? 'bg-red-100 text-red-800' :
                  record.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {record.priority === 1 ? '高优先级' : record.priority === 2 ? '中优先级' : '低优先级'}
                </span>
              </div>
            </div>

            {/* Content Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">内容要求</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">内容描述</h3>
                  <p className="text-gray-900">{record.requirements?.content}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">视频时长</h3>
                    <p className="text-gray-900">{record.requirements?.duration} 秒</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">视频格式</h3>
                    <p className="text-gray-900">{record.requirements?.format}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">执行进度</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'sampleSubmitted', label: '样片提交', completed: record.progress?.sampleSubmitted },
                  { key: 'sampleApproved', label: '样片审核', completed: record.progress?.sampleApproved },
                  { key: 'contentSubmitted', label: '正片提交', completed: record.progress?.contentSubmitted },
                  { key: 'contentApproved', label: '正片审核', completed: record.progress?.contentApproved },
                ].map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {step.completed && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${step.completed ? 'text-green-900' : 'text-gray-700'}`}>
                        {step.label}
                      </p>
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">标签</h2>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-500">
                  <Tag className="h-4 w-4 mr-1" />
                  管理标签
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {record.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                      color: tag.color || '#374151'
                    }}
                  >
                    {tag.name}
                  </span>
                )) || (
                  <p className="text-sm text-gray-500">暂无标签</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">状态操作</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => updateStatus('in_progress')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  标记为进行中
                </button>
                
                <button
                  onClick={() => updateStatus('completed')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  标记为已完成
                </button>
                
                <button
                  onClick={() => updateStatus('warning')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  标记为预警
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">时间信息</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="font-medium">
                    {record.timestamps?.createdAt 
                      ? new Date(record.timestamps.createdAt).toLocaleString('zh-CN')
                      : '-'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">最后更新</p>
                  <p className="font-medium">
                    {record.timestamps?.updatedAt 
                      ? new Date(record.timestamps.updatedAt).toLocaleString('zh-CN')
                      : '-'
                    }
                  </p>
                </div>
                
                {record.timestamps?.deadlineTime && (
                  <div>
                    <p className="text-sm text-gray-500">截止时间</p>
                    <p className="font-medium text-red-600">
                      {new Date(record.timestamps.deadlineTime).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">活动日志</h3>
              
              <div className="space-y-3">
                {statusLogs.length > 0 ? (
                  statusLogs.map((log, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <div>
                        <p className="text-sm text-gray-900">履约单创建</p>
                        <p className="text-xs text-gray-500">
                          {record.timestamps?.createdAt 
                            ? new Date(record.timestamps.createdAt).toLocaleString('zh-CN')
                            : '未知时间'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {record.progress?.sampleSubmitted && (
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <p className="text-sm text-gray-900">样片已提交</p>
                          <p className="text-xs text-gray-500">
                            {record.timestamps?.sampleReceivedTime 
                              ? new Date(record.timestamps.sampleReceivedTime).toLocaleString('zh-CN')
                              : '时间未记录'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}