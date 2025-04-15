import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 动态导入以减小包体积
let puppeteer: any;
let chromium: any;

// 缓存目录
const CACHE_DIR = path.join(process.cwd(), '.pdf-cache');

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 生成缓存键
function generateCacheKey(content: string, options: any): string {
  const data = JSON.stringify({ content, options });
  return crypto.createHash('md5').update(data).digest('hex');
}

// 检查缓存
function checkCache(cacheKey: string): string | null {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.pdf`);
  if (fs.existsSync(cachePath)) {
    // 获取文件的创建时间
    const stats = fs.statSync(cachePath);
    const fileAge = Date.now() - stats.mtimeMs;
    
    // 缓存有效期为1小时
    const CACHE_TTL = 60 * 60 * 1000; // 1小时，单位毫秒
    
    if (fileAge < CACHE_TTL) {
      return cachePath;
    }
  }
  return null;
}

// 保存到缓存
function saveToCache(cacheKey: string, pdfBuffer: Buffer): string {
  const cachePath = path.join(CACHE_DIR, `${cacheKey}.pdf`);
  fs.writeFileSync(cachePath, pdfBuffer);
  return cachePath;
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const { content, options = {} } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }
    
    // 生成缓存键
    const cacheKey = generateCacheKey(content, options);
    
    // 检查缓存
    const cachedPdfPath = checkCache(cacheKey);
    if (cachedPdfPath) {
      const pdfBuffer = fs.readFileSync(cachedPdfPath);
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="document.pdf"'
        }
      });
    }
    
    // 动态导入puppeteer和chrome-aws-lambda
    // 仅在需要时加载，减少冷启动时间
    if (!puppeteer || !chromium) {
      // 在Vercel等Serverless环境中使用chrome-aws-lambda
      if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        chromium = await import('chrome-aws-lambda');
        puppeteer = (await import('puppeteer-core')).default;
      } else {
        // 在开发环境中使用完整的puppeteer
        puppeteer = (await import('puppeteer')).default;
      }
    }
    
    // 浏览器启动选项 - 针对Serverless环境优化
    const browserOptions: any = {
      args: chromium ? chromium.args : [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      headless: true,
      ignoreHTTPSErrors: true
    };
    
    // 在Serverless环境中使用chrome-aws-lambda提供的Chrome
    if (chromium) {
      browserOptions.executablePath = await chromium.executablePath;
    }
    
    // 启动浏览器
    const browser = await puppeteer.launch(browserOptions);
    
    try {
      // 创建新页面
      const page = await browser.newPage();
      
      // 设置页面内容
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Research Document</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 2cm;
              color: #333;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #000;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            h1 { font-size: 24pt; }
            h2 { font-size: 20pt; }
            h3 { font-size: 16pt; }
            p { margin-bottom: 1em; }
            pre {
              background-color: #f5f5f5;
              padding: 1em;
              border-radius: 5px;
              overflow-x: auto;
            }
            code {
              font-family: monospace;
              background-color: #f5f5f5;
              padding: 2px 4px;
              border-radius: 3px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 1em;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @page {
              margin: 1cm;
            }
            /* 应用用户自定义样式 */
            ${options.customCss || ''}
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      
      // 生成PDF
      const pdfOptions = {
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        },
        preferCSSPageSize: true,
        ...options.pdfOptions
      };
      
      const pdfBuffer = await page.pdf(pdfOptions);
      
      // 保存到缓存
      saveToCache(cacheKey, pdfBuffer);
      
      // 返回PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="document.pdf"'
        }
      });
    } finally {
      // 确保浏览器关闭，释放资源
      await browser.close();
    }
  } catch (error) {
    console.error('PDF生成错误:', error);
    return NextResponse.json(
      { error: '生成PDF时出错', details: error.message },
      { status: 500 }
    );
  }
}