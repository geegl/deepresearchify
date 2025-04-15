# DeepResearchify

将您的深度研究结果转换为PDF文档的高效工具

## 项目介绍

DeepResearchify是一个基于Next.js的Web应用，专为研究人员、学者和学生设计，能够将研究内容快速转换为专业的PDF文档。本工具使用优化的Puppeteer配置，即使在Serverless环境下也能高效运行，并实现了高效的缓存机制以提升性能。

## 技术栈

- **前端框架**: Next.js 15.3.0
- **UI**: Tailwind CSS 4
- **PDF生成**: puppeteer-core + chrome-aws-lambda
- **缓存系统**: Redis/本地文件缓存

## 优化特性

- **轻量级Puppeteer配置**: 使用puppeteer-core和chrome-aws-lambda减小包体积
- **内存优化**: 特别配置的Chrome启动参数，减少内存占用
- **智能缓存**: 避免重复生成相同内容的PDF
- **静态资源优化**: 压缩和优化前端资源，提高加载速度
- **Serverless友好**: 针对Serverless环境的特殊优化

## 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/deepresearchify.git
cd deepresearchify

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 使用方法

1. 在主页输入或粘贴您的研究内容
2. 选择所需的格式选项和样式
3. 点击"生成PDF"按钮
4. 下载生成的PDF文档

## 部署

### Vercel部署

推荐使用Vercel进行部署，只需点击下方按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgeegl%2Fdeepresearchify)

#### Vercel环境变量配置

在Vercel部署时，请确保设置以下环境变量：

- `NODE_ENV`: `production`
- `NEXT_PUBLIC_API_URL`: 您的API基础URL（可选）

### 其他平台

确保您的部署环境支持Puppeteer和Chrome的运行。对于Serverless环境，请参考项目中的优化配置。

### 缓存配置

本项目使用文件系统缓存来优化PDF生成性能。缓存配置可在`src/app/utils/cache.ts`中调整：

```typescript
// 缓存配置
const CACHE_CONFIG = {
  // 缓存目录
  CACHE_DIR: path.join(process.cwd(), '.pdf-cache'),
  // 缓存有效期（毫秒）
  CACHE_TTL: 60 * 60 * 1000, // 1小时
  // 最大缓存文件数
  MAX_CACHE_FILES: 100,
};
```

在Serverless环境中，建议使用临时目录作为缓存目录，以避免文件系统限制。

## 贡献

欢迎提交Pull Request或创建Issue来帮助改进这个项目。

## 许可

MIT
