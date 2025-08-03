'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Tag, Edit, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { influencerService } from '@/services';
import type { 
  InfluencerListItem, 
  InfluencerListRequest,
  InfluencerIndexResponse,
  InfluencerSaveRequest
} from '@/types';

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<InfluencerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 12,
    total: 0,
  });

  const [filters, setFilters] = useState<InfluencerListRequest>({
    page: 1,
    page_size: 12,
    search: '',
    platform_id: 0,
    is_deleted: 0,
    source: 0,
    register_start_at: 0,
    register_end_at: 0,
    tag: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [indexData, setIndexData] = useState<InfluencerIndexResponse>({
    influencer_total: 0,
    active_influencer_total: 0,
    week_influencer_total: 0,
    tag_total: 0,
    influencer_platform_list: [],
    influencer_status_list: [],
    influencer_source_list: [],
    influencer_tag_list: [],
    type_list: [],
  });

  // 手动搜索
  const handleSearch = () => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    // 直接使用新的过滤条件进行搜索，而不是依赖状态更新
    loadInfluencersWithFilters(newFilters);
  };

  useEffect(() => {
    loadIndexData();
  }, []); // 只在组件挂载时加载一次

  useEffect(() => {
    loadInfluencers();
  }, [filters.page, filters.platform_id, filters.is_deleted, filters.source, filters.tag]); // 当过滤条件变化时重新加载

  const loadIndexData = async () => {
    try {
      const response = await influencerService.getInfluencerIndex();
      setIndexData(response);
    } catch (error) {
      console.error('Failed to load index data:', error);
    }
  };

  const loadInfluencers = async () => {
    await loadInfluencersWithFilters(filters);
  };

  const loadInfluencersWithFilters = async (filterParams: InfluencerListRequest) => {
    try {
      setLoading(true);
      const response = await influencerService.getInfluencerList({
        ...filterParams,
        page: pagination.page,
        page_size: pagination.page_size,
      });
      
      setInfluencers(response.list);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Failed to load influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInfluencer = async (id: number) => {
    if (confirm('确定要删除这个达人吗？')) {
      try {
        await influencerService.deleteInfluencer(id);
        loadInfluencers();
        loadIndexData();
      } catch (error) {
        console.error('Failed to delete influencer:', error);
        alert('删除失败：' + (error as Error).message);
      }
    }
  };

  const handleImportInfluencers = async (file: File) => {
    try {
      await influencerService.importInfluencers(file);
      loadInfluencers();
      loadIndexData();
      alert('导入成功！');
    } catch (error) {
      console.error('Failed to import influencers:', error);
      alert('导入失败：' + (error as Error).message);
    }
  };

  const CreateInfluencerModal = () => {
    const [formData, setFormData] = useState<Omit<InfluencerSaveRequest, 'id'>>({
      platform_id: 1,
      platform_user_id: '',
      nickname: '',
      avatar: '',
      introduction: '',
      display_name: '',
      sex: 0,
      age: '',
      type: 1,
      phone: '',
      email: '',
      whatsapp: '',
      weixin: '',
      telegram: '',
      country: '',
      province: '',
      city: '',
      fans_count: 0,
      follow_count: 0,
      video_count: 0,
      average_play_count: 0,
      interaction_rate: 0,
      quality_score: 0,
      risk_level: 1,
      remark: '',
      tags: '',
    });

    if (!isCreateModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await influencerService.createInfluencer(formData);
        setIsCreateModalOpen(false);
        loadInfluencers();
        loadIndexData();
      } catch (error) {
        console.error('Failed to create influencer:', error);
        alert('创建失败：' + (error as Error).message);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">添加达人</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显示名称 *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  平台 *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.platform_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform_id: parseInt(e.target.value) }))}
                >
                  {indexData.influencer_platform_list.map(platform => (
                    <option key={platform.id} value={platform.id}>{platform.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  平台用户ID *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.platform_user_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform_user_id: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  昵称
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  粉丝数 *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.fans_count}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, fans_count: 0 }));
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, fans_count: numValue }));
                      }
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类 *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: parseInt(e.target.value) }))}
                >
                  {indexData.type_list.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                简介
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.introduction}
                onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.remark}
                onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                添加达人
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
                <Users className="h-8 w-8 mr-3 text-green-600" />
                达人管理
              </h1>
              <p className="mt-2 text-gray-600">管理所有合作达人和网红信息</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportInfluencers(file);
                    e.target.value = '';
                  }
                }}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                批量导入
              </label>
              
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加达人
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总达人数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.influencer_total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">活跃达人</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.active_influencer_total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Edit className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">本周联系</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.week_influencer_total.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">标签总数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.tag_total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索达人名称..."
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
              value={filters.platform_id}
              onChange={(e) => setFilters(prev => ({ ...prev, platform_id: parseInt(e.target.value) }))}
            >
              <option value={0}>所有平台</option>
              {indexData.influencer_platform_list.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filters.is_deleted}
                              onChange={(e) => setFilters(prev => ({ ...prev, is_deleted: parseInt(e.target.value) }))}
            >
              <option value={0}>所有状态</option>
              {indexData.influencer_status_list.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.tag}
              onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
            >
              <option value="">所有标签</option>
              {indexData.influencer_tag_list.map(tag => (
                <option key={tag.id} value={tag.id.toString()}>{tag.name}</option>
              ))}
            </select>
            
            <button
              onClick={loadInfluencers}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </button>
          </div>
        </div>

        {/* Influencers Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">达人列表</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  共 {pagination.total} 位达人
                </span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : influencers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无达人数据</p>
            </div>
          ) : (
            <React.Fragment key="influencer-list">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {influencers.map((influencer) => (
                  <div key={influencer.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900 text-sm">{influencer.display_name}</h4>
                          <p className="text-xs text-gray-500">ID: {influencer.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleDeleteInfluencer(influencer.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">来源</span>
                        <span className="font-medium">
                          {indexData.influencer_source_list.find(s => s.id === influencer.source)?.name || '未知'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">创建时间</span>
                        <span className="font-medium">
                          {influencer.created_at ? new Date(influencer.created_at * 1000).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">活跃时间</span>
                        <span className="font-medium">
                          {influencer.active_time ? new Date(influencer.active_time * 1000).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {influencer.tags?.slice(0, 3).map((tag, index) => (
                          <span
                            key={tag.id || `tag-${influencer.id}-${index}`}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {(influencer.tags?.length || 0) > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{(influencer.tags?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          title="编辑标签"
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Tag className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Link
                        href={`/influencers/${influencer.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
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
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
            </React.Fragment>
          )}
        </div>

        {/* Create Influencer Modal */}
        <CreateInfluencerModal />
      </div>
    </div>
  );
}