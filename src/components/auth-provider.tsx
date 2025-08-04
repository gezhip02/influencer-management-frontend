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

// 检查路径是否为公开页面（考虑尾部斜杠）
const isPublicPath = (path: string) => {
  const normalizedPath = path.replace(/\/$/, ''); // 移除尾部斜杠
  return PUBLIC_PATHS.includes(normalizedPath) || PUBLIC_PATHS.includes(path);
};

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 根据当前路径决定初始加载状态 - 关键修复
  const isInitiallyPublic = isPublicPath(pathname);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(!isInitiallyPublic); // 公开页面初始不加载
  const [hasError, setHasError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // 如果是公开页面，直接不加载
    if (isPublicPath(pathname)) {
      setIsLoading(false);
      return;
    }

    const checkAuth = () => {
      try {
        console.log('🔍 AuthProvider checkAuth:', { pathname, isPublic: isPublicPath(pathname) });
        
        // 重置错误状态
        setHasError(false);

        // 检查是否已认证
        const authenticated = authService.isAuthenticated();
        console.log('🔍 认证状态:', authenticated);
        
        setIsAuthenticated(authenticated);
        setIsLoading(false);

        // 防止重复重定向
        if (isRedirecting) {
          console.log('🔄 已在重定向中，跳过');
          return;
        }

        // 如果已认证且在登录页面，重定向到首页
        if (authenticated && (pathname === '/login' || pathname === '/login/')) {
          console.log('🔄 已认证用户访问登录页，重定向到首页');
          setIsRedirecting(true);
          router.replace('/');
          return;
        }

        // 如果未认证且当前页面不在公开页面列表中，重定向到登录页
        if (!authenticated && !isPublicPath(pathname)) {
          console.log('🔄 未认证用户访问受保护页面，重定向到登录页');
          setIsRedirecting(true);
          router.replace('/login');
          return;
        }

        console.log('✅ 认证检查完成，无需重定向');
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setHasError(true);
        setIsLoading(false);
        
        // 出错时，如果不在公开页面，跳转到登录页
        if (!isPublicPath(pathname) && !isRedirecting) {
          setIsRedirecting(true);
          router.replace('/login');
        }
      }
    };

    // 确保在客户端环境下执行
    if (typeof window === 'undefined') {
      console.log('🔍 服务端环境，跳过认证检查');
      return;
    }

    // 延迟检查认证，确保客户端完全水合
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);

    // 监听token变化（比如其他标签页登录/退出）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        console.log('🔄 Token变化，重新检查认证');
        setIsRedirecting(false); // 重置重定向状态
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router, isRedirecting]);

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  console.log('🎨 AuthProvider render:', { pathname, isLoading, isAuthenticated, hasError, isPublic: isPublicPath(pathname) });

  // 对于公开页面，直接渲染子组件 - 提前返回避免加载状态
  if (isPublicPath(pathname)) {
    return (
      <AuthContext.Provider value={{ isAuthenticated, isLoading: false, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

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

  // 如果有错误，显示错误信息
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">系统初始化失败，请刷新页面重试</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  // 如果未认证且不在公开页面，显示重定向提示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  // 认证通过，渲染子组件
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 