'use client'

import Image from 'next/image'
import { cn } from 'cn'
import { formatDate } from '@/lib/dayjs'
import { useAutoSize } from '@/hooks/use-auto-size'
import { ChevronDownIcon } from '@/icons/chevron-down'
import { useState, useMemo } from 'react'

import type { HokResponse } from '@/lib/hok'

interface HokSkinsClientProps {
  id?: string
  data: HokResponse
}

// 品质权重映射（数值越大越靠前） "S", "S+", "B", "A", "S++", "SSR", "SR", "SP"
const QUALITY_WEIGHT: Record<string, number> = {
  SP: 600,
  SSR: 500,
  SR: 400,
  'S++': 320,
  'S+': 310,
  S: 300,
  A: 200,
  B: 100,
}

type SortType = 'time' | 'quality'

/**
 * 王者荣耀皮肤客户端组件
 * - 处理按时间/品质排序
 * - 处理"显示更多"交互
 */
export function HokSkinsClient({ id, data }: HokSkinsClientProps) {
  const [sortBy, setSortBy] = useState<SortType>('time')
  const pageSize = useAutoSize({ xs: 8, sm: 10 })
  const [pages, setPages] = useState(1)
  const visibleCount = pages * pageSize

  // 排序逻辑
  const sortedSkins = useMemo(() => {
    return data.skins.toSorted((a, b) => {
      if (sortBy === 'time') {
        // 按获得时间降序（最新的在前）
        return b.acquired_at - a.acquired_at
      } else {
        // 按品质权重降序
        const weightA = QUALITY_WEIGHT[a.level] || 0
        const weightB = QUALITY_WEIGHT[b.level] || 0
        // 品质相同时，按价格、获得时间降序
        return weightB - weightA || b.price - a.price || b.acquired_at - a.acquired_at
      }
    })
  }, [data.skins, sortBy])

  const displayedSkins = sortedSkins.slice(0, visibleCount)
  const hasMore = visibleCount < sortedSkins.length

  const loadMore = () => setPages((prev) => prev + 1)

  return (
    <>
      {/* 标题行 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-text-primary text-sm font-semibold tracking-wider" id={id}>
            王者皮肤
          </h2>
          <span className="text-text-tertiary text-xs">
            ({data.summary.count} / {data.summary.total_count}，价值
            <span className="mx-1">{Number(data.summary.worth).toLocaleString('zh-Hans-CN')}</span>
            点券)
          </span>
        </div>

        {/* 排序按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('time')}
            className={cn(
              'group/btn text-xs font-medium transition-colors',
              sortBy === 'time'
                ? 'text-text-primary'
                : 'text-text-secondary sm:hover:text-text-primary',
            )}
          >
            <span className="transition-transform group-active/btn:scale-90">按时间</span>
          </button>
          <span className="text-text-tertiary text-xs">·</span>
          <button
            onClick={() => setSortBy('quality')}
            className={cn(
              'group/btn text-xs font-medium transition-colors',
              sortBy === 'quality'
                ? 'text-text-primary'
                : 'text-text-secondary sm:hover:text-text-primary',
            )}
          >
            <span className="transition-transform group-active/btn:scale-90">按品质</span>
          </button>
        </div>
      </div>

      {/* 皮肤列表 */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-4">
        {displayedSkins.map((skin) => (
          <div key={skin.skin_id} className="group relative aspect-3/4 overflow-hidden rounded-lg">
            {/* 皮肤封面 */}
            <Image
              src={`${data.assets_base}${skin.skin_cover}`}
              alt={`${skin.hero_name}·${skin.skin_name}`}
              width={240}
              height={320}
              className="h-full w-full object-cover transition-all! duration-300 group-hover:scale-110"
            />

            {/* 品质标签 - 图片中上方居中 */}
            {skin.quality_label && (
              <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 sm:top-4">
                <Image
                  src={`${data.assets_base}${skin.quality_label}`}
                  alt={skin.level}
                  width={30}
                  height={12}
                  className="h-6 w-auto drop-shadow-lg sm:h-8"
                />
              </div>
            )}

            {/* 渐变遮罩 */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

            {/* 英雄名称标签 - 右上角 */}
            <div className="absolute top-1 right-1 rounded-full border border-white/20 bg-black/48 px-2 py-0.5 text-[10px] text-white backdrop-blur-[2px] sm:top-2 sm:right-2">
              {skin.hero_name}
            </div>

            {/* 皮肤信息 - PC */}
            <div className="absolute right-0 bottom-0 left-0 hidden flex-col gap-1.5 p-2 sm:flex">
              <h3 className="line-clamp-2 text-sm font-medium text-white">{skin.skin_name}</h3>
              {skin.acquired_at > 0 && <p className="text-xs text-white/60">获得于 {formatDate(skin.acquired_at, 'full')}</p>}
            </div>

            {/* 皮肤信息 - 移动端 */}
            <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-0.5 p-2 sm:hidden">
              <h3 className="line-clamp-2 text-[10px] font-medium text-white">{skin.skin_name}</h3>
              {skin.acquired_at > 0 && <p className="text-[10px] text-white/60">{formatDate(skin.acquired_at, 'full')}</p>}
            </div>
          </div>
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
              加载更多（还剩 {sortedSkins.length - visibleCount} 个）
            </span>
          </button>
        </div>
      )}
    </>
  )
}
