"use client"

import { useState, useRef } from "react";
import Image from "next/image";
import MarkdownRenderer, { parseMarkdown } from "./components/MarkdownRenderer";
import DocumentPreview from "./components/DocumentPreview";
import PdfDocument from "./components/PdfDocument";
import { generatePDF, downloadPDF } from "./services/pdfService";
import ReactDOMServer from "react-dom/server";
import "./components/textarea.css";

export default function Home() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // 文本内容是预设的，不需要处理变化

  // 处理标题输入变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // 移除模板应用功能

  // 切换预览模式
  const togglePreview = () => {
    // 如果标题为空，尝试自动生成标题
    if (!title && text.trim()) {
      const generatedTitle = generateSummaryTitle(text);
      setTitle(generatedTitle);
    }
    setShowPreview(!showPreview);
  };

  // 自动总结标题函数
  const generateSummaryTitle = (content: string): string => {
    if (!content.trim()) return "研究笔记";
    
    // 查找第一个标题（# 开头的行）
    const titleMatch = content.match(/^# (.+)$/m);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    
    // 如果没有找到标题，尝试提取第一段非空内容作为标题
    const firstParagraph = content.split('\n').find(line => line.trim().length > 0);
    if (firstParagraph) {
      // 限制标题长度，避免过长
      const summary = firstParagraph.replace(/[#*_\[\]()]/g, '').trim();
      return summary.length > 50 ? summary.substring(0, 47) + '...' : summary;
    }
    
    return "研究笔记";
  };
  
  // 生成PDF文档
  const handleGeneratePDF = async () => {
    if (!text.trim()) {
      alert("请先输入一些文本内容");
      return;
    }
    
    // 如果标题为空，尝试自动总结标题
    let pdfTitle = title;
    if (!title.trim()) {
      pdfTitle = generateSummaryTitle(text);
      // 更新标题输入框
      setTitle(pdfTitle);
    }
    
    // 添加确认对话框
    const confirmMessage = `确认导出PDF？\n\n标题: ${pdfTitle}`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsGenerating(true);

    try {
      // 使用PdfDocument组件渲染PDF内容
      let renderedContent;
      try {
        // 先尝试渲染PdfDocument组件
        renderedContent = ReactDOMServer.renderToString(<PdfDocument title={pdfTitle} content={text} />);
        console.log('组件渲染成功，长度:', renderedContent.length);
      } catch (renderError) {
        console.error('组件渲染失败:', renderError);
        // 如果渲染失败，使用简单的HTML替代
        renderedContent = `
          <div class="pdf-document">
            <h1 class="pdf-title">${pdfTitle}</h1>
            <div class="pdf-content">${text}</div>
          </div>
        `;
      }
      
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${pdfTitle}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
            }
            /* 确保图片能够正确显示 */
            img {
              max-width: 100%;
              height: auto;
            }
            /* 确保链接高亮显示 */
            a, .pdf-link {
              color: #0066cc !important;
              text-decoration: underline !important;
            }
            /* 表格样式 */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div id="pdf-root">${renderedContent}</div>
        </body>
        </html>
      `;

      // 检查参数是否有效
      if (!pdfContent || !pdfTitle) {
        console.error('PDF生成参数无效:', { contentLength: pdfContent?.length, title: pdfTitle });
        throw new Error('缺少必要参数：HTML内容或标题不能为空');
      }
      
      console.log('准备生成PDF，参数:', { 
        contentLength: pdfContent.length, 
        title: pdfTitle,
        hasReactContent: pdfContent.includes('pdf-root')
      });
      
      // 使用Puppeteer生成PDF
      const pdfBlob = await generatePDF(pdfContent, pdfTitle);
      
      // 下载PDF文件
      downloadPDF(pdfBlob, `${pdfTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.pdf`);
      
      setIsGenerating(false);
    } catch (error) {
      console.error("生成PDF时出错:", error);
      alert("生成PDF时出错: " + (error instanceof Error ? error.message : String(error)));
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">DeepResearchify</h1>
        <div className="flex gap-2">
          <button
            onClick={togglePreview}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors mr-2"
          >
            {showPreview ? "编辑模式" : "预览模式"}
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "生成中..." : "导出为PDF"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        {!showPreview ? (
          <>
            <div className="w-full">
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                标题
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入文档标题"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="content" className="block text-sm font-medium">
                    内容
                  </label>
                  <span className="text-xs text-gray-500">支持 Markdown 格式</span>
                </div>
                <textarea
                  ref={textAreaRef}
                  id="content"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-[calc(100vh-250px)] p-4 border border-gray-300 rounded-md overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 font-[family-name:var(--font-geist-mono)] whitespace-pre-line"
                  placeholder="# 您的研究标题

## 引言
在此处开始输入您的研究内容。此编辑器支持Markdown格式。

## 方法
您可以使用**粗体**和*斜体*文本。

## 结果
- 创建项目符号
- 添加[链接](https://example.com)

## 结论
在此总结您的发现。

## 参考文献
1. https://example.com/reference1
2. https://example.com/reference2"
                />
              </div>
              
              <div className="w-64 self-start sticky top-6">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-lg font-medium mb-2">预览</h3>
                  <button
                    onClick={togglePreview}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    {showPreview ? "返回" : "查看预览"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="print-container">
            <DocumentPreview title={title} content={text} />
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500 no-print">
        <p>© {new Date().getFullYear()} DeepResearchify - 将您的研究笔记转换为专业PDF</p>
      </footer>
    </div>
  );
}
