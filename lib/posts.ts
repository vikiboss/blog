import path from 'path'
import matter from 'gray-matter'
import { isDev } from './env.ts'
import { countWords } from './word-count.ts'
import { promises as fs } from 'fs'
import { calculateReadingTime } from './reading-time.ts'
import { cleanMarkdownContent } from './markdown.ts'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostMetadata {
  /** 文章唯一标识，基于文件名生成，例如 "2022/css-history-and-perf.md" -> "css-history-and-perf" */
  slug: string
  /** 文章标题，默认为 slug */
  title: string
  /** ISO 格式的发布日期字符串，例如 "2022-01-01T00:00:00.000Z" */
  date: string
  /** 文章主题，前端/技术/生活/笔记，四选一，默认为 "生活" */
  topic: string
  /** 文章标签数组，例如 ["JavaScript", "性能"] */
  tags: string[]
  /** 文章中使用的图片 URL 数组，包含 frontmatter 中的 top_image 和正文中的图片 */
  images: string[]
  /** 文章字数 */
  wordCount: number
  /** 文章预计阅读时间，单位分钟 */
  readingTime: number
  /** 文章摘要，默认为空字符串 */
  excerpt: string
  /** 文章作者，默认为空字符串 */
  author: string
  /** 文章是否为草稿，默认为 false */
  draft: boolean
  /** 文章是否归档，默认为 false */
  archived: boolean
  /** 文章是否置顶，默认为 false */
  top: boolean
  /** 文章是否原创，默认为 true */
  isOriginal: boolean
  /** 文章置顶图片 URL，frontmatter 中的 top_image，默认为 undefined */
  topImage: string | undefined
}

export interface Post extends PostMetadata {
  /** 文章内容，Markdown 格式 */
  content: string
}

/**
 * 递归获取目录下所有 .md 和 .mdx 文件的相对路径
 */
async function getAllMarkdownFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  try {
    await fs.access(dir)
  } catch {
    return []
  }

  const files: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // 递归读取子目录
      const subFiles = await getAllMarkdownFiles(fullPath, baseDir)
      files.push(...subFiles)
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      // 获取相对于 posts 目录的路径
      const relativePath = path.relative(baseDir, fullPath)
      files.push(relativePath)
    }
  }

  return files
}

interface GetAllPostsOptions {
  /**
   * 是否包含文章内容（content 字段）。默认为 false，仅返回元数据（PostMetadata）。设置为 true 时返回完整文章数据（Post），包含 content 字段。
   *
   * @default false
   */
  withContent?: boolean
  /**
   * 是否包含草稿文章。默认为 false，生产环境下会过滤掉 draft: true 的文章。设置为 true 时会包含草稿文章（仅开发环境有效，生产环境始终过滤草稿）。
   *
   * @default false
   */
  includeDrafts?: boolean
  /**
   * 是否原创文章。
   *
   * @default true
   */
  isOriginal?: boolean
}

