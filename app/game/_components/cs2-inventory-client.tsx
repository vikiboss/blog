'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { useAutoSize } from '@/hooks/use-auto-size'
import { ChevronDownIcon } from '@/icons/chevron-down'

import type { CS2InventoryItem } from '@/lib/steam'

interface CS2InventoryClientProps {
  id?: string
  items: CS2InventoryItem[]
}

// 扩展类型，添加数量字段
interface GroupedCS2Item extends CS2InventoryItem {
  count: number
}

// 稀有度权重映射（数值越大越靠前）
const RARITY_WEIGHT: Record<string, number> = {
  保密级: 100, // 武器最高稀有度
  受限级: 80, // 武器中等稀有度
  军规级: 60, // 武器较低稀有度
  高级: 40, // 音乐盒
  非凡: 20, // 勋章、收藏品
  普通级: 10, // 涂鸦、武器箱、工具
}

/**
 * CS2 库存客户端组件
 * - 处理稀有度排序
 * - 处理"显示更多"交互
 */
export function CS2InventoryClient({ id, items }: CS2InventoryClientProps) {
  const pageSize = useAutoSize({ xs: 6, sm: 8 })
  const [pages, setPages] = useState(1)
  const visibleCount = pages * pageSize

  // 按名称分组并计数，然后按稀有度排序
  const groupedAndSortedItems = useMemo(() => {
    // 按名称分组
    const grouped = new Map<string, GroupedCS2Item>()

    items.forEach((item) => {
      const existing = grouped.get(item.name)
      if (existing) {
        existing.count += 1
      } else {
        grouped.set(item.name, { ...item, count: 1 })
      }
    })

    // 转换为数组并按稀有度排序
    return Array.from(grouped.values()).toSorted((a, b) => {
      const weightA = a.rarity ? RARITY_WEIGHT[a.rarity] || 0 : 0
      const weightB = b.rarity ? RARITY_WEIGHT[b.rarity] || 0 : 0

      const score = (b.stattrak_score || 0) - (a.stattrak_score || 0)

      const caseA = ['武器箱', '胶囊', '纪念包'].some((name) => a.name.includes(name)) ? 1 : 0
      const caseB = ['武器箱', '胶囊', '纪念包'].some((name) => b.name.includes(name)) ? 1 : 0
      const caseScore = caseB - caseA

      return score || weightB - weightA || caseScore || b.count - a.count
    })
  }, [items])

  const displayedItems = groupedAndSortedItems.slice(0, visibleCount)
  const hasMore = visibleCount < groupedAndSortedItems.length

  const loadMore = () => setPages((prev) => prev + 1)

  return (
    <>
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary text-sm font-semibold tracking-wider" id={id}>
          Counter-Strike 2 库存
        </h2>
        <span className="text-text-secondary text-xs">
          {groupedAndSortedItems.length} 种物品 · 共 {items.length} 件
        </span>
      </div>

      {/* 物品列表 */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4">
        {displayedItems.map((item) => (
          <a
            key={item.name}
            href={item.market_url || item.icon_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            {/* 深色贴合游戏的背景渐变 */}
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/60 to-black/80 dark:from-zinc-800/80 dark:via-zinc-700/60 dark:to-zinc-800/80" />

            {/* 物品图标 */}
            <div className="relative flex h-full w-full items-center justify-center p-2">
              <Image
                src={item.icon_url}
                alt={item.plain_name}
                width={200}
                height={200}
                className="h-full w-full object-contain transition-all! duration-300 group-hover:scale-110"
              />
            </div>

            {/* 渐变遮罩 */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

            {/* 右上角标签容器 - 横向 flex 布局 */}
            <div className="absolute top-1 right-1 flex items-center gap-1 sm:top-2 sm:right-2">
              {/* 数量标识（仅当数量 > 1 时显示） */}
              {item.count > 1 && (
                <div className="rounded-full border border-white/20 bg-black/48 px-2 py-0.5 text-[10px] text-white backdrop-blur-[2px]">
                  {item.count} 件
                </div>
              )}

              {/* 暗金击杀 */}
              {item.stattrak_score && (
                <div className="rounded-full border border-white/20 bg-black/48 px-2 py-0.5 text-[10px] text-white backdrop-blur-[2px]">
                  {item.stattrak_score.toLocaleString('zh-Hans-CN')} 击杀
                </div>
              )}
            </div>

            {/* PC 端磨损标签 - 左上角 */}
            {item.exterior && (
              <div className="absolute top-1 left-1 hidden rounded-full border border-white/20 bg-black/48 px-2 py-0.5 text-[10px] text-white backdrop-blur-[2px] sm:top-2 sm:left-2 sm:block">
                {item.exterior}
              </div>
            )}

            {/* 移动端磨损标签 - 左上角 */}
            {item.exterior_short && (
              <div className="absolute top-1 left-1 block rounded-full border border-white/20 bg-black/48 px-2 py-0.5 text-[10px] text-white backdrop-blur-[2px] sm:top-2 sm:left-2 sm:hidden">
                {item.exterior_short}
              </div>
            )}

            {/* 物品信息 - 底部 */}
            <div className="absolute right-0 bottom-0 left-0 p-3">
              <h3 className="line-clamp-1 truncate text-[10px] font-medium text-nowrap break-all whitespace-break-spaces text-white sm:text-xs">
                {item.plain_name}
              </h3>
            </div>
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="group/btn text-text-secondary sm:hover:bg-bg-secondary sm:hover:text-text-primary active:bg-bg-secondary active:text-text-primary inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              <ChevronDownIcon className="h-3.5 w-3.5 transition-transform group-active/btn:translate-y-0.5" />
              加载更多（还剩 {groupedAndSortedItems.length - visibleCount} 件）
            </span>
          </button>
        </div>
      )}
    </>
  )
}
