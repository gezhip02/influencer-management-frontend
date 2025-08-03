import type { NextConfig } from "next";



// module.exports = {
//   // 关键配置：启用 standalone 模式
//   output: 'standalone',
//   // 可选：指定静态资源输出目录（若有自定义需求）
//   // 不配置则默认输出到 .next/static
//   // assetPrefix: '/_next/', 
// };

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

