import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 配置API代理以解决跨域问题
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  
  // 开发环境下的额外配置
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      // 启用并发功能（可选）
    },
  }),
};

export default nextConfig;
