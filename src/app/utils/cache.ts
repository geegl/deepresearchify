/**
 * PDF缓存工具类
 * 用于优化PDF生成过程，减少重复生成相同内容的开销
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 缓存配置
const CACHE_CONFIG = {
  // 缓存目录 - 在Vercel环境中使用/tmp目录
  CACHE_DIR: process.env.VERCEL ? path.join('/tmp', '.pdf-cache') : path.join(process.cwd(), '.pdf-cache'),
  // 缓存有效期（毫秒）
  CACHE_TTL: 60 * 60 * 1000, // 1小时
  // 最大缓存文件数
  MAX_CACHE_FILES: 100,
};

// 确保缓存目录存在
if (!fs.existsSync(CACHE_CONFIG.CACHE_DIR)) {
  fs.mkdirSync(CACHE_CONFIG.CACHE_DIR, { recursive: true });
}

/**
 * 生成缓存键
 * @param content 内容
 * @param options 选项
 * @returns 缓存键
 */
export function generateCacheKey(content: string, options: any): string {
  const data = JSON.stringify({ content, options });
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * 检查缓存
 * @param cacheKey 缓存键
 * @returns 缓存路径或null
 */
export function checkCache(cacheKey: string): string | null {
  const cachePath = path.join(CACHE_CONFIG.CACHE_DIR, `${cacheKey}.pdf`);
  if (fs.existsSync(cachePath)) {
    // 获取文件的修改时间
    const stats = fs.statSync(cachePath);
    const fileAge = Date.now() - stats.mtimeMs;
    
    // 检查缓存是否过期
    if (fileAge < CACHE_CONFIG.CACHE_TTL) {
      return cachePath;
    }
  }
  return null;
}

/**
 * 保存到缓存
 * @param cacheKey 缓存键
 * @param pdfBuffer PDF缓冲区
 * @returns 缓存路径
 */
export function saveToCache(cacheKey: string, pdfBuffer: Buffer): string {
  const cachePath = path.join(CACHE_CONFIG.CACHE_DIR, `${cacheKey}.pdf`);
  fs.writeFileSync(cachePath, pdfBuffer);
  
  // 清理过期缓存
  cleanupCache();
  
  return cachePath;
}

/**
 * 清理过期缓存
 */
function cleanupCache(): void {
  try {
    const files = fs.readdirSync(CACHE_CONFIG.CACHE_DIR);
    
    // 如果缓存文件数量未超过限制，则不进行清理
    if (files.length <= CACHE_CONFIG.MAX_CACHE_FILES) {
      return;
    }
    
    // 获取所有缓存文件及其修改时间
    const fileStats = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(CACHE_CONFIG.CACHE_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          path: filePath,
          mtime: stats.mtimeMs,
        };
      });
    
    // 按修改时间排序（最旧的在前）
    fileStats.sort((a, b) => a.mtime - b.mtime);
    
    // 删除最旧的文件，直到文件数量符合限制
    const filesToDelete = fileStats.slice(0, fileStats.length - CACHE_CONFIG.MAX_CACHE_FILES);
    filesToDelete.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`删除缓存文件失败: ${file.path}`, err);
      }
    });
  } catch (err) {
    console.error('清理缓存失败:', err);
  }
}

/**
 * 获取缓存统计信息
 * @returns 缓存统计信息
 */
export function getCacheStats(): { totalFiles: number; totalSize: number; oldestFile: Date; newestFile: Date } {
  try {
    const files = fs.readdirSync(CACHE_CONFIG.CACHE_DIR)
      .filter(file => file.endsWith('.pdf'));
    
    if (files.length === 0) {
      return {
        totalFiles: 0,
        totalSize: 0,
        oldestFile: new Date(),
        newestFile: new Date(),
      };
    }
    
    let totalSize = 0;
    let oldestTime = Date.now();
    let newestTime = 0;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_CONFIG.CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      if (stats.mtimeMs < oldestTime) {
        oldestTime = stats.mtimeMs;
      }
      
      if (stats.mtimeMs > newestTime) {
        newestTime = stats.mtimeMs;
      }
    });
    
    return {
      totalFiles: files.length,
      totalSize,
      oldestFile: new Date(oldestTime),
      newestFile: new Date(newestTime),
    };
  } catch (err) {
    console.error('获取缓存统计信息失败:', err);
    return {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: new Date(),
      newestFile: new Date(),
    };
  }
}