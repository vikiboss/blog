import aboutData from '../data/about.json' with { type: 'json' }
import mioSaysData from '../data/mio-says.json' with { type: 'json' }
import thoughtsData from '../data/thoughts.json' with { type: 'json' }
import timelineData from '../data/timeline.json' with { type: 'json' }
import friendsData from '../data/friends.json' with { type: 'json' }
import otherGamesData from '../data/other-games.json' with { type: 'json' }
import collectionData from '../data/collection.json' with { type: 'json' }
import { isDev } from './env.ts'
import { siteConfig } from './config.ts'

// --- About Types ---
export interface OpenSourceProject {
  name: string
  url: string
  description: string
  tags: string[]
  status: 'active' | 'archived'
  stars?: string
  homepage?: string
}

export interface ProjectsData {
  applications?: OpenSourceProject[]
  libraries?: OpenSourceProject[]
  services?: OpenSourceProject[]
  scripts?: OpenSourceProject[]
  tools?: OpenSourceProject[]
}

export interface ContactLink {
  label: string
  url: string
}

export interface TechStackItem {
  name: string
  description: string
  link: string
}

export interface TechStackData {
  languages: TechStackItem[]
  frontend: TechStackItem[]
  backend: TechStackItem[]
  crossPlatform: TechStackItem[]
}

export const pages = {
  posts: {
    title: '文章',
    description: `记录技术思考和生活感悟`,
    slug: '/posts',
  },
  thoughts: {
    title: '碎碎念',
    description: `${siteConfig.author.name} 的碎碎念小角落，记录点滴想法和言论`,
    slug: '/thoughts',
  },
  mioSays: {
    title: `${siteConfig.lover.name} 说`,
    description: `${siteConfig.lover.name} 的专属发言空间，${siteConfig.author.name} 无编辑权限`,
    slug: '/mio-says',
  },
  about: {
    title: '关于我',
    description: `前端开发者，热衷于开源和技术分享，相信技术改变世界`,
    slug: '/about',
  },
  game: {
    title: '电子游戏',
    description: `记录 ${siteConfig.author.name} 的游戏时光，游戏库和时长统计`,
    slug: '/game',
  },
  library: {
    title: '书影音',
    description: `记录 ${siteConfig.author.name} 看的影视、读的书籍`,
    slug: '/library',
  },
  timeline: {
    title: '大事记',
    description: `记录 ${siteConfig.author.name} 生活中的重要时刻和里程碑`,
    slug: '/timeline',
  },
  friends: {
    title: '友链',
    description: `记录 ${siteConfig.author.name} 在互联网上的好友，相互学习、共同进步`,
    slug: '/friends',
  },
  collection: {
    title: '储物箱',
    description: `${siteConfig.author.name} 的储物箱，记录各种有用的工具、资源和灵感，持续整理中。如果你使用桌面端浏览本页面，可以按下 Ctrl + F 搜索查找相关标签、内容，比如 #npm`,
    slug: '/collection',
  },
  messages: {
    title: '话匣子',
    description: '打开话匣子，留下你的想法和故事',
    slug: '/messages',
  },
  reading: {
    title: '岛读',
    description: `每日一篇小短文，数据来源于「岛读」，旨在培养阅读习惯和提升文学素养`,
    slug: '/reading',
  },
}

export type PageData = typeof pages

export interface AboutData {
  intro: {
    title: string
    paragraphs: string[]
    aboutParagraphs: string[]
  }
  contact: {
    title: string
    list: ContactLink[]
  }
  openSource: {
    title: string
    moreLink: string
    data: ProjectsData
  }
  techStack: {
    title: string
    data: TechStackData
  }
}

export type ShortPost = Thought | MioSay

// --- Mio Says Types ---
export interface MioSay {
  id: string
  date: string // ISO 8601 格式
  content: string
  images?: string[] // 图片链接数组
}

// --- Thoughts Types ---
export interface Thought {
  id: string
  date: string // ISO 8601 格式
  content: string
  images?: string[] // 图片链接数组
}

// --- Timeline Types ---
export interface TimelineItem {
  date: string
  description: string
}

// --- Friends Types ---
export type FriendStatus = 'active' | 'pending' | 'offline' | 'lost' | 'archived'

export interface Friend {
  id: string
  name: string
  url: string
  description?: string
  avatar?: string
  rss?: string
  status?: FriendStatus // 默认 active；pending=呼唤中、offline=访问异常、lost=已失联、archived=已归档
}

// --- Other Games Types ---
export interface OtherGame {
  id: string
  name: string
  cover: string
  type?: string
  platforms: string[]
  playtime?: string
  description?: string
  achievements?: string[]
  url?: string
}

// --- Collection Types ---
export interface CollectionItem {
  name: string
  description: string
  url: string
  tags: string[]
}

export interface CollectionCategory {
  category: string
  title: string
  description: string
  items: CollectionItem[]
}

export type CollectionData = CollectionCategory[]

// --- Library Types ---
export interface Book {
  id: string
  title: string
  cover: string
  author?: string
  year?: number
  rating?: number
  genre?: string[]
  description?: string
  read_date?: string
  url?: string
}

export interface Movie {
  id: string
  title: string
  cover: string
  year?: number
  director?: string
  rating?: number
  genre?: string[]
  description?: string
  watched_date?: string
  url?: string
}

export interface Playlist {
  id: string
  name: string
  cover: string
  creator?: string
  song_count?: number
  description?: string
  created_date?: string
  url?: string
}

// --- Exports ---

export const about = aboutData as AboutData

const defaultFriends: Friend[] = [
  {
    id: 'example-friend',
    name: 'Example Friend',
    url: 'https://example.com',
    description: '示例友链，请替换为真实的好友。',
    avatar: 'https://q1.qlogo.cn/g?b=qq&nk=10001&s=100',
    rss: 'https://example.com/rss',
  },
  {
    id: 'example-friend-2',
    name: 'Example Friend 2',
    url: 'https://example.com',
    description: '示例友链，请替换为真实的好友。',
  },
]

export const mioSays: MioSay[] = mioSaysData
export const thoughts: Thought[] = thoughtsData
export const timeline: TimelineItem[] = timelineData
export const friends: Friend[] =
  friendsData.length === 0 && isDev ? defaultFriends : (friendsData as Friend[])
export const otherGames: OtherGame[] = otherGamesData
export const collection: CollectionData = collectionData as CollectionData
