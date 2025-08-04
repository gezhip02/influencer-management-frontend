'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  User, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Heart, 
  Edit, 
  TrendingUp, 
  Hash,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { influencerService } from '@/services';
import type { InfluencerInfo } from '@/types';

interface InfluencerDetailProps {
  influencerId: string;
}

type TabId = 'info' | 'fulfillments' | 'stats';

export default function InfluencerDetail({ influencerId }: InfluencerDetailProps) {
  const [influencer, setInfluencer] = useState<InfluencerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [fulfillments, setFulfillments] = useState<any[]>([]);

  useEffect(() => {
    if (influencerId) {
      fetchData();
    }
  }, [influencerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const influencerData = await influencerService.getInfluencerInfo(Number(influencerId));
      setInfluencer(influencerData);
      setFulfillments([]);
    } catch (error) {
      console.error('Failed to fetch influencer data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    { id: 'info' as TabId, label: '基本信息', icon: User },
    { id: 'fulfillments' as TabId, label: '履约记录', icon: TrendingUp },
    { id: 'stats' as TabId, label: '数据统计', icon: Hash },
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
              <dd className="text-sm text-gray-900 font-medium">{influencer.display_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">昵称</dt>
              <dd className="text-sm text-gray-900">{influencer.nickname || '未设置'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">性别</dt>
              <dd className="text-sm text-gray-900">
                {influencer.sex === 1 ? '男' : influencer.sex === 2 ? '女' : '未知'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">年龄</dt>
              <dd className="text-sm text-gray-900">{influencer.age || '未知'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">地区</dt>
              <dd className="text-sm text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                {[influencer.country, influencer.province, influencer.city].filter(Boolean).join(' ') || '未设置'}
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
              <dd className="text-sm text-gray-900">{influencer.weixin || '未设置'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">WhatsApp</dt>
              <dd className="text-sm text-gray-900">{influencer.whatsapp || '未设置'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            平台信息
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">平台用户ID</p>
              <p className="text-sm font-medium text-gray-900">{influencer.platform_user_id}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">粉丝数</p>
                <p className="text-lg font-semibold text-gray-900">
                  {influencer.fans_count?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">关注数</p>
                <p className="text-lg font-semibold text-gray-900">
                  {influencer.follow_count?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">视频数</p>
                <p className="text-lg font-semibold text-gray-900">
                  {influencer.video_count?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">互动率</p>
                <p className="text-lg font-semibold text-gray-900">
                  {influencer.interaction_rate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            质量评分
          </h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">质量评分</dt>
              <dd className="text-sm text-gray-900">
                <span className="text-lg font-semibold">{influencer.quality_score || 0}</span>
                <span className="text-sm text-gray-500">/100</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">平均播放量</dt>
              <dd className="text-sm text-gray-900">
                {influencer.average_play_count?.toLocaleString() || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">达人类型</dt>
              <dd className="text-sm text-gray-900">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  influencer.type === 1 ? 'bg-purple-100 text-purple-800' :
                  influencer.type === 2 ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {influencer.type === 1 ? 'KOL' : 
                   influencer.type === 2 ? 'KOC' : '素人'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );

  const renderFulfillmentsTab = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">履约记录</h3>
      </div>
      
      {fulfillments.length === 0 ? (
        <div className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无履约记录</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {/* 履约记录列表 */}
        </div>
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">平台数据统计</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">总粉丝数</span>
            <span className="text-lg font-semibold text-gray-900">
              {influencer.fans_count?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">平均播放量</span>
            <span className="text-lg font-semibold text-gray-900">
              {influencer.average_play_count?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">平均互动率</span>
            <span className="text-lg font-semibold text-gray-900">
              {influencer.interaction_rate?.toFixed(1) || 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">履约统计</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">总履约数</span>
            <span className="text-lg font-semibold text-gray-900">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">完成率</span>
            <span className="text-lg font-semibold text-gray-900">0%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'fulfillments':
        return renderFulfillmentsTab();
      case 'stats':
        return renderStatsTab();
      default:
        return renderInfoTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/influencers"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回达人列表
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {influencer.display_name}
              </h1>
              <p className="mt-2 text-gray-600">
                {influencer.nickname && `${influencer.nickname} • `}
                {[influencer.country, influencer.province, influencer.city].filter(Boolean).join(' ')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/influencers/${influencerId}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                编辑信息
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}