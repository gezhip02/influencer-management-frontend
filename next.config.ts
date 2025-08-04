import type { NextConfig } from "next";



// module.exports = {
//   // 关键配置：启用 standalone 模式
//   output: 'standalone',
//   // 可选：指定静态资源输出目录（若有自定义需求）
//   // 不配置则默认输出到 .next/static
//   // assetPrefix: '/_next/', 
// };

// const nextConfig: NextConfig = {
//   // 配置API代理以解决跨域问题
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:8080/api/:path*',
//       },
//     ];
//   },
  
//   // 开发环境下的额外配置
//   ...(process.env.NODE_ENV === 'development' && {
//     experimental: {
//       // 启用并发功能（可选）
//     },
//   }),
// };


const nextConfig: NextConfig = {
  // 只在明确需要静态导出时启用
  ...(process.env.STATIC_EXPORT === 'true' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true
    }
  }),
  
  // 开发环境使用 rewrites，生产环境通过 Nginx 代理
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
      ];
    },
  }),
};

export default nextConfig;

