import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';


/**
 * 处理PDF生成的API路由
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const { html, title } = await request.json();
    
    if (!html || !title) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-features=site-per-process', // 帮助处理iframe内容
      ],
    });
    
    // 创建新页面
    const page = await browser.newPage();
    
    // 设置视口大小，确保足够大以容纳所有内容
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2, // 提高图像质量
    });
    
    // 设置页面内容，并等待所有资源加载完成
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
      timeout: 30000, // 增加超时时间，确保图片加载完成
    });
    
    // 等待一小段时间，确保所有内容都已渲染
    // 使用Promise和setTimeout替代page.waitForTimeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 设置PDF选项
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm',
      },
      printBackground: true, // 打印背景颜色和图片
      displayHeaderFooter: false,
      preferCSSPageSize: true, // 优先使用CSS定义的页面大小
    });
    
    // 关闭浏览器
    await browser.close();
    
    // 返回PDF数据
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF生成错误:', error);
    return NextResponse.json(
      { error: `PDF生成失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}