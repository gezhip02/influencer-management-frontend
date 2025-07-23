'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Trophy, TrendingUp, Award, Users, Target, Calendar } from 'lucide-react';
import { bdPerformanceService } from '@/services';
import type { BdPerformance, PaginatedResponse } from '@/types';

export default function BdPerformancePage() {
  const [performances, setPerformances] = useState<BdPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    sort: 'roi',
  });

  const [topPerformers, setTopPerformers] = useState<any[]>([]);

  useEffect(() => {
    loadPerformances();
    loadTopPerformers();
  }, [filters]);

  const loadPerformances = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<BdPerformance> = await bdPerformanceService.getBdPerformances({
        year: filters.year,
        month: filters.month,
        sort: filters.sort,
        page: 1,
        pageSize: 20,
      });
      
      setPerformances(response.data);
    } catch (error) {
      console.error('Failed to load BD performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopPerformers = async () => {
    // Mock top performers data
    setTopPerformers([
      {
        id: '1',
        name: '张经理',
        department: '华东区',
        metrics: {
          totalOrders: 156,
          completedOrders: 142,
          revenue: 2850000,
          roi: 4.2,
        },
        ranking: 1,
        bonus: 45000,
        avatar: null,
      },
      {
        id: '2',
        name: '李主管',
        department: '华南区',
        metrics: {
          totalOrders: 134,
          completedOrders: 128,
          revenue: 2650000,
          roi: 3.8,
        },
        ranking: 2,
        bonus: 38000,
        avatar: null,
      },
      {
        id: '3',
        name: '王总监',
        department: '华北区',
        metrics: {
          totalOrders: 128,
          completedOrders: 120,
          revenue: 2420000,
          roi: 3.6,
        },
        ranking: 3,
        bonus: 35000,
        avatar: null,
      },
    ]);
  };

  const getRankingIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Award className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-400" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankingBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                BD绩效排行榜
              </h1>
              <p className="mt-2 text-gray-600">BD团队绩效排名和奖金统计</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Calendar className="h-4 w-4 mr-2" />
                导出报告
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                绩效分析
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月份</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              >
                <option value="">全年</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              >
                <option value="roi">ROI排名</option>
                <option value="revenue">营收排名</option>
                <option value="orders">订单量排名</option>
                <option value="completion">完成率排名</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadPerformances}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                刷新数据
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 龙虎榜 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topPerformers.slice(0, 3).map((performer, index) => (
            <div
              key={performer.id}
              className={`relative bg-gradient-to-br ${getRankingBg(performer.ranking)} rounded-lg shadow-lg p-6 text-white overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getRankingIcon(performer.ranking)}
                    <span className="ml-2 text-lg font-bold">第{performer.ranking}名</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">奖金</div>
                    <div className="text-lg font-bold">¥{performer.bonus?.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{performer.name}</h3>
                    <p className="text-sm opacity-90">{performer.department}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs opacity-90">总订单</div>
                    <div className="text-lg font-bold">{performer.metrics.totalOrders}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-90">ROI</div>
                    <div className="text-lg font-bold">{performer.metrics.roi}x</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-90">营收</div>
                    <div className="text-sm font-bold">¥{(performer.metrics.revenue / 10000).toFixed(0)}万</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-90">完成率</div>
                    <div className="text-sm font-bold">
                      {((performer.metrics.completedOrders / performer.metrics.totalOrders) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 装饰性背景 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12" />
            </div>
          ))}
        </div>

        {/* 绩效排行表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">完整排行榜</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      排名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BD姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      部门
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总订单
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成订单
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      营收（万元）
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      奖金（元）
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...topPerformers, ...Array.from({ length: 7 }, (_, i) => ({
                    id: `mock_${i + 4}`,
                    name: `BD${i + 4}`,
                    department: ['华东区', '华南区', '华北区', '西南区', '东北区'][i % 5],
                    metrics: {
                      totalOrders: 120 - i * 5,
                      completedOrders: 110 - i * 5,
                      revenue: 2000000 - i * 100000,
                      roi: 3.5 - i * 0.1,
                    },
                    ranking: i + 4,
                    bonus: 30000 - i * 2000,
                  }))].map((performer, index) => (
                    <tr key={performer.id} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankingIcon(performer.ranking)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {performer.ranking}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{performer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {performer.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {performer.metrics.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {performer.metrics.completedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(performer.metrics.revenue / 10000).toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          performer.metrics.roi >= 4 ? 'bg-green-100 text-green-800' :
                          performer.metrics.roi >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {performer.metrics.roi}x
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {((performer.metrics.completedOrders / performer.metrics.totalOrders) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ¥{performer.bonus?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}