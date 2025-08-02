'use client';

import { useState } from 'react';
import { BarChart3, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { bdPerformanceService } from '@/services';

export default function BdPerformancePage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleFileUpload = async (file: File, fileType: string) => {
    try {
      setUploading(true);
      setMessage(null);
      
      await bdPerformanceService.importExcel(file, fileType);
      
      setMessage({
        type: 'success',
        text: '数据导入成功！'
      });
    } catch (error) {
      console.error('Failed to import performance data:', error);
      setMessage({
        type: 'error',
        text: '数据导入失败：' + (error as Error).message
      });
    } finally {
      setUploading(false);
    }
  };

  const FileUploadCard = ({ title, fileType, description }: { title: string, fileType: string, description: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <FileSpreadsheet className="h-8 w-8 text-blue-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file, fileType);
            e.target.value = '';
          }
        }}
        className="hidden"
        id={`upload-${fileType}`}
        disabled={uploading}
      />
      <label
        htmlFor={`upload-${fileType}`}
        className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
          uploading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? '上传中...' : '选择文件'}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            绩效管理
          </h1>
          <p className="mt-2 text-gray-600">管理和导入绩效数据</p>
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

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FileUploadCard
            title="BD绩效数据"
            fileType="bd_performance"
            description="上传BD人员的绩效数据Excel文件"
          />
          
          <FileUploadCard
            title="销售数据"
            fileType="sales_data"
            description="上传销售相关的绩效数据Excel文件"
          />
          
          <FileUploadCard
            title="合作数据"
            fileType="cooperation_data"
            description="上传合作相关的绩效数据Excel文件"
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">使用说明</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              支持Excel文件格式（.xlsx, .xls）
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              请确保Excel文件格式符合系统要求
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              上传成功后数据会自动处理和分析
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              如遇到问题请检查文件格式或联系系统管理员
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}