# DeepResearchify 部署指南

本文档提供了将 DeepResearchify 项目同步到 GitHub 并部署到 Vercel 的详细步骤。

## GitHub 同步

如果您尚未将项目推送到 GitHub，请按照以下步骤操作：

```bash
# 如果尚未初始化 Git 仓库
git init

# 添加所有文件到暂存区
git add .

# 提交更改
git commit -m "初始化 DeepResearchify 项目"

# 添加远程仓库（替换为您的 GitHub 仓库 URL）
git remote add origin https://github.com/yourusername/deepresearchify.git

# 推送到主分支
git push -u origin main
```

如果您已经有 GitHub 仓库，并需要更新本地更改：

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "更新项目配置和优化"

# 推送到远程仓库
git push
```

## Vercel 部署

### 方法一：使用 Vercel 部署按钮

最简单的方法是使用 README 中的 Vercel 部署按钮：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Froveneleven%2Fdeepresearchify)

### 方法二：手动部署

1. 登录 [Vercel 平台](https://vercel.com/)
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置项目设置

### 环境变量配置

在 Vercel 项目设置中，添加以下环境变量：

- `NODE_ENV`: `production`
- `NEXT_PUBLIC_API_URL`: 您的 API 基础 URL（可选）

### Puppeteer 优化配置

由于项目使用 Puppeteer 生成 PDF，需要在 Vercel 中进行特殊配置：

1. 在项目设置中，找到 "Build & Development Settings" 部分
2. 确保 "Framework Preset" 设置为 "Next.js"
3. 在 "Build Command" 中使用默认的 `next build`

### 高级配置

为了优化 Puppeteer 在 Serverless 环境中的性能，Vercel 项目已经配置了以下优化：

1. **使用 `standalone` 输出模式**：在 `next.config.ts` 中已配置 `output: 'standalone'`，这有助于减少部署大小并提高性能。

2. **配置较大的响应体积**：通过 `largePageDataBytes` 配置，允许生成较大的 PDF 文件。

3. **使用 `chrome-aws-lambda`**：项目依赖中包含了 `chrome-aws-lambda`，这是专为 AWS Lambda 和 Vercel 等 Serverless 环境优化的 Chromium 版本。

## 部署后验证

部署完成后，请访问您的 Vercel 应用 URL 并测试以下功能：

1. 页面正常加载
2. PDF 生成功能正常工作
3. 响应时间在可接受范围内

如果遇到问题，请检查 Vercel 的构建和运行日志以获取更多信息。

## 故障排除

### 常见问题

1. **PDF 生成失败**：检查 Puppeteer 是否正确配置，可能需要调整内存限制或超时设置。

2. **构建失败**：确保所有依赖项都正确安装，并且 `next.config.ts` 配置正确。

3. **性能问题**：考虑使用 Vercel 的缓存功能，或者优化 PDF 生成逻辑。

### 获取帮助

如果您遇到其他问题，请查阅：

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Puppeteer 文档](https://pptr.dev/)
- 项目 GitHub 仓库的 Issues 部分