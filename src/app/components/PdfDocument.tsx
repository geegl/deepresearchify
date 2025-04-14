'use client';

import MarkdownRenderer from './MarkdownRenderer';

interface PdfDocumentProps {
  title: string;
  content: string;
}

/**
 * PDF文档组件，专门用于生成PDF时的样式和布局
 */
export default function PdfDocument({ title, content }: PdfDocumentProps) {
  return (
    <div className="pdf-document">
      <style jsx global>{`
        .pdf-document {
          font-family: 'Times New Roman', serif;
          padding: 0;
          margin: 0;
          color: #000;
        }
        .pdf-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
        }
        .pdf-content h1 {
          font-size: 20px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .pdf-content h2 {
          font-size: 18px;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .pdf-content p {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        .pdf-content ul, .pdf-content ol {
          margin-bottom: 10px;
        }
        /* 修改链接样式，确保在PDF中高亮显示 */
        .pdf-content a, .pdf-link {
          color: #0066cc !important;
          text-decoration: underline !important;
        }
        /* 表格样式 */
        .pdf-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .pdf-content th, .pdf-content td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        .pdf-content th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        /* 图片样式 */
        .pdf-content img {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
        }
        .references {
          margin-top: 20px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        .references a {
          word-break: break-all;
          color: #0066cc !important;
          text-decoration: underline !important;
        }
      `}</style>
      
      <div className="pdf-title">
        {title}
      </div>
      
      <div className="pdf-content">
        <MarkdownRenderer markdown={content} />
      </div>
    </div>
  );
}