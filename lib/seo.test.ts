import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Post } from './posts'

// Mock siteConfig
vi.mock('./config', () => ({
  siteConfig: {
    name: 'Viki 写东西的地方',
    description: '分享技术和日常',
    url: 'https://blog.viki.moe',
    locale: 'zh-CN',
    author: {
      name: 'Viki',
      email: 'hi@viki.moe',
      github: 'https://github.com/vikiboss',
      twitter: '@vikiboss',
    },
    openGraph: {
      version: 1,
    },
  },
}))

// 导入需要测试的函数
import {
  generateOrganizationSchema,
  generateBlogSchema,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateCanonicalUrl,
  generatePostOpenGraph,
  generatePostTwitterCard,
} from './seo'

describe('SEO Functions', () => {
  describe('generateOrganizationSchema', () => {
    it('应该生成正确的 Organization JSON-LD', () => {
      const schema = generateOrganizationSchema()

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Viki',
        url: 'https://blog.viki.moe',
        sameAs: ['https://github.com/vikiboss'],
      })
    })

    it('应该包含必需的字段', () => {
      const schema = generateOrganizationSchema()

      expect(schema).toHaveProperty('@context')
      expect(schema).toHaveProperty('@type')
      expect(schema).toHaveProperty('name')
      expect(schema).toHaveProperty('url')
      expect(schema).toHaveProperty('sameAs')
    })
  })

  describe('generateBlogSchema', () => {
    it('应该生成正确的 Blog JSON-LD', () => {
      const schema = generateBlogSchema()

      expect(schema).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Viki 写东西的地方',
        description: '分享技术和日常',
        url: 'https://blog.viki.moe',
      })
    })

    it('应该包含 author 和 publisher 信息', () => {
      const schema = generateBlogSchema()

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Viki',
        url: 'https://github.com/vikiboss',
      })

      expect(schema.publisher).toEqual({
        '@type': 'Person',
        name: 'Viki',
        url: 'https://github.com/vikiboss',
      })
    })
  })

  describe('generateBlogPostingSchema', () => {
    let mockPost: Post

    beforeEach(() => {
      mockPost = {
        slug: 'test-post',
        title: '测试文章',
        date: '2024-01-01',
        excerpt: '这是一篇测试文章',
        content: '这是文章内容 This is the content',
        topic: '技术',
        tags: ['技术', 'React'],
        images: [],
        wordCount: 20,
        author: 'Viki',
        readingTime: 5,
        draft: false,
        archived: false,
        top: false,
        isOriginal: true,
        topImage: undefined,
      }
    })

    it('应该生成正确的 BlogPosting JSON-LD', () => {
      const schema = generateBlogPostingSchema(mockPost)

      expect(schema).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: '测试文章 - Viki 写东西的地方',
        description: '这是一篇测试文章',
        url: 'https://blog.viki.moe/test-post',
        datePublished: '2024-01-01',
        dateModified: '2024-01-01',
      })
    })

    it('应该计算正确的 wordCount', () => {
      const schema = generateBlogPostingSchema(mockPost)

      expect(schema.wordCount).toBeGreaterThan(0)
    })

    it('应该包含 author 和 publisher 信息', () => {
      const schema = generateBlogPostingSchema(mockPost)

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Viki',
        url: 'https://github.com/vikiboss',
      })

      expect(schema.publisher).toEqual({
        '@type': 'Person',
        name: 'Viki',
        url: 'https://github.com/vikiboss',
      })
    })

    it('应该处理没有 tags 的文章', () => {
      const postWithoutTags = { ...mockPost, tags: undefined }
      // @ts-expect-error for test
      const schema = generateBlogPostingSchema(postWithoutTags)

      expect(schema.keywords).toBeUndefined()
      expect(schema.articleSection).toBe('Blog')
    })

    it('应该使用 siteConfig.author.name 作为默认作者', () => {
      const postWithoutAuthor = { ...mockPost, author: undefined }
      // @ts-expect-error for test
      const schema = generateBlogPostingSchema(postWithoutAuthor)

      expect(schema.author.name).toBe('Viki')
    })

    it('应该包含必需的 SEO 字段', () => {
      const schema = generateBlogPostingSchema(mockPost)

      expect(schema.inLanguage).toBe('zh-CN')
      expect(schema.isFamilyFriendly).toBe('true')
      expect(schema.isAccessibleForFree).toBe('true')
    })
  })

  describe('generateBreadcrumbSchema', () => {
    it('应该生成正确的 BreadcrumbList JSON-LD', () => {
      const items = [
        { name: '首页', url: 'https://blog.viki.moe' },
        { name: '文章', url: 'https://blog.viki.moe/posts' },
        { name: '测试文章', url: 'https://blog.viki.moe/posts/test-post' },
      ]

      const schema = generateBreadcrumbSchema(items)

      expect(schema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '首页',
            item: 'https://blog.viki.moe',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '文章',
            item: 'https://blog.viki.moe/posts',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: '测试文章',
            // 最后一个元素不应该有 item 字段（符合 Google 最佳实践）
          },
        ],
      })
    })

    it('应该将相对 URL 转换为绝对 URL', () => {
      const items = [
        { name: '首页', url: '/' },
        { name: '文章', url: '/posts' },
        { name: '测试文章', url: '/posts/test-post' },
      ]

      const schema = generateBreadcrumbSchema(items)

      // 前两个元素应该有完整的 URL
      expect(schema.itemListElement[0].item).toBe('https://blog.viki.moe/')
      expect(schema.itemListElement[1].item).toBe('https://blog.viki.moe/posts')
      // 最后一个元素不应该有 item 字段
      expect(schema.itemListElement[2]).not.toHaveProperty('item')
    })

    it('应该正确设置 position 序号', () => {
      const items = [
        { name: 'A', url: '/a' },
        { name: 'B', url: '/b' },
      ]

      const schema = generateBreadcrumbSchema(items)

      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].position).toBe(2)
    })

    it('最后一个元素不应该包含 item 字段', () => {
      const items = [
        { name: '首页', url: '/' },
        { name: '当前页面', url: '/current' },
      ]

      const schema = generateBreadcrumbSchema(items)

      // 第一个元素应该有 item
      expect(schema.itemListElement[0]).toHaveProperty('item')
      // 最后一个元素不应该有 item
      expect(schema.itemListElement[1]).not.toHaveProperty('item')
    })

    it('应该处理单个元素', () => {
      const items = [{ name: '首页', url: '/' }]

      const schema = generateBreadcrumbSchema(items)

      // 如果只有一个元素，它就是最后一个，不应该有 item
      expect(schema.itemListElement[0]).not.toHaveProperty('item')
      expect(schema.itemListElement[0].name).toBe('首页')
    })

    it('应该处理空数组', () => {
      const schema = generateBreadcrumbSchema([])

      expect(schema.itemListElement).toEqual([])
    })
  })

  describe('generateCanonicalUrl', () => {
    it('应该生成正确的 canonical URL（带斜杠）', () => {
      const url = generateCanonicalUrl('/posts/test-post')
      expect(url).toBe('https://blog.viki.moe/posts/test-post')
    })

    it('应该生成正确的 canonical URL（不带斜杠）', () => {
      const url = generateCanonicalUrl('posts/test-post')
      expect(url).toBe('https://blog.viki.moe/posts/test-post')
    })

    it('应该处理根路径', () => {
      const url = generateCanonicalUrl('/')
      expect(url).toBe('https://blog.viki.moe/')
    })

    it('应该处理空字符串', () => {
      const url = generateCanonicalUrl('')
      expect(url).toBe('https://blog.viki.moe/')
    })
  })

  describe('generatePostOpenGraph', () => {
    let mockPost: Post

    beforeEach(() => {
      mockPost = {
        slug: 'test-post',
        title: '测试文章',
        date: '2024-01-01',
        excerpt: '这是一篇测试文章',
        content: '这是文章内容',
        topic: '技术',
        tags: ['技术', 'React'],
        images: [],
        wordCount: 10,
        author: 'Viki',
        readingTime: 5,
        draft: false,
        archived: false,
        top: false,
        isOriginal: true,
        topImage: undefined,
      }
    })

    it('应该生成正确的 Open Graph 元数据', () => {
      const og = generatePostOpenGraph(mockPost)

      expect(og.type).toBe('article')
      expect(og.title).toBe('测试文章 - Viki 写东西的地方')
      expect(og.description).toBe('这是一篇测试文章')
      expect(og.url).toBe('https://blog.viki.moe/test-post')
      expect(og.siteName).toBe('Viki 写东西的地方')
    })

    it('应该生成 OG 图片 URL', () => {
      const og = generatePostOpenGraph(mockPost)

      expect(og.images).toHaveLength(1)
      expect(og.images[0].url).toBe('https://blog.viki.moe/test-post/opengraph-image')
      expect(og.images[0].width).toBe(1200)
      expect(og.images[0].height).toBe(630)
    })

    it('应该包含正确的 locale', () => {
      const og = generatePostOpenGraph(mockPost)

      expect(og.locale).toBe('zh_CN') // 注意：下划线替换了连字符
    })

    it('应该包含文章元数据', () => {
      const og = generatePostOpenGraph(mockPost)

      expect(og.publishedTime).toBe('2024-01-01')
      expect(og.modifiedTime).toBe('2024-01-01')
      expect(og.authors).toEqual(['Viki'])
      expect(og.tags).toEqual(['技术', 'React'])
    })

    it('应该处理没有 excerpt 的文章', () => {
      const postWithoutExcerpt = { ...mockPost, excerpt: undefined }
      // @ts-expect-error for test
      const og = generatePostOpenGraph(postWithoutExcerpt)

      expect(og.description).toBe('测试文章')
    })
  })

  describe('generatePostTwitterCard', () => {
    let mockPost: Post

    beforeEach(() => {
      mockPost = {
        slug: 'test-post',
        title: '测试文章',
        date: '2024-01-01',
        excerpt: '这是一篇测试文章',
        content: '这是文章内容',
        topic: '技术',
        tags: ['技术', 'React'],
        images: [],
        wordCount: 10,
        author: 'Viki',
        readingTime: 5,
        draft: false,
        archived: false,
        top: false,
        isOriginal: true,
        topImage: undefined,
      }
    })

    it('应该生成正确的 Twitter Card 元数据', () => {
      const card = generatePostTwitterCard(mockPost)

      expect(card.card).toBe('summary_large_image')
      expect(card.title).toBe('测试文章 - Viki 写东西的地方')
      expect(card.description).toBe('这是一篇测试文章')
    })

    it('应该生成 Twitter Card 图片 URL', () => {
      const card = generatePostTwitterCard(mockPost)

      expect(card.images).toHaveLength(1)
      expect(card.images[0]).toBe('https://blog.viki.moe/test-post/opengraph-image')
    })

    it('应该处理没有 excerpt 的文章', () => {
      const postWithoutExcerpt = { ...mockPost, excerpt: undefined }
      // @ts-expect-error for test
      const card = generatePostTwitterCard(postWithoutExcerpt)

      expect(card.description).toBe('测试文章')
    })
  })

  describe('综合测试', () => {
    it('所有生成的 URL 应该使用相同的 base URL', () => {
      const mockPost: Post = {
        slug: 'test',
        title: 'Test',
        date: '2024-01-01',
        excerpt: 'Test',
        content: 'Test',
        topic: '生活',
        tags: [],
        images: [],
        wordCount: 4,
        author: '',
        readingTime: 1,
        draft: false,
        archived: false,
        top: false,
        isOriginal: true,
        topImage: undefined,
      }

      const baseUrl = 'https://blog.viki.moe'

      expect(generateCanonicalUrl('/test')).toContain(baseUrl)
      expect(generatePostOpenGraph(mockPost).url).toContain(baseUrl)
      expect(generateBlogSchema().url).toBe(baseUrl)
    })

    it('所有 Schema.org 结构数据应该包含正确的 @context', () => {
      const mockPost: Post = {
        slug: 'test',
        title: 'Test',
        date: '2024-01-01',
        excerpt: 'Test',
        content: 'Test',
        topic: '生活',
        tags: [],
        images: [],
        wordCount: 4,
        author: '',
        readingTime: 1,
        draft: false,
        archived: false,
        top: false,
        isOriginal: true,
        topImage: undefined,
      }

      expect(generateOrganizationSchema()['@context']).toBe('https://schema.org')
      expect(generateBlogSchema()['@context']).toBe('https://schema.org')
      expect(generateBlogPostingSchema(mockPost)['@context']).toBe('https://schema.org')
      expect(generateBreadcrumbSchema([])['@context']).toBe('https://schema.org')
    })
  })
})
