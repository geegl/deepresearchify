'use client';

import MarkdownRenderer from './MarkdownRenderer';

interface DocumentPreviewProps {
  title: string;
  content: string;
}

export default function DocumentPreview({ title, content }: DocumentPreviewProps) {
  return (
    <div className="document-preview bg-white p-8 shadow-md rounded-md max-w-4xl mx-auto">
      <div className="document-title text-center text-2xl font-bold mb-8">
        {title}
      </div>
      
      <div className="document-content">
        <MarkdownRenderer markdown={content} />
      </div>
      
      {/* 如果内容中包含References部分，可以特殊处理 */}
      {content.includes('## References') && (
        <div className="references mt-8 pt-4 border-t border-gray-200">
          {/* References部分已经由MarkdownRenderer处理 */}
        </div>
      )}
    </div>
  );
}