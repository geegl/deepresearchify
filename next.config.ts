import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 输出独立构建，优化Vercel部署
  output: 'standalone',
  
  // 配置Puppeteer相关的优化
  experimental: {
    // 允许更大的响应体积，用于PDF生成
    largePageDataBytes: 128 * 1024 * 1024,
  },
  
  // 配置缓存策略
  headers: async () => [
    {
      source: '/api/generate-pdf',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, max-age=0',
        },
      ],
    },
  ],
};

export default nextConfig;
