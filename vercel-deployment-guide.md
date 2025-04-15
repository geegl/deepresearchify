# Vercel 部署指南

## 配置问题解决

如果您在部署时遇到以下错误：
```
The `functions` property cannot be used in conjunction with the `builds` property. Please remove one of them.
```

这是因为在 `vercel.json` 文件中同时使用了 `functions` 和 `builds` 属性，这两个是互斥的。解决方法是修改 `vercel.json` 文件，删除其中一个属性（推荐保留 `functions`）。

## Vercel 左侧菜单设置指南

### 1. General
- 项目名称和描述可以根据需要设置

### 2. Build and Deployment
- **Framework Preset**: 确保设置为 `Next.js`
- **Build Command**: 使用默认的 `next build`
- **Output Directory**: 使用默认的 `.next`
- **Install Command**: 使用默认的 `npm install`

### 3. Environment Variables
添加以下环境变量：
- `NODE_ENV`: `production`
- 其他项目所需的环境变量

### 4. Functions
由于项目使用 Puppeteer 生成 PDF，需要增加函数的内存限制：
- 找到 `api/generate-pdf` 函数
- 设置 **Memory** 为 `3008MB`（最大值）
- 设置 **Maximum Execution Duration** 为 `60s`

### 5. Domains
- 如需自定义域名，可在此处添加

### 6. Git
- 确保正确连接到您的 Git 仓库

### 7. Deployment Protection
- 根据需要设置部署保护

### 8. Data Cache
- 对于频繁生成的 PDF，建议启用缓存

### 9. Cron Jobs
- 如需定期清理缓存，可设置定时任务

## 优化建议

1. **使用 chrome-aws-lambda**：确保项目使用 `chrome-aws-lambda` 和 `puppeteer-core` 而不是完整的 Puppeteer

2. **内存优化**：在 Puppeteer 启动选项中添加以下参数：
```javascript
const browser = await puppeteer.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  headless: true
});
```

3. **缓存机制**：实现 PDF 生成结果的缓存，避免重复生成相同内容

4. **超时处理**：添加适当的超时处理，防止长时间运行的函数被终止

## 部署后检查

部署完成后，请检查：

1. PDF 生成功能是否正常工作
2. 内存使用是否在限制范围内
3. 响应时间是否在可接受范围内

如有问题，请查看 Vercel 的日志和监控面板进行排查。