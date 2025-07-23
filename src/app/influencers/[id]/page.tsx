'use client';

import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Hash, ExternalLink, Edit, Heart, Users, TrendingUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { influencerService } from '@/services/influencer-service';
import type { Influencer, FulfillmentRecord } from '@/types';

export default function InfluencerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [influencerData, fulfillmentData] = await Promise.all([
          influencerService.getInfluencerById(id),
          influencerService.getInfluencerFulfillments(id)
        ]);
        setInfluencer(influencerData);
        setFulfillments(fulfillmentData.data);
      } catch (error) {
        console.error('Failed to fetch influencer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">未找到该达人信息</p>
          <Link href="/influencers" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            返回达人列表
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: '基本信息', icon: User },
    { id: 'fulfillments', label: '履约记录', icon: TrendingUp },
    { id: 'stats', label: '数据统计', icon: Hash },
  ];

  const renderInfoTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            个人信息
          </h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">达人姓名</dt>
              <dd className="text-sm text-gray-900 font-medium">{influencer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">昵称</dt>
              <dd className="text-sm text-gray-900">{influencer.nickname || '未设置'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">性别</dt>
              <dd className="text-sm text-gray-900">{influencer.gender === 'MALE' ? '男' : influencer.gender === 'FEMALE' ? '女' : '未知'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">年龄</dt>
              <dd className="text-sm text-gray-900">{influencer.age || '未知'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">地区</dt>
              <dd className="text-sm text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {influencer.region || '未设置'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            联系方式
          </h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">邮箱</dt>
              <dd className="text-sm text-gray-900">{influencer.email || '未设置'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">电话</dt>
              <dd className="text-sm text-gray-900">{influencer.phone || '未设置'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">微信</dt>
              <dd className="text-sm text-gray-900">{influencer.wechat || '未设置'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            社交媒体数据
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {influencer.platforms.map((platform) => (
              <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{platform.name}</h4>
                  {platform.url && (
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">粉丝数</dt>
                    <dd className="text-gray-900 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {platform.followers.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">平均点赞</dt>
                    <dd className="text-gray-900 flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {platform.avgLikes.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">账号</dt>
                    <dd className="text-gray-900 truncate">{platform.account}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
          <div className="flex flex-wrap gap-2">
            {influencer.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFulfillmentsTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">履约记录</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平台</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fulfillments.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.productName}</div>
                  <div className="text-sm text-gray-500">{record.productBrand}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    record.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {record.status === 'COMPLETED' ? '已完成' :
                     record.status === 'IN_PROGRESS' ? '进行中' :
                     record.status === 'PENDING' ? '待开始' : '已取消'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.platform}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/fulfillment/${record.id}`} className="text-blue-600 hover:text-blue-500">
                    查看详情
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatsTab = () => {
    const completedCount = fulfillments.filter(f => f.status === 'COMPLETED').length;
    const inProgressCount = fulfillments.filter(f => f.status === 'IN_PROGRESS').length;
    const totalFollowers = influencer.platforms.reduce((sum, platform) => sum + platform.followers, 0);
    const avgLikes = influencer.platforms.reduce((sum, platform) => sum + platform.avgLikes, 0) / influencer.platforms.length;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">履约统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">总履约数</span>
              <span className="text-2xl font-bold text-blue-600">{fulfillments.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">已完成</span>
              <span className="text-lg font-semibold text-green-600">{completedCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">进行中</span>
              <span className="text-lg font-semibold text-blue-600">{inProgressCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">完成率</span>
              <span className="text-lg font-semibold text-purple-600">
                {fulfillments.length > 0 ? Math.round(completedCount / fulfillments.length * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">社交媒体统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">总粉丝数</span>
              <span className="text-2xl font-bold text-blue-600">{totalFollowers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">平台数量</span>
              <span className="text-lg font-semibold text-green-600">{influencer.platforms.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">平均点赞</span>
              <span className="text-lg font-semibold text-purple-600">{Math.round(avgLikes).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">注册时间</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(influencer.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">标签数量</span>
              <span className="text-lg font-semibold text-green-600">{influencer.tags.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">状态</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                influencer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {influencer.status === 'ACTIVE' ? '活跃' : '未激活'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info': return renderInfoTab();
      case 'fulfillments': return renderFulfillmentsTab();
      case 'stats': return renderStatsTab();
      default: return renderInfoTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/influencers" className="text-blue-600 hover:text-blue-500">
              ← 返回列表
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{influencer.name}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              influencer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {influencer.status === 'ACTIVE' ? '活跃' : '未激活'}
            </span>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Edit className="h-4 w-4 mr-2" />
              编辑信息
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
}