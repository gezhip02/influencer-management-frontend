'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Tag, 
  ChevronRight,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

// Mock测试功能
function MockTestButton() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testMockData = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // 测试基础连通性
      console.log('🧪 开始测试Mock数据...');
      
      // 测试影响者数据
      const influencersResponse = await fetch('/api/influencers?page=1&pageSize=5');
      const influencersData = await influencersResponse.json();
      
      // 测试标签数据
      const tagsResponse = await fetch('/api/tags?page=1&pageSize=5');
      const tagsData = await tagsResponse.json();
      
      // 测试履约记录数据
      const fulfillmentResponse = await fetch('/api/fulfillment-records?page=1&pageSize=5');
      const fulfillmentData = await fulfillmentResponse.json();

      const results = {
        influencers: `✅ 达人数据: ${influencersData?.data?.total || 0} 条`,
        tags: `✅ 标签数据: ${tagsData?.data?.total || 0} 条`,
        fulfillment: `✅ 履约记录: ${fulfillmentData?.data?.total || 0} 条`,
      };

      setTestResult(`Mock数据测试结果:\n${Object.values(results).join('\n')}`);
      console.log('✅ Mock数据测试完成:', results);
      
    } catch (error) {
      console.error('❌ Mock数据测试失败:', error);
      setTestResult(`❌ 测试失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-yellow-800 mb-2">🧪 Mock数据测试</h3>
      <button
        onClick={testMockData}
        disabled={isLoading}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '测试中...' : '测试Mock数据'}
      </button>
      
      {testResult && (
        <pre className="mt-3 p-3 bg-gray-100 rounded text-sm text-gray-800 whitespace-pre-wrap">
          {testResult}
        </pre>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">履约管理系统</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/influencers" className="text-gray-500 hover:text-gray-900">达人管理</Link>
              <Link href="/fulfillment" className="text-gray-500 hover:text-gray-900">履约管理</Link>
              <Link href="/bd-performance" className="text-gray-500 hover:text-gray-900">BD绩效</Link>
              <Link href="/tags" className="text-gray-500 hover:text-gray-900">标签管理</Link>
              <Link href="/settings" className="text-gray-500 hover:text-gray-900">设置</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mock测试组件 */}
        <MockTestButton />

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">欢迎使用履约管理系统</h2>
          <p className="text-lg text-gray-600">
            智能管理 TikTok、抖音、快手、视频号等平台达人资源，提供精准标签匹配和合作流程跟踪
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总达人数</p>
                <p className="text-2xl font-bold text-gray-900">12,847</p>
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
                <p className="text-2xl font-bold text-gray-900">8,934</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">已签约</p>
                <p className="text-2xl font-bold text-gray-900">2,156</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">标签总数</p>
                <p className="text-2xl font-bold text-gray-900">286</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/influencers" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">达人管理</h3>
                <p className="text-gray-600 text-sm">管理所有合作达人的信息和状态</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/fulfillment" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">履约管理</h3>
                <p className="text-gray-600 text-sm">管理所有达人履约记录和合作状态</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/bd-performance" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">BD绩效</h3>
                <p className="text-gray-600 text-sm">查看和分析BD团队的绩效数据</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/tags" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">标签管理</h3>
                <p className="text-gray-600 text-sm">管理达人标签分类和标记</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/fulfillment/create" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">创建履约单</h3>
                <p className="text-gray-600 text-sm">为达人创建新的合作履约单</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>

          <Link href="/settings" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">系统设置</h3>
                <p className="text-gray-600 text-sm">配置系统参数和用户权限</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">近期活动</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-sm text-gray-600">
                  新增达人：美妆达人小雅CC2 已加入合作列表
                </span>
                <span className="ml-auto text-xs text-gray-400">2小时前</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="ml-3 text-sm text-gray-600">
                  履约提醒：科技评测师张三 的评测内容即将到期
                </span>
                <span className="ml-auto text-xs text-gray-400">4小时前</span>
              </div>
              
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="ml-3 text-sm text-gray-600">
                  合同更新：时尚博主Lisa 的合同已续签
                </span>
                <span className="ml-auto text-xs text-gray-400">1天前</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}