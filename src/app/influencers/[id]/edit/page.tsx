'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { influencerService } from '@/services';
import type { InfluencerSaveRequest } from '@/types';

export default function EditInfluencerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState<InfluencerSaveRequest>({
    id: 0,
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
    risk_level: 0,
    remark: '',
    tags: '',
  });

  const influencerId = params.id as string;

  useEffect(() => {
    if (influencerId) {
      loadInfluencer();
    }
  }, [influencerId]);

  const loadInfluencer = async () => {
    try {
      setPageLoading(true);
      const influencer = await influencerService.getInfluencerInfo(Number(influencerId));
      
      setFormData({
        id: influencer.id,
        platform_id: influencer.platform_id,
        platform_user_id: influencer.platform_user_id,
        nickname: influencer.nickname || '',
        avatar: influencer.avatar || '',
        introduction: influencer.introduction || '',
        display_name: influencer.display_name,
        sex: influencer.sex,
        age: influencer.age || '',
        type: influencer.type,
        phone: influencer.phone || '',
        email: influencer.email || '',
        whatsapp: influencer.whatsapp || '',
        weixin: influencer.weixin || '',
        telegram: influencer.telegram || '',
        country: influencer.country || '',
        province: influencer.province || '',
        city: influencer.city || '',
        fans_count: influencer.fans_count,
        follow_count: influencer.follow_count || 0,
        video_count: influencer.video_count || 0,
        average_play_count: influencer.average_play_count || 0,
        interaction_rate: influencer.interaction_rate || 0,
        quality_score: influencer.quality_score || 0,
        risk_level: influencer.risk_level || 0,
        remark: influencer.remark || '',
        tags: influencer.tags || '',
      });
    } catch (error) {
      console.error('加载达人信息失败:', error);
      alert('加载达人信息失败：' + (error as Error).message);
      router.push('/influencers');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.display_name.trim()) {
      alert('请输入显示名称');
      return;
    }

    if (!formData.platform_user_id.trim()) {
      alert('请输入平台用户ID');
      return;
    }

    setLoading(true);
    try {
      await influencerService.updateInfluencer(formData.id!, formData);
      alert('达人信息更新成功');
      router.push(`/influencers/${influencerId}`);
    } catch (error) {
      console.error('更新达人信息失败:', error);
      alert('更新达人信息失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/influencers/${influencerId}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回达人详情
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">编辑达人</h1>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    显示名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => handleChange('display_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入显示名称"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    昵称
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入昵称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    平台用户ID *
                  </label>
                  <input
                    type="text"
                    value={formData.platform_user_id}
                    onChange={(e) => handleChange('platform_user_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入平台用户ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性别
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleChange('sex', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>未知</option>
                    <option value={1}>男</option>
                    <option value={2}>女</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年龄
                  </label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入年龄"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    达人类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>KOL</option>
                    <option value={2}>KOC</option>
                    <option value={3}>素人</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 联系方式 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">联系方式</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入邮箱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入手机号"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    微信
                  </label>
                  <input
                    type="text"
                    value={formData.weixin}
                    onChange={(e) => handleChange('weixin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入微信号"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入WhatsApp"
                  />
                </div>
              </div>
            </div>

            {/* 地理位置 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">地理位置</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    国家
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入国家"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    省份
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入省份"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    城市
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入城市"
                  />
                </div>
              </div>
            </div>

            {/* 社交数据 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">社交数据</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    粉丝数量
                  </label>
                  <input
                    type="number"
                    value={formData.fans_count}
                    onChange={(e) => handleChange('fans_count', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关注数量
                  </label>
                  <input
                    type="number"
                    value={formData.follow_count}
                    onChange={(e) => handleChange('follow_count', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频数量
                  </label>
                  <input
                    type="number"
                    value={formData.video_count}
                    onChange={(e) => handleChange('video_count', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    平均播放量
                  </label>
                  <input
                    type="number"
                    value={formData.average_play_count}
                    onChange={(e) => handleChange('average_play_count', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    互动率 (%)
                  </label>
                  <input
                    type="number"
                    value={formData.interaction_rate}
                    onChange={(e) => handleChange('interaction_rate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    质量评分
                  </label>
                  <input
                    type="number"
                    value={formData.quality_score}
                    onChange={(e) => handleChange('quality_score', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* 简介和备注 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">简介和备注</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    个人简介
                  </label>
                  <textarea
                    value={formData.introduction}
                    onChange={(e) => handleChange('introduction', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入个人简介"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注
                  </label>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => handleChange('remark', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入备注信息"
                  />
                </div>
              </div>
            </div>

            {/* 按钮区域 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href={`/influencers/${influencerId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    更新中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    更新达人
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 