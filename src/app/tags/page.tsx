'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Search, Grid, List, Edit, Trash2, Users } from 'lucide-react';
import { tagService } from '@/services';
import type { 
  Tag as TagType, 
  TagListRequest, 
  TagIndexResponse,
  TagEditRequest 
} from '@/types';

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0,
  });

  const [indexData, setIndexData] = useState<TagIndexResponse>({
    tag_total: 0,
    influencer_total: 0,
    tag_category_total: 0,
    tag_category_list: [],
  });

  useEffect(() => {
    loadTagIndex();
    loadTags();
  }, [categoryFilter, pagination.page]); // 移除 search，避免实时搜索

  const handleSearch = () => {
    const newSearch = searchTerm;
    const newPagination = { ...pagination, page: 1 };
    setSearch(newSearch);
    setPagination(newPagination);
    // 直接使用新的搜索条件进行搜索，而不是依赖状态更新
    loadTagsWithSearch(newSearch, newPagination);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadTagIndex = async () => {
    try {
      const response = await tagService.getTagIndex({
        search: '',
        category: 0,
        page: 1,
        page_size: 20
      });
      setIndexData(response);
    } catch (error) {
      console.error('Failed to load tag index:', error);
    }
  };

  const loadTags = async () => {
    await loadTagsWithSearch(search, pagination);
  };

  const loadTagsWithSearch = async (searchTerm: string, paginationParams: typeof pagination) => {
    try {
      setLoading(true);
      const response = await tagService.getTagList({
        search: searchTerm,
        page: paginationParams.page,
        page_size: paginationParams.page_size,
      });
      
      setTags(response.list);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (tagData: Omit<TagEditRequest, 'id'>) => {
    try {
      await tagService.createTag(tagData);
      setIsCreateModalOpen(false);
      loadTags();
      loadTagIndex();
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert('创建标签失败：' + (error as Error).message);
    }
  };

  const handleUpdateTag = async (tagData: Omit<TagEditRequest, 'id'>) => {
    if (!editingTag) return;
    
    try {
      // 保持原有的其他字段不变，只更新name和remark
      const updateData = {
        ...tagData,
        display_name: tagData.name, // 使用name作为display_name
        category: editingTag.category, // 保持原有分类
        color: editingTag.color, // 保持原有颜色
        icon: editingTag.icon, // 保持原有图标
      };
      
      await tagService.updateTag(editingTag.id, updateData);
      setEditingTag(null);
      loadTags();
      loadTagIndex();
    } catch (error) {
      console.error('Failed to update tag:', error);
      alert('更新标签失败：' + (error as Error).message);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (confirm('确定要删除这个标签吗？')) {
      try {
        await tagService.deleteTag(tagId);
        loadTags();
        loadTagIndex();
      } catch (error) {
        console.error('Failed to delete tag:', error);
        alert('删除标签失败：' + (error as Error).message);
      }
    }
  };

  const TagModal = ({ tag, onClose, onSave }: {
    tag?: TagType | null;
    onClose: () => void;
    onSave: (data: Omit<TagEditRequest, 'id'>) => void;
  }) => {
    const [formData, setFormData] = useState<Omit<TagEditRequest, 'id'>>({
      display_name: tag?.display_name || '',
      name: tag?.name || '',
      category: tag?.category || 1,
      color: tag?.color || '#6B7280',
      icon: tag?.icon || '',
      remark: tag?.remark || '',
    });

    if (!isCreateModalOpen && !editingTag) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {tag ? '编辑标签' : '创建新标签'}
          </h2>
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // 简化数据，只保留必要字段
              const simplifiedData = {
                display_name: formData.name, // 使用name作为display_name
                name: formData.name,
                category: 1, // 默认分类
                color: '#6B7280', // 默认颜色
                icon: '', // 默认空图标
                remark: formData.remark,
              };
              onSave(simplifiedData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标签名称 *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入标签名称"
              />
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
                placeholder="标签备注（可选）"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
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
                {tag ? '更新标签' : '创建标签'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TagGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tags.map((tag) => (
        <div key={tag.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {tag.icon && <span className="mr-2 text-lg">{tag.icon}</span>}
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: tag.color }}
              />
              <h3 className="font-medium text-gray-900">{tag.display_name}</h3>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setEditingTag(tag)}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="编辑"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            分类: {tag.category_name}
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            名称: {tag.name}
          </div>
          
          {tag.remark && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {tag.remark}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>关联达人数</span>
            </div>
            <span className="font-medium">{tag.influencer_count || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const TagListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              标签
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              分类
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              备注
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              关联达人
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              创建时间
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tags.map((tag) => (
            <tr key={tag.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {tag.icon && <span className="mr-2">{tag.icon}</span>}
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tag.display_name}</div>
                    <div className="text-xs text-gray-500">{tag.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tag.category_name || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {tag.remark || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tag.influencer_count || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tag.created_at ? new Date(tag.created_at * 1000).toLocaleDateString('zh-CN') : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setEditingTag(tag)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-12"> {/* 添加底部padding */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Tag className="h-8 w-8 mr-3 text-purple-600" />
                标签管理
              </h1>
              <p className="mt-2 text-gray-600">管理产品、达人等标签分类</p>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              创建标签
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总标签数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.tag_total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">关联达人数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.influencer_total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100">
                <Tag className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">标签分类数</p>
                <p className="text-2xl font-bold text-gray-900">{indexData.tag_category_total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-100">
                <Tag className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">当前页标签数</p>
                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索标签..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(parseInt(e.target.value))}
              >
                <option value={0}>所有分类</option>
                {indexData.tag_category_list.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">加载中...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无标签数据</p>
          </div>
        ) : viewMode === 'grid' ? (
          <TagGridView />
        ) : (
          <TagListView />
        )}

        {/* Pagination */}
        {tags.length > 0 && (
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

        {/* Tag Modal */}
        <TagModal 
          tag={editingTag}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingTag(null);
          }}
          onSave={editingTag ? handleUpdateTag : handleCreateTag}
        />
      </div>
    </div>
  );
}