'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// 不需要认证的页面路径
const PUBLIC_PATHS = ['/login', '/register'];

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // 如果未认证且当前页面不在公开页面列表中，重定向到登录页
      if (!authenticated && !PUBLIC_PATHS.includes(pathname)) {
        router.push('/login');
        return;
      }

      // 如果已认证且在登录页面，重定向到首页
      if (authenticated && pathname === '/login') {
        router.push('/');
        return;
      }
    };

    // 初始检查
    checkAuth();

    // 监听token变化（比如其他标签页登录/退出）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router]);

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  // 在加载状态时显示加载页面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">系统初始化中...</p>
        </div>
      </div>
    );
  }

  // 如果在公开页面，直接渲染子组件
  if (PUBLIC_PATHS.includes(pathname)) {
    return (
      <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // 如果未认证且不在公开页面，不渲染任何内容（重定向会处理）
  if (!isAuthenticated) {
    return null;
  }

  // 认证通过，渲染子组件
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 