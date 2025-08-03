'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, Search, Eye, Edit, Play, ShoppingCart } from 'lucide-react';
import { contentService } from '@/services';
import type { 
  ContentIndexResponse,
  ContentListRequest, 
  ContentListItem,
  ContentEditRequest
} from '@/types';

export default function ContentPage() {
  const [indexData, setIndexData] = useState<ContentIndexResponse>({
    total: 0,
    order_num: 0,
    play_num: 0,
  });
  const [contents, setContents] = useState<ContentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContentListRequest>({
    page: 1,
    page_size: 20,
    search: '',
    status: '',
    data: 0,
    order_by: 1,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContent, setEditingContent] = useState<ContentListItem | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  useEffect(() => {
    loadContentIndex();
    loadContents();
  }, [filters]);

  const loadContentIndex = async () => {
    try {
      const response = await contentService.getContentIndex();
      setIndexData(response);
    } catch (error) {
      console.error('Failed to load content index:', error);
    }
  };

  const loadContents = async () => {
    try {
      setLoading(true);
      const response = await contentService.getContentList({
        ...filters,
        page: pagination.page,
        page_size: pagination.page_size,
      });
      
      setContents(response.list);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Failed to load contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEdit = async (data: ContentEditRequest) => {
    try {
      await contentService.editContent(data);
      setEditingContent(null);
      loadContents();
    } catch (error) {
      console.error('Failed to edit content:', error);
      alert('编辑失败：' + (error as Error).message);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await contentService.importContentExcel(file);
      alert('导入成功');
      loadContents();
      loadContentIndex();
    } catch (error) {
      console.error('Failed to import:', error);
      alert('导入失败：' + (error as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-blue-100 text-blue-800', 
      'received': 'bg-purple-100 text-purple-800',
      'content_created': 'bg-indigo-100 text-indigo-800',
      'published': 'bg-green-100 text-green-800',
      'sales_conversion': 'bg-emerald-100 text-emerald-800',
      'completed': 'bg-gray-100 text-gray-800',
      'canceled': 'bg-red-100 text-red-800',
      'timeout': 'bg-orange-100 text-orange-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'pending': '待寄样',
      'sent': '已寄样',
      'received': '已签收',
      'content_created': '内容制作',
      'published': '已发布',
      'sales_conversion': '销售转化',
      'completed': '已完成',
      'canceled': '取消',
      'timeout': '超时',
    };
    return statusTexts[status] || status;
  };

  const EditModal = () => {
    const [formData, setFormData] = useState<ContentEditRequest>({
      id: editingContent?.id || 0,
      content_remark: editingContent?.content_remark || '',
      ads_status: editingContent?.ads_status || 0,
    });

    if (!editingContent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">编辑内容</h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit(formData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容管理备注
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.content_remark}
                onChange={(e) => setFormData(prev => ({ ...prev, content_remark: e.target.value }))}
                placeholder="请输入备注..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                投流状态
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.ads_status}
                onChange={(e) => setFormData(prev => ({ ...prev, ads_status: parseInt(e.target.value) }))}
              >
                <option value={0}>否</option>
                <option value={1}>是</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingContent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-600" />
                内容管理
              </h1>
              <p className="mt-2 text-gray-600">管理内容数据和投流状态</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                导入数据
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总记录数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总出单数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.order_num}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">平均播放量</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.play_num}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索内容..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
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
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">所有状态</option>
              <option value="pending">待寄样</option>
              <option value="sent">已寄样</option>
              <option value="received">已签收</option>
              <option value="content_created">内容制作</option>
              <option value="published">已发布</option>
              <option value="sales_conversion">销售转化</option>
              <option value="completed">已完成</option>
              <option value="canceled">取消</option>
              <option value="timeout">超时</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.data}
              onChange={(e) => setFilters(prev => ({ ...prev, data: parseInt(e.target.value) }))}
            >
              <option value={0}>全部数据</option>
              <option value={1}>有数据</option>
              <option value={2}>无数据</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.order_by}
              onChange={(e) => setFilters(prev => ({ ...prev, order_by: parseInt(e.target.value) }))}
            >
              <option value={1}>创建时间 ↓</option>
              <option value={2}>创建时间 ↑</option>
              <option value={3}>播放量 ↓</option>
              <option value={4}>播放量 ↑</option>
              <option value={5}>出单数 ↓</option>
              <option value={6}>出单数 ↑</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">达人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">视频</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投流码</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">播放量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出单数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投流状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {content.influencer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(content.status)}`}>
                          {getStatusText(content.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.video_url ? (
                          <a href={content.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.ad_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.published_at || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.play_num.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.order_num.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          content.ads_status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {content.ads_status === 1 ? '是' : '否'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => setEditingContent(content)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {contents.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
          </div>
        )}

        {/* Edit Modal */}
        <EditModal />
      </div>
    </div>
  );
}