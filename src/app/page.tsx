'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('A4');
  const [margins, setMargins] = useState({
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm'
  });
  const [customCss, setCustomCss] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('请输入研究内容');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          options: {
            format,
            margin: margins,
            customCss,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成PDF失败');
      }

      // 获取PDF并下载
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'research-document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || '生成PDF时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setFormat('A4');
    setMargins({
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    });
    setCustomCss('');
    setError('');
    formRef.current?.reset();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
      <header className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">DeepResearchify</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">将您的研究内容转换为专业PDF文档</p>
      </header>

      <main className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              研究内容 (支持HTML标记)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="在此输入或粘贴您的研究内容..."
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    页面格式
                  </label>
                  <select
                    id="format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    页面边距
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="margin-top" className="block text-xs text-gray-500 dark:text-gray-400">
                        上
                      </label>
                      <input
                        id="margin-top"
                        type="text"
                        value={margins.top}
                        onChange={(e) => setMargins({ ...margins, top: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="margin-right" className="block text-xs text-gray-500 dark:text-gray-400">
                        右
                      </label>
                      <input
                        id="margin-right"
                        type="text"
                        value={margins.right}
                        onChange={(e) => setMargins({ ...margins, right: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="margin-bottom" className="block text-xs text-gray-500 dark:text-gray-400">
                        下
                      </label>
                      <input
                        id="margin-bottom"
                        type="text"
                        value={margins.bottom}
                        onChange={(e) => setMargins({ ...margins, bottom: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="margin-left" className="block text-xs text-gray-500 dark:text-gray-400">
                        左
                      </label>
                      <input
                        id="margin-left"
                        type="text"
                        value={margins.left}
                        onChange={(e) => setMargins({ ...margins, left: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="custom-css" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    自定义CSS
                  </label>
                  <textarea
                    id="custom-css"
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    placeholder="body { font-family: 'Times New Roman', serif; }"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              重置
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? '生成中...' : '生成PDF'}
            </button>
          </div>
        </form>
      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} DeepResearchify - 高效研究文档转换工具</p>
      </footer>
    </div>
  );
}
