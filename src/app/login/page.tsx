'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services';
import { LoginRequest } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'main' | 'sub'>('sub');
  const [formData, setFormData] = useState<LoginRequest>({
    account: '',
    password: '',
    company_id: 1,
    is_sub_user: true,
    main_user_account: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 验证必填字段
      if (!formData.password) {
        setError('请填写密码');
        return;
      }

      if (loginType === 'main') {
        // 主账号登录
        if (!formData.account) {
          setError('请填写主账号');
          return;
        }
        formData.is_sub_user = false;
        formData.main_user_account = '';
      } else {
        // 子账号登录
        if (!formData.account) {
          setError('请填写子账号');
          return;
        }
        if (!formData.main_user_account) {
          setError('请填写主账号');
          return;
        }
        formData.is_sub_user = true;
      }

      // 调用登录接口
      const response = await authService.login(formData);
      
      if (response.token) {
        // 登录成功，跳转到首页
        router.push('/');
      } else {
        setError('登录失败，请检查账号和密码');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError((err as Error)?.message || '登录失败，请检查账号和密码');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userType: 'main' | 'sub') => {
    if (userType === 'main') {
      setLoginType('main');
      setFormData({
        account: '1008611',
        password: 'admin',
        company_id: 1,
        is_sub_user: false,
        main_user_account: '',
      });
    } else {
      setLoginType('sub');
      setFormData({
        account: '1008622222',
        password: 'admin',
        company_id: 1,
        is_sub_user: true,
        main_user_account: '1008611',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-4 px-4 sm:py-6">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回首页
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            登录履约管理系统
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {loginType === 'main' ? '主账号登录' : '子账号登录'}
          </p>
        </div>

        {/* Quick Login Options */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-3">快速登录（测试用）：</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('sub')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                loginType === 'sub' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              子账号登录
            </button>
            <button
              onClick={() => quickLogin('main')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                loginType === 'main' 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              主账号登录
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loginType === 'sub' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  主账号 *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="请输入主账号"
                    value={formData.main_user_account}
                    onChange={(e) => setFormData(prev => ({ ...prev, main_user_account: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                {loginType === 'main' ? '主账号' : '子账号'} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder={`请输入${loginType === 'main' ? '主账号' : '子账号'}`}
                  value={formData.account}
                  onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                密码 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  登录
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>© 2024 履约管理系统. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
}