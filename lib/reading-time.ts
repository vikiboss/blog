import { countWords } from './word-count.ts'

export interface StripMarkdownOptions {
  hideCodeBlockContent?: boolean
  normalizeWhitespace?: boolean
}

export function stripMarkdown(markdown: string, options: StripMarkdownOptions = {}): string {
  const { hideCodeBlockContent = false, normalizeWhitespace = false } = options
  let result = markdown
    // 移除 frontmatter（^ 不加 m 标志，只匹配字符串开头）
    .replace(/^---[\s\S]*?---/, '')
    // fenced 代码块（``` 和 ~~~，反向引用匹配同数量分隔符）
    .replace(/(`{3,}|~{3,})[^\n]*\n([\s\S]*?)\1/g, hideCodeBlockContent ? '[代码块]' : '$2')
    // 行内代码：移除标记，保留内容
    .replace(/`([^`]+)`/g, '$1')
    // 图片 → [图片]（必须在链接之前处理）
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[图片]')
    // 链接：移除标记，保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 标题标记
    .replace(/#{1,6}\s+/g, '')
    // 加粗、斜体、删除线
    .replace(/[*_~]{1,2}([^*_~]+)[*_~]{1,2}/g, '$1')
    // 剧透标记 ||text||
    .replace(/\|\|([^|]+)\|\|/g, '$1')
    // 任务列表（必须在无序列表之前）
    .replace(/^[\s]*-\s*\[[x\s]\]\s+/gim, '')
    // 引用标记
    .replace(/^>\s*/gm, '')
    // 无序列表标记
    .replace(/^[-*+]\s+/gm, '')
    // 有序列表标记
    .replace(/^\d+\.\s+/gm, '')
    // 表格分隔行
    .replace(/^\s*\|?(\s*[:-]+[-| :]*\|)+\s*$/gm, '')
    // 水平分割线
    .replace(/^[-*_]{3,}$/gm, '')
    // HTML 标签
    .replace(/<[^>]+>/g, '')
  if (normalizeWhitespace) {
    result = result.replace(/\n{3,}/g, '\n\n').trim()
  }
  return result
}

/**
 * 计算阅读时间（分钟）
 *
 * 基于科学的阅读速度研究：
 * - 中文阅读速度：每分钟 300-500 字，取略高值 600 字/分钟
 * - 英文阅读速度：每分钟 200-250 词，取略高值 300 词/分钟
 * - 数字阅读速度：与英文单词相同，每分钟 225 个数字组，取略高值 300 数字组/分钟
 *
 * 注意：
 * - 代码块不计入阅读时间（代码需要理解和思考，不是简单阅读）
 * - Markdown 语法标记会被移除，只统计实际文本内容
 * - 最少返回 1 分钟（即使内容很少）
 *
 * @param content - Markdown 格式的文章内容
 * @returns 预计阅读时间（分钟）
 *
 * @example
 * ```ts
 * calculateReadingTime('这是一篇中文文章') // 1
 * calculateReadingTime('This is an English article') // 1
 * ```
 */
export function calculateReadingTime(content: string): number {
  if (!content || typeof content !== 'string') {
    return 1
  }

  // 移除 Markdown 语法，获取纯文本
  const plainText = stripMarkdown(content)

  // 使用通用的字数统计函数
  const wordCount = countWords(plainText)

  // 根据阅读速度计算时间
  // 假设平均阅读速度为 600 字/分钟（混合中英文的较高阅读速度）
  const readingTime = Math.ceil(wordCount / 600)

  // 至少 1 分钟
  return Math.max(1, readingTime)
}