export async function getAllPosts(
  options: GetAllPostsOptions & { withContent: true },
): Promise<Post[]>
export async function getAllPosts(
  options?: GetAllPostsOptions & { withContent?: false },
): Promise<PostMetadata[]>
export async function getAllPosts(
  options: GetAllPostsOptions = {},
): Promise<(PostMetadata | Post)[]> {
  const { withContent = false, includeDrafts = false, isOriginal } = options
  const markdownFiles = await getAllMarkdownFiles(postsDirectory)
  const imgRegExp = /!\[[^\]]*]\(\s*<?([^>\s)]+(?:\)[^>\s)]*)?)>?(?:\s+["'(].*?["')])?\s*\)/g

  const allPostsData: PostMetadata[] = await Promise.all(
    markdownFiles.map(async (relativePath) => {
      // 生成 slug: 只使用文件名部分，例如 "2022/css-history-and-perf.md" -> "css-history-and-perf"
      const fileName = path.basename(relativePath, path.extname(relativePath))
      const slug = fileName
      const fullPath = path.join(postsDirectory, relativePath)

      const fileContents = await fs.readFile(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      const images = [...content.matchAll(imgRegExp)].map((m) => m[1])

      return {
        slug,
        title: data.title || slug,
        topic: data.topic || '生活',
        date: new Date(data.date).toISOString(),
        tags: data.tags || [],
        images: data.top_image ? [...new Set([data.top_image, ...images])] : images,
        wordCount: countWords(cleanMarkdownContent(content)),
        readingTime: calculateReadingTime(content),
        excerpt: data.excerpt || '',
        author: data.author || '',
        draft: data.draft || false,
        archived: data.archived || false,
        top: data.top || false,
        isOriginal: data.isOriginal !== undefined ? data.isOriginal : true,
        topImage: data.top_image || undefined,
        ...(withContent ? { content } : {}),
      }
    }),
  )

  // 开发模式下显示所有文章（包括草稿），生产环境下过滤草稿。归档文章统一不显示。
  const filteredPosts =
    isDev || includeDrafts
      ? allPostsData.filter((post) => !post.archived)
      : allPostsData.filter((post) => !post.draft && !post.archived)

  return filteredPosts
    .filter((e) => isOriginal === undefined || e.isOriginal === isOriginal)
    .toSorted((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const allPosts = await getAllPosts({ withContent: true, includeDrafts: true })
  const post = allPosts.find((p) => p.slug === slug)
  return post || null
}

/**
 * 计算两个标签数组的相似度（Jaccard 相似系数）
 */
function calculateTagSimilarity(tags1: string[] = [], tags2: string[] = []): number {
  if (tags1.length === 0 || tags2.length === 0) return 0

  const set1 = new Set(tags1)
  const set2 = new Set(tags2)
  const intersection = new Set([...set1].filter((tag) => set2.has(tag)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * 获取推荐文章
 * 策略：基于多维度评分的智能推荐算法
 * - 标签相似度（40%）：优先推荐标签相似的文章
 * - 时间新鲜度（30%）：倾向推荐较新的文章
 * - 时间接近度（20%）：推荐发布时间相近的文章
 * - 确定性随机（10%）：基于 slug 的伪随机性
 */
export async function getRecommendedPosts(
  currentSlug: string,
  count: number = 5,
): Promise<PostMetadata[]> {
  const allPosts = await getAllPosts()
  const currentPost = allPosts.find((p) => p.slug === currentSlug)

  if (!currentPost) {
    return allPosts.slice(0, count)
  }

  const otherPosts = allPosts.filter((p) => p.slug !== currentSlug)

  if (otherPosts.length === 0) {
    return []
  }

  // 计算每篇文章的推荐分数
  const currentDate = new Date(currentPost.date).getTime()
  const now = Date.now()
  const seed = currentSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const scoredPosts = otherPosts.map((post, index) => {
    // 1. 标签相似度分数（0-1）
    const tagSimilarity = calculateTagSimilarity(currentPost.tags, post.tags)

    // 2. 时间新鲜度分数（0-1）：越新的文章分数越高
    const postDate = new Date(post.date).getTime()
    const daysSincePublish = (now - postDate) / (1000 * 60 * 60 * 24)
    const freshnessScore = Math.max(0, 1 - daysSincePublish / 365) // 1 年后衰减到 0

    // 3. 时间接近度分数（0-1）：发布时间越接近当前文章分数越高
    const timeDiff = Math.abs(postDate - currentDate)
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    const proximityScore = Math.max(0, 1 - daysDiff / 365) // 相差 1 年衰减到 0

    // 4. 确定性随机分数（0-1）：基于 slug 的伪随机
    const randomScore = (((seed + index) * 9301 + 49297) % 233280) / 233280

    // 综合评分（加权平均）
    const totalScore =
      tagSimilarity * 0.4 + freshnessScore * 0.3 + proximityScore * 0.2 + randomScore * 0.1

    return {
      post,
      score: totalScore,
    }
  })

  // 按分数降序排序，取前 N 篇
  const recommended = scoredPosts
    .toSorted((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ post }) => post)

  // 最终按发布时间倒序排列
  return recommended.toSorted((a, b) => (a.date < b.date ? 1 : -1))
}
