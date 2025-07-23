'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { dashboardService } from '@/services';

interface DashboardData {
  totalRecords: number;
  completedRecords: number;
  inProgressRecords: number;
  timeoutRecords: number;
  completionRate: number;
  averageTimeToComplete: number;
}

export default function FulfillmentDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalRecords: 0,
    completedRecords: 0,
    inProgressRecords: 0,
    timeoutRecords: 0,
    completionRate: 0,
    averageTimeToComplete: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      // Mock数据
      setData({
        totalRecords: 1247,
        completedRecords: 1089,
        inProgressRecords: 158,
        timeoutRecords: 23,
        completionRate: 87.3,
        averageTimeToComplete: 5.2,
      });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const dashboardData = await dashboardService.getEnhancedStats();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: number;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-1">
              <TrendingUp className={`h-4 w-4 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            履约仪表板
          </h1>
          <p className="mt-2 text-gray-600">实时监控履约状态和绩效指标</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总履约单数"
            value={data.totalRecords}
            icon={BarChart3}
            color="bg-blue-500"
            trend={12}
          />
          
          <StatCard
            title="已完成"
            value={data.completedRecords}
            icon={CheckCircle}
            color="bg-green-500"
            trend={8}
          />
          
          <StatCard
            title="进行中"
            value={data.inProgressRecords}
            icon={Clock}
            color="bg-yellow-500"
            trend={-3}
          />
          
          <StatCard
            title="超时预警"
            value={data.timeoutRecords}
            icon={AlertTriangle}
            color="bg-red-500"
            trend={-15}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Completion Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">完成率统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">总完成率</span>
                <span className="text-2xl font-bold text-green-600">{data.completionRate}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${data.completionRate}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium text-gray-900">{data.completedRecords}</div>
                  <div className="text-gray-500">已完成</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{data.inProgressRecords}</div>
                  <div className="text-gray-500">进行中</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{data.timeoutRecords}</div>
                  <div className="text-gray-500">超时</div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">时效统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">平均完成时间</span>
                <span className="text-2xl font-bold text-blue-600">{data.averageTimeToComplete} 天</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">≤ 3天</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">4-7天</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">&gt; 7天</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Status Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">履约状态分布</h3>
            <div className="space-y-4">
              {[
                { label: '已完成', count: data.completedRecords, color: 'bg-green-500', percentage: (data.completedRecords / data.totalRecords * 100).toFixed(1) },
                { label: '进行中', count: data.inProgressRecords, color: 'bg-blue-500', percentage: (data.inProgressRecords / data.totalRecords * 100).toFixed(1) },
                { label: '超时预警', count: data.timeoutRecords, color: 'bg-red-500', percentage: (data.timeoutRecords / data.totalRecords * 100).toFixed(1) },
              ].map((status) => (
                <div key={status.label} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded ${status.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-900">{status.label}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${status.color}`}
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 w-12 text-right">
                      {status.percentage}%
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-16 text-right">
                      {status.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速统计</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">今日新增</span>
                <span className="text-lg font-bold text-blue-600">12</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">今日完成</span>
                <span className="text-lg font-bold text-green-600">8</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">待处理</span>
                <span className="text-lg font-bold text-yellow-600">25</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">本周完成率</span>
                <span className="text-lg font-bold text-purple-600">92%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
          <div className="space-y-4">
            {[
              { action: '履约单完成', record: '美妆达人小雅CC2 × 兰蔻合作', time: '2分钟前', type: 'success' },
              { action: '状态更新', record: '科技数码达人 × 小米合作', time: '15分钟前', type: 'info' },
              { action: '超时预警', record: '健身达人 × 蛋白粉推广', time: '1小时前', type: 'warning' },
              { action: '履约单创建', record: '美食博主 × 餐厅探店', time: '2小时前', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'success' ? 'bg-green-400' :
                    activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}></div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span> - {activity.record}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}