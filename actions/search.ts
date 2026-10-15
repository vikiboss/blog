'use server'

import { dayjs } from '@/lib/dayjs'
import { getAllPosts } from '@/lib/posts'
import { about, thoughts, mioSays, timeline, friends, collection } from '@/lib/data'

export interface SearchIndexItem {
  id: string
  type: 'post' | 'tech' | 'thought' | 'mio-say' | 'collection' | 'timeline' | 'about' | 'friend'
  title: string
  excerpt?: string
  content: string
  tags?: string[]
  date?: string
  url: string
}

const TYPE_WEIGHTS: Record<SearchIndexItem['type'], number> = {
  post: 6,
  tech: 5,
  thought: 4,
  'mio-say': 4,
  collection: 3,
  timeline: 2,
  about: 1,
  friend: 1,
}

function cleanMarkdown(markdown: string): string {
  let c = markdown
  c = c.replace(/^---[\s\S]*?---\n/m, '')
  c = c.replace(/^\s*\|?(\s*[:-]+[-| :]*\|)+\s*$/gm, '')
  c = c.replace(/```[\s\S]*?```/g, '')
  c = c.replace(/~~~[\s\S]*?~~~/g, '')
  c = c.replace(/`[^`]+`/g, '')
  c = c.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
  c = c.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
  c = c.replace(/<[^>]+>/g, '')
  c = c.replace(/\*\*([^*]+)\*\*/g, '$1')
  c = c.replace(/__([^_]+)__/g, '$1')
  c = c.replace(/\*([^*]+)\*/g, '$1')
  c = c.replace(/_([^_]+)_/g, '$1')
  c = c.replace(/~~([^~]+)~~/g, '$1')
  c = c.replace(/\|\|([^|]+)\|\|/g, '$1')
  c = c.replace(/^[\s]*-\s*\[[x\s]\]\s+/gim, '')
  c = c.replace(/^#{1,6}\s+/gm, '')
  c = c.replace(/^[\s]*[-*+]\s+/gm, '')
  c = c.replace(/^[\s]*\d+\.\s+/gm, '')
  c = c.replace(/^>\s+/gm, '')
  c = c.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '')
  c = c.replace(/\n{3,}/g, '\n\n')
  return c.trim()
}

function truncate(text: string, max = 100): string {
  return text.length <= max ? text : text.slice(0, max).trim() + '...'
}

let cachedItems: SearchIndexItem[] | null = null

async function getAllSearchItems(): Promise<SearchIndexItem[]> {
  if (cachedItems) return cachedItems

  const items: SearchIndexItem[] = []

  // 文章
  const posts = await getAllPosts({ withContent: true })

  for (const post of posts) {
    items.push({
      id: `${post.isOriginal ? 'post' : 'post'}-${post.slug}`,
      type: post.isOriginal ? 'post' : 'tech',
      title: post.title,
      excerpt: post.excerpt,
      content: cleanMarkdown(post.content),
      tags: post.tags,
      date: post.date,
      url: `/${post.slug}`,
    })
  }

  // 碎碎念
  for (const thought of thoughts) {
    const content = cleanMarkdown(thought.content)
    items.push({
      id: `thought-${thought.id}`,
      type: 'thought',
      title: `碎碎念 #${thought.id}`,
      excerpt: truncate(content),
      content,
      date: thought.date,
      url: `/thoughts/${thought.id}`,
    })
  }

  // Mio 说
  for (const mioSay of mioSays) {
    const content = cleanMarkdown(mioSay.content)
    items.push({
      id: `mio-say-${mioSay.id}`,
      type: 'mio-say',
      title: `Mio 说 #${mioSay.id}`,
      excerpt: truncate(content),
      content,
      date: mioSay.date,
      url: `/mio-says/${mioSay.id}`,
    })
  }

  // 收藏夹
  for (const category of collection) {
    for (const item of category.items) {
      items.push({
        id: `collection-${category.category}-${item.name}`,
        type: 'collection',
        title: item.name,
        excerpt: item.description,
        content: `${item.name} ${item.description} ${item.tags.join(' ')}`,
        tags: item.tags,
        url: item.url,
      })
    }
  }

  // 大事记（ID 与 timeline-view.tsx 保持一致）
  const byYear = Object.groupBy(timeline, (item) => {
    const d = dayjs(item.date)
    return d.isValid() ? d.year() : 0
  })
  const sortedYears = Object.keys(byYear)
    .map(Number)
    .toSorted((a, b) => b - a)
  let globalIdx = 0
  for (const year of sortedYears) {
    const yearItems = (byYear[year] ?? []).toSorted(
      (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
    )
    for (const event of yearItems) {
      const id = timeline.length - globalIdx
      const content = cleanMarkdown(event.description)
      items.push({
        id: `timeline-${id}`,
        type: 'timeline',
        title: content,
        content,
        date: event.date,
        url: `/timeline#${id}`,
      })
      globalIdx++
    }
  }

  // 关于 - 简介段落
  if (about.intro) {
    for (let i = 0; i < about.intro.paragraphs.length; i++) {
      const paragraph = about.intro.paragraphs[i]
      items.push({
        id: `about-intro-${i}`,
        type: 'about',
        title: '关于',
        excerpt: paragraph,
        content: paragraph,
        url: '/about',
      })
    }
  }

  // 关于 - 开源项目
  if (about.openSource) {
    const projectCategories = ['libraries', 'applications', 'services', 'scripts'] as const
    for (const category of projectCategories) {
      const projects = about.openSource.data[category]
      if (Array.isArray(projects)) {
        for (const project of projects) {
          items.push({
            id: `about-project-${project.name}`,
            type: 'about',
            title: project.name,
            excerpt: project.description,
            content: `${project.name} ${project.description}`,
            url: '/about#open-source',
          })
        }
      }
    }
  }

  // 友链
  for (const friend of friends) {
    items.push({
      id: `friend-${friend.id}`,
      type: 'friend',
      title: friend.name,
      excerpt: friend.description || '',
      content: `${friend.name} ${friend.description || ''}`,
      url: `/friends#${friend.id}`,
    })
  }

  cachedItems = items
  return items
}

export async function searchContent(query: string): Promise<SearchIndexItem[]> {
  if (!query.trim()) return []

  const items = await getAllSearchItems()
  const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return items
    .map((item) => {
      let score = 0
      const title = item.title.toLowerCase()
      const excerpt = (item.excerpt || '').toLowerCase()
      const content = item.content.toLowerCase()
      const tags = (item.tags || []).join(' ').toLowerCase()
      for (const kw of keywords) {
        if (title.includes(kw)) score += 10
        if (tags.includes(kw)) score += 5
        if (excerpt.includes(kw)) score += 3
        if (content.includes(kw)) score += 1
      }
      return { item, score }
    })
    .filter(({ score }) => score > 0)
    .toSorted((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const wa = TYPE_WEIGHTS[a.item.type] || 0
      const wb = TYPE_WEIGHTS[b.item.type] || 0
      if (wb !== wa) return wb - wa
      const da = a.item.date ? new Date(a.item.date).getTime() : 0
      const db = b.item.date ? new Date(b.item.date).getTime() : 0
      return db - da
    })
    .slice(0, 20)
    .map(({ item }) => item)
}
