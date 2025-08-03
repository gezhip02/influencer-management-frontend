'use client';

import { useState } from 'react';
import { BarChart3, Upload, AlertCircle, CheckCircle, Trophy, Database } from 'lucide-react';
import { performanceService } from '@/services';

export default function BdPerformancePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleDataManagement = async (file: File, fileType: string) => {
    try {
      setUploading(true);
      setMessage(null);
      
      await performanceService.importExcel(file, fileType);
      
      setMessage({
        type: 'success',
        text: '数据管理导入成功！'
      });
    } catch (error) {
      console.error('Failed to import performance data:', error);
      setMessage({
        type: 'error',
        text: '数据管理导入失败：' + (error as Error).message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRanking = async (file: File, fileType: string) => {
    try {
      setUploading(true);
      setMessage(null);
      
      await performanceService.ranking(file, fileType);
      
      setMessage({
        type: 'success',
        text: '榜单数据导入成功！'
      });
    } catch (error) {
      console.error('Failed to import ranking data:', error);
      setMessage({
        type: 'error',
        text: '榜单数据导入失败：' + (error as Error).message
      });
    } finally {
      setUploading(false);
    }
  };

  const DataManagementSection = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Database className="h-8 w-8 text-blue-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">数据管理</h3>
      </div>
      <p className="text-gray-600 mb-6">上传Excel文件进行数据管理</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 视频模板 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">视频模板</h4>
          <p className="text-sm text-gray-600 mb-3">上传视频相关的数据模板</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleDataManagement(file, 'video');
                e.target.value = '';
              }
            }}
            className="hidden"
            id="upload-data-video"
            disabled={uploading}
          />
          <label
            htmlFor="upload-data-video"
            className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors w-full ${
              uploading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? '上传中...' : '选择视频模板'}
          </label>
        </div>

        {/* 直播模板 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">直播模板</h4>
          <p className="text-sm text-gray-600 mb-3">上传直播相关的数据模板</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleDataManagement(file, 'live');
                e.target.value = '';
              }
            }}
            className="hidden"
            id="upload-data-live"
            disabled={uploading}
          />
          <label
            htmlFor="upload-data-live"
            className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors w-full ${
              uploading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? '上传中...' : '选择直播模板'}
          </label>
        </div>
      </div>
    </div>
  );

  const RankingSection = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">榜单管理</h3>
      </div>
      <p className="text-gray-600 mb-6">上传Excel文件进行榜单管理</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 视频榜单 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">视频榜单</h4>
          <p className="text-sm text-gray-600 mb-3">上传视频相关的榜单数据</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleRanking(file, 'video');
                e.target.value = '';
              }
            }}
            className="hidden"
            id="upload-ranking-video"
            disabled={uploading}
          />
          <label
            htmlFor="upload-ranking-video"
            className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors w-full ${
              uploading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? '上传中...' : '选择视频榜单'}
          </label>
        </div>

        {/* 直播榜单 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">直播榜单</h4>
          <p className="text-sm text-gray-600 mb-3">上传直播相关的榜单数据</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleRanking(file, 'live');
                e.target.value = '';
              }
            }}
            className="hidden"
            id="upload-ranking-live"
            disabled={uploading}
          />
          <label
            htmlFor="upload-ranking-live"
            className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors w-full ${
              uploading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? '上传中...' : '选择直播榜单'}
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            BD绩效管理
          </h1>
          <p className="mt-2 text-gray-600">数据管理和榜单管理功能</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          <DataManagementSection />
          <RankingSection />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-600 mb-2">数据管理</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  支持视频模板和直播模板两种类型
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  用于导入和管理绩效相关数据
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  支持Excel文件格式（.xlsx, .xls）
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-600 mb-2">榜单管理</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  支持视频榜单和直播榜单两种类型
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  用于导入和管理排名相关数据
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  上传后自动处理排名数据
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}