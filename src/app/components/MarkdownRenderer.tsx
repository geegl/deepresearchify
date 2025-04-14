'use client';

interface MarkdownRendererProps {
  markdown: string;
}

// 增强的Markdown解析函数
export function parseMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  // 处理标题 (# Heading)
  let html = markdown.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold my-3">$1</h2>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold my-2">$1</h4>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-sm font-bold my-1">$1</h5>');
  
  // 处理粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 处理空链接 [](url) - 只显示域名
  html = html.replace(/\[\s*\]\((.+?)\)/g, (match, url) => {
    try {
      // 确保URL格式正确
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      // 返回格式化的链接，只显示域名
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${domain}</a>`;
    } catch (e) {
      // 如果URL格式不正确，仍然创建链接但使用完整URL作为显示文本
      return `<a href="${url}">${url}</a>`;
    }
  });
  
  // 处理Markdown格式的链接 [text](url) - 保留原始文本
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, (match, text, url) => {
    try {
      // 确保URL格式正确
      const urlObj = new URL(url);
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    } catch (e) {
      // 如果URL格式不正确，仍然创建链接但不添加target和rel属性
      return `<a href="${url}">${text}</a>`;
    }
  });
  
  // 标记已处理的URL，避免重复处理
  const processedUrls = new Set();
  
  // 处理References部分的URL - 只显示一级域名
  // 使用更精确的正则表达式匹配参考文献中的URL
  html = html.replace(/(^\d+\.\s)(https?:\/\/\S+)(?![^<]*<\/a>)/gm, (match, prefix, url) => {
    // 如果URL已经处理过，直接返回原始匹配
    if (processedUrls.has(url)) return match;
    
    // 标记URL为已处理
    processedUrls.add(url);
    
    try {
      // 确保URL格式正确并提取域名
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      // 返回格式化的链接，只显示域名
      return `${prefix}<a href="${url}" target="_blank" rel="noopener noreferrer">${domain}</a>`;
    } catch (e) {
      // 如果URL格式不正确，仍然创建链接但使用完整URL作为显示文本
      return `${prefix}<a href="${url}">${url}</a>`;
    }
  });
  
  // 处理正文中的纯URL文本
  // 使用更严格的正则表达式，确保不会匹配已在标签内的URL
  const standaloneUrlRegex = /(?<!\[.*?\]\(|<a[^>]*|="|=')((https?:\/\/)([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)))(?![^<]*?<\/a>|\))/g;
  
  html = html.replace(standaloneUrlRegex, (match, fullUrl) => {
    // 如果URL已经处理过，直接返回原始匹配
    if (processedUrls.has(fullUrl)) return match;
    
    // 标记URL为已处理
    processedUrls.add(fullUrl);
    
    try {
      // 确保URL格式正确并提取域名
      const urlObj = new URL(fullUrl);
      const domainText = urlObj.hostname;
      // 返回格式化的链接，只显示域名
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${domainText}</a>`;
    } catch (e) {
      // 如果URL格式不正确，保持原样
      return match;
    }
  });
  
  // 清理嵌套链接问题 - 更彻底的处理
  // 步骤1: 处理完全嵌套的链接 - 例如 <a><a>text</a></a>
  html = html.replace(/<a[^>]*>\s*(<a[^>]*>[^<]*<\/a>)\s*<\/a>/g, (match, innerLink) => {
    // 只保留内部链接
    return innerLink;
  });
  
  // 步骤2: 处理部分嵌套的链接 - 例如 <a>text1<a>text2</a>text3</a>
  html = html.replace(/<a[^>]*>([^<]*<a[^>]*>[^<]*<\/a>[^<]*)<\/a>/g, (match, content) => {
    // 如果发现嵌套链接，只保留内部内容
    return content;
  });
  
  // 步骤3: 处理更复杂的嵌套情况
  html = html.replace(/<a[^>]*>([^<]*(?:<(?!\/a)[^>]*>[^<]*)*<a[^>]*>[^<]*<\/a>(?:[^<]*(?:<(?!\/a)[^>]*>[^<]*)*)*)<\/a>/g, (match, content) => {
    // 处理复杂嵌套，保留内容
    return content;
  });
  
  // 标准化所有链接格式
  // 步骤1: 首先确保所有链接都有一致的基本属性格式
  html = html.replace(/<a\s+([^>]*)href="([^"]+)"([^>]*)>([^<]+)<\/a>/g, (match, prefix, url, suffix, text) => {
    // 对于外部链接添加target和rel属性
    if (url.startsWith('http')) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return `<a href="${url}">${text}</a>`;
  });
  
  // 步骤2: 再次检查并修复任何可能的格式问题
  html = html.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, (match, url, text) => {
    // 对于外部链接添加target和rel属性
    if (url.startsWith('http')) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return `<a href="${url}">${text}</a>`;
  });
  
  // 步骤3: 最后一次清理，确保没有任何HTML属性残留或格式不一致
  html = html.replace(/<a\s+([^>]*)href="([^"]+)"([^>]*)>([^<]+)<\/a>/g, (match, prefix, url, suffix, text) => {
    if (url.startsWith('http')) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    return `<a href="${url}">${text}</a>`;
  });
  
  // 处理图片 ![alt](url)
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="my-4 max-w-full" />');
  
  // 处理表格 - 简单表格格式支持
  // 表格头部: | Header1 | Header2 |
  // 表格分隔: | ------- | ------- |
  // 表格内容: | Cell1   | Cell2   |
  const tableRegex = /^\|(.+)\|\r?\n\|\s*[-:\s]+[-|\s:]*\r?\n((\|.+\|\r?\n)+)/gm;
  html = html.replace(tableRegex, function(match, headerRow, bodyRows) {
    // 处理表头
    const headers = headerRow.split('|').map(header => header.trim()).filter(Boolean);
    const headerHtml = headers.map(header => `<th class="border px-4 py-2">${header}</th>`).join('');
    
    // 处理表格内容
    const rows = bodyRows.trim().split('\n');
    let bodyHtml = '';
    
    rows.forEach(row => {
      const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
      const cellsHtml = cells.map(cell => `<td class="border px-4 py-2">${cell}</td>`).join('');
      bodyHtml += `<tr>${cellsHtml}</tr>`;
    });
    
    return `<table class="min-w-full my-4 border-collapse border"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
  });
  
  // 处理列表
  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>');
  // 有序列表
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-5 list-decimal">$1</li>');
  
  // 处理水平分隔线 (---)
  html = html.replace(/^-{3,}$/gm, '<hr class="my-4 border-t border-gray-300" />');
  
  // 处理段落
  html = html.replace(/^(?!<[htli])(.+)$/gm, function(match) {
    if (match.trim() === '') return '';
    if (match.startsWith('<li') || match.startsWith('<table') || match.startsWith('<hr')) return match; // 不处理已经是列表项、表格或水平线的行
    return `<p class="my-2">${match}</p>`;
  });
  
  // 处理换行
  html = html.replace(/\n\n/g, '<br />');
  
  // 将连续的列表项包装在ul或ol中
  html = html.replace(/(<li class="ml-5 list-disc">.*?<\/li>\s*)+/g, '<ul class="my-2">$&</ul>');
  html = html.replace(/(<li class="ml-5 list-decimal">.*?<\/li>\s*)+/g, '<ol class="my-2">$&</ol>');
  
  return html;
}

export default function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div 
      className="markdown-preview prose max-w-none" 
      dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
    />
  );
}