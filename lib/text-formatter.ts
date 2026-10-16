import pangu from 'pangu'

/**
 * 名词大小写规范化映射表
 * 用于统一常见名词的大小写格式
 */
const nameNormalizeMap: Record<string, string> = {
  viki: 'Viki',
  mio: 'Mio',
  react: 'React',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  github: 'GitHub',
  vscode: 'VS Code',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
}

/**
 * Markdown 标记占位符接口
 */
interface MarkdownPlaceholder {
  placeholder: string
  original: string
}

/**
 * 提取 Markdown 标记，替换为占位符
 * 保护 Markdown 语法不被 pangu 破坏
 */
function extractMarkdown(text: string): { text: string; placeholders: MarkdownPlaceholder[] } {
  const placeholders: MarkdownPlaceholder[] = []
  let result = text

  // 需要保护的 Markdown 语法模式（按优先级排序）
  const patterns = [
    // 行内代码（最高优先级，避免内部被处理）
    /`[^`]+`/g,
    // 加粗
    /\*\*[^*]+\*\*/g,
    // 斜体
    /\*[^*]+\*/g,
    // 删除线
    /~~[^~]+~~/g,
    // 图片
    /!\[[^\]]*\]\([^)]+\)/g,
    // 链接
    /\[[^\]]+\]\([^)]+\)/g,
  ]

  patterns.forEach((pattern, patternIndex) => {
    result = result.replace(pattern, (match) => {
      const placeholder = `__MD_PLACEHOLDER_${patternIndex}_${placeholders.length}__`
      placeholders.push({ placeholder, original: match })
      return placeholder
    })
  })

  return { text: result, placeholders }
}

/**
 * 恢复 Markdown 标记
 */
function restoreMarkdown(text: string, placeholders: MarkdownPlaceholder[]): string {
  let result = text

  // 按相反顺序恢复，确保嵌套正确
  for (let i = placeholders.length - 1; i >= 0; i--) {
    const { placeholder, original } = placeholders[i]
    result = result.replace(placeholder, original)
  }

  return result
}

/**
 * 格式化文本内容
 * 1. 统一换行符
 * 2. 提取并保护 Markdown 标记
 * 3. 使用 pangu 进行中英文混排格式化（盘古之白）
 * 4. 统一名词大小写
 * 5. 恢复 Markdown 标记
 *
 * @param text - 要格式化的文本
 * @returns 格式化后的文本
 */
export function formatText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text
  }

  // 1. 统一换行符为 \n。 兼容 iOS 下 SB QQ 的独一份 \r 换行符
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 2. 提取 Markdown 标记
  const { text: textWithoutMd, placeholders } = extractMarkdown(normalized)

  // 3. 使用 pangu 格式化中英文混排
  let formatted = pangu.spaceText(textWithoutMd)

  // 4. 统一名词大小写
  // 使用正则替换，确保只替换完整单词，不影响单词的一部分
  Object.entries(nameNormalizeMap).forEach(([pattern, replacement]) => {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi')
    formatted = formatted.replace(regex, replacement)
  })

  // 5. 恢复 Markdown 标记
  formatted = restoreMarkdown(formatted, placeholders)

  return formatted
}

/**
 * 格式化内容对象中的 content 字段
 * 如果 content 存在且非空，则进行格式化
 *
 * @param obj - 包含 content 字段的对象
 * @returns 格式化后的对象
 */
export function formatContentField<T extends { content?: string }>(obj: T): T {
  if (obj.content && obj.content.trim() !== '') {
    return {
      ...obj,
      content: formatText(obj.content),
    }
  }
  return obj
}
