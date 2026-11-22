// 通用互动系统 - 配置驱动架构

import { kv } from '@vercel/kv'
import { dayjs, TZ_SHANGHAI } from './dayjs'

export type InteractionType = string // 完全开放，不限制类型

/**
 * 互动系统总开关
 * 临时关闭以降低 Vercel CPU 消耗：关闭后不再读写 KV 计数、
 * 服务端不再渲染互动按钮，点击提交入口也会直接返回失败。
 * 需要恢复时改回 true 即可。
 */
export const INTERACTIONS_ENABLED = false

export interface InteractionConfig {
  /** 图标组件名称 */
  icon: 'cheers' | 'flower' | 'heart' | string
  /** CSS 变量名称（不含 var()） */
  colorVar: string
  /** 无障碍标签 */
  ariaLabel: string
  /** 显示名称（用于日志等） */
  displayName: string
  /** 是否启用（预留开关） */
  enabled?: boolean
  /** 每天最大点击次数（默认 1） */
  maxClicksPerDay?: number
}

export interface InteractionCounts {
  [id: string]: number
}

export interface InteractionClickResponse {
  ok: boolean
  count: number
  error?: string
}

// 配置注册表（易于扩展）
export const INTERACTION_CONFIGS: Record<string, InteractionConfig> = {
  thoughts: {
    icon: 'cheers',
    colorVar: '--color-viki-blue',
    ariaLabel: '干杯',
    displayName: '碎碎念互动',
    enabled: INTERACTIONS_ENABLED,
    maxClicksPerDay: 1, // 每天 1 次
  },
  'mio-says': {
    icon: 'flower',
    colorVar: '--color-mio-pink',
    ariaLabel: '献花',
    displayName: 'Mio 说互动',
    enabled: INTERACTIONS_ENABLED,
    maxClicksPerDay: 1, // 每天 1 次
  },
  posts: {
    icon: 'heart',
    colorVar: '--color-mio-pink',
    ariaLabel: '喜欢',
    displayName: '文章互动',
    enabled: INTERACTIONS_ENABLED,
    maxClicksPerDay: 1, // 每天 1 次
  },
}

// 获取配置（带验证）
export function getInteractionConfig(type: string): InteractionConfig | null {
  if (!INTERACTIONS_ENABLED) {
    return null
  }

  const config = INTERACTION_CONFIGS[type]
  if (!config || config.enabled === false) {
    return null
  }
  return config
}

// 验证类型是否有效
export function isValidInteractionType(type: string): boolean {
  return getInteractionConfig(type) !== null
}

// ==================== 客户端状态管理 ====================

interface UserClickState {
  date: string // YYYY-MM-DD 格式
  clicks: Record<string, number> // { id: clickCount }
}

// 获取今天的日期字符串
function getTodayString(): string {
  return dayjs().tz(TZ_SHANGHAI).format('YYYY-MM-DD')
}

// 从 localStorage 读取用户点击状态
export function loadUserClickState(type: string): UserClickState {
  if (typeof window === 'undefined') {
    return { date: getTodayString(), clicks: {} }
  }

  const key = `interaction:${type}:user-clicks`
  const stored = localStorage.getItem(key)

  if (!stored) {
    return { date: getTodayString(), clicks: {} }
  }

  try {
    const state = JSON.parse(stored) as UserClickState

    // 如果不是今天的数据，清空
    if (state.date !== getTodayString()) {
      return { date: getTodayString(), clicks: {} }
    }

    return state
  } catch {
    return { date: getTodayString(), clicks: {} }
  }
}

// 保存用户点击状态到 localStorage
export function saveUserClickState(type: string, state: UserClickState): void {
  if (typeof window === 'undefined') return

  const key = `interaction:${type}:user-clicks`
  localStorage.setItem(key, JSON.stringify(state))
}

// 获取用户今天对某个 ID 的点击次数
export function getUserClickCount(type: string, id: string): number {
  const state = loadUserClickState(type)
  return state.clicks[id] ?? 0
}

// 记录用户点击
export function recordUserClick(type: string, id: string): number {
  const state = loadUserClickState(type)
  const currentCount = state.clicks[id] ?? 0
  const newCount = currentCount + 1

  state.clicks[id] = newCount
  saveUserClickState(type, state)

  return newCount
}

// 检查用户是否还能点击
export function canUserClick(type: string, id: string): boolean {
  const config = getInteractionConfig(type)
  if (!config) return false

  const maxClicks = config.maxClicksPerDay ?? 1
  const currentCount = getUserClickCount(type, id)

  return currentCount < maxClicks
}

// ==================== 服务端数据访问 ====================

/**
 * 批量获取互动计数（服务端专用）
 * @param type - 互动类型
 * @param ids - ID 列表
 * @returns ID 到计数的映射
 */
export async function getInteractionCounts(
  type: string,
  ids: string[],
): Promise<Record<string, number>> {
  // 总开关关闭时不访问 KV，直接返回空计数（调用方会因此不渲染按钮）
  if (!INTERACTIONS_ENABLED || !getInteractionConfig(type) || ids.length === 0) {
    return {}
  }

  try {
    // 批量查询计数
    const keys = ids.map((id) => `interaction:${type}:${id}:count`)
    const counts = (await kv.mget(...keys)) as (number | null)[]

    // 转换为 { id: count } 格式
    return Object.fromEntries(ids.map((id, index) => [id, counts[index] ?? 0]))
  } catch (error) {
    console.error('[Interactions] Failed to fetch counts:', error)
    // 降级：返回全 0 计数
    return Object.fromEntries(ids.map((id) => [id, 0]))
  }
}
