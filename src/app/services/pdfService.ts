'use client';

/**
 * 使用服务器端API生成PDF文档
 * @param html HTML内容
 * @param title 文档标题
 * @returns 生成的PDF文件的Blob对象
 */
export async function generatePDF(html: string, title: string): Promise<Blob> {
  try {
    // 调用API端点生成PDF
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html, title }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `服务器错误: ${response.status}`);
    }
    
    // 获取PDF数据并创建Blob对象
    const pdfBuffer = await response.arrayBuffer();
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  } catch (error) {
    console.error('PDF生成错误:', error);
    throw new Error(`PDF生成失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 下载PDF文件
 * @param pdfBlob PDF的Blob对象
 * @param fileName 文件名
 */
export function downloadPDF(pdfBlob: Blob, fileName: string): void {
  // 创建下载链接
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
  // 触发下载
  document.body.appendChild(a);
  a.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}