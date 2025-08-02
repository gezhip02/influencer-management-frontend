import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavigationProvider } from '@/components/navigation-provider';
import { AuthProvider } from '@/components/auth-provider';
import '@/mocks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '达人打标管理系统 - Influencer Management System',
  description: '智能管理 TikTok、抖音、快手、视频号等平台达人资源，提供精准标签匹配和合作流程跟踪',
  keywords: ['influencer', 'tiktok', 'management', 'marking', 'cooperation'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}