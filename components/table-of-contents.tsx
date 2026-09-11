'use client'

import { cn } from '@/lib/cn'
import { MenuIcon } from '../icons/menu'
import { CloseIcon } from '../icons/close'
import { extractHeadings } from '@/lib/toc'
import { useEffect, useState } from 'react'

/**
 * 智能高亮 hook - 使用 Intersection Observer + 内容区域计算
 *
 * 核心逻辑：
 * 1. 使用 Intersection Observer 监听标题可见性（性能优于滚动监听）
 * 2. 计算每个标题的"内容区域"（从当前标题到下一个标题）
 * 3. 智能判断当前激活标题：
 *    - 优先：标题在阅读线（视口顶部 20%）附近
 *    - 次要：标题内容区域在视口中
 *    - 特殊：接近页面底部时，高亮最后一个标题
 *
 * 解决的问题：
 * - 最后一个标题内容少时也能正确高亮
 * - 大标题包含多个小标题时智能判断
 * - 性能优化（避免滚动事件频繁触发）
 */
function useActiveHeading(items: StaticTocItem[], setActiveId: (id: string) => void) {
  useEffect(() => {
    if (items.length === 0) return

    // 阅读线：视口顶部 20% 的位置（通常用户的阅读焦点在这里）
    const READING_LINE_RATIO = 0.2
    // 页面底部阈值：距离底部多少像素时认为已到底部
    const BOTTOM_THRESHOLD = 100

    const headingElements = items
      .map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }))
      .filter((item) => item.element !== null) as Array<{
      id: string
      element: HTMLElement
    }>

    if (headingElements.length === 0) {
      return
    }

    // 初始化：设置第一个标题为激活状态
    setActiveId(headingElements[0].id)

    /**
     * 计算标题的内容区域
     * 返回：从当前标题到下一个标题之间的高度
     */
    const getHeadingContentHeight = (index: number): number => {
      const currentElement = headingElements[index].element
      const nextElement = headingElements[index + 1]?.element

      if (!nextElement) {
        // 最后一个标题：内容区域到页面底部
        return document.documentElement.scrollHeight - currentElement.offsetTop
      }

      // 普通标题：到下一个标题的距离
      return nextElement.offsetTop - currentElement.offsetTop
    }

    /**
     * 判断是否接近页面底部
     */
    const isNearPageBottom = (): boolean => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      return scrollTop + windowHeight >= documentHeight - BOTTOM_THRESHOLD
    }

    /**
     * 更新激活的标题
     */
    const updateActiveHeading = () => {
      const viewportHeight = window.innerHeight
      const readingLineY = viewportHeight * READING_LINE_RATIO
      const scrollTop = window.scrollY

      // 特殊情况 1：接近页面底部 → 高亮最后一个标题
      if (isNearPageBottom()) {
        const lastHeading = headingElements[headingElements.length - 1]
        setActiveId(lastHeading.id)
        return
      }

      // 特殊情况 2：页面顶部 → 高亮第一个标题
      if (scrollTop < headingElements[0].element.offsetTop - readingLineY) {
        setActiveId(headingElements[0].id)
        return
      }

      // 遍历所有标题，找到最合适的激活标题
      let bestCandidate = headingElements[0]
      let bestScore = -Infinity

      for (let i = 0; i < headingElements.length; i++) {
        const { element } = headingElements[i]
        const rect = element.getBoundingClientRect()
        const contentHeight = getHeadingContentHeight(i)

        // 计算标题的评分（分数越高越适合高亮）
        let score = 0

        // 评分维度 1：标题距离阅读线的距离（越近越好）
        // 在阅读线上方 100px 内得分最高
        const distanceToReadingLine = Math.abs(rect.top - readingLineY)
        if (rect.top <= readingLineY && rect.top >= readingLineY - 100) {
          score += 1000 - distanceToReadingLine
        } else if (rect.top <= readingLineY) {
          // 标题在阅读线上方（已经滚过）
          score += 500 - distanceToReadingLine * 0.5
        } else {
          // 标题在阅读线下方（还没到）
          score += 200 - distanceToReadingLine
        }

        // 评分维度 2：内容区域在视口中的占比（越多越好）
        const contentTop = rect.top
        const contentBottom = rect.top + contentHeight
        const visibleTop = Math.max(contentTop, 0)
        const visibleBottom = Math.min(contentBottom, viewportHeight)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibleRatio = visibleHeight / contentHeight

        score += visibleRatio * 300

        // 评分维度 3：标题在视口顶部区域（优先显示）
        if (rect.top >= 0 && rect.top <= readingLineY * 2) {
          score += 400
        }

        // 更新最佳候选
        if (score > bestScore) {
          bestScore = score
          bestCandidate = headingElements[i]
        }
      }

      setActiveId(bestCandidate.id)
    }

    // 使用 Intersection Observer 监听标题可见性
    // 优势：性能好，不需要在滚动时频繁计算
    const observer = new IntersectionObserver(
      () => {
        // 当任何标题进入/离开视口时，更新激活状态
        updateActiveHeading()
      },
      {
        // rootMargin 扩展视口范围，提前触发回调
        // 上方扩展 20%，下方扩展 20%
        rootMargin: '-20% 0px -20% 0px',
        // 当标题进入/离开视口时触发
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    // 监听所有标题元素
    headingElements.forEach(({ element }) => {
      observer.observe(element)
    })

    // 监听滚动事件（用于处理边界情况，如页面底部）
    // 使用 requestAnimationFrame 节流
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveHeading()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // 初始化时执行一次
    updateActiveHeading()

    // 清理函数
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [items, setActiveId])
}

interface TableOfContentsProps {
  /** 文章容器的选择器，默认为 '.prose' */
  containerSelector?: string
  /** PC 端显示的标题数量，默认为 5 */
  showCount?: number
  /** 滚动行为，默认为 'smooth' */
  behavior?: 'smooth' | 'auto'
}

/**
 * 文章目录组件（Table of Contents）
 *
 * 功能：
 * - 自动提取文章中的 h2 和 h3 标题
 * - 使用 StaticTableOfContents 进行渲染
 */
export function TableOfContents({
  containerSelector = '.prose',
  behavior = 'smooth',
  showCount = 5,
}: TableOfContentsProps) {
  const [items, setItems] = useState<StaticTocItem[]>([])

  // 提取标题
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector)

    if (!container) return

    const extractedHeadings = extractHeadings(container)

    // 转换为 StaticTocItem 格式
    const tocItems: StaticTocItem[] = extractedHeadings.map((h) => ({
      id: h.id,
      title: h.text, // TocHeading 使用 text，StaticTocItem 使用 title
      level: h.level,
    }))

    setItems(tocItems)
  }, [containerSelector])

  if (items.length === 0) {
    return null
  }

  return <StaticTableOfContents items={items} behavior={behavior} showCount={showCount} />
}

/**
 * 静态目录组件（Static Table of Contents）
 *
 * 功能：
 * - 接收手动定义的 id 和 title 列表
 * - 滚动时高亮当前章节
 * - 点击标题平滑滚动到对应位置
 * - PC 端：固定在右侧，默认半透明只显示当前标题，hover 显示全部
 * - 移动端：隐藏（由移动端专用组件处理）
 */
export function StaticTableOfContents({
  items = [],
  showCount = 5,
  behavior = 'smooth',
}: StaticTableOfContentsProps) {
  return (
    <>
      <StaticTableOfContentsPC behavior={behavior} items={items} showCount={showCount} />
      <StaticTableOfContentsMobile behavior={behavior} items={items} />
    </>
  )
}

export interface StaticTocItem {
  id: string
  title: string
  level?: number
}

export interface StaticTableOfContentsProps {
  showCount?: number
  behavior?: 'smooth' | 'auto'
  items: StaticTocItem[]
}

/**
 * 静态目录组件（Static Table of Contents）
 *
 * 功能：
 * - 接收手动定义的 id 和 title 列表
 * - 滚动时高亮当前章节
 * - 点击标题平滑滚动到对应位置
 * - PC 端：固定在右侧，默认半透明只显示当前标题，hover 显示全部
 * - 移动端：隐藏（由移动端专用组件处理）
 */
export function StaticTableOfContentsPC({
  showCount = 5,
  items = [],
  behavior = 'smooth',
}: StaticTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isHovered, setIsHovered] = useState(false)

  // 使用更科学的高亮逻辑 hook
  useActiveHeading(items, setActiveId)

  // 如果没有标题，不渲染
  if (items.length === 0) {
    return null
  }

  // 过滤显示的标题（非 hover 时显示当前标题及前后共 5 个）
  const getVisibleHeadings = () => {
    if (isHovered || items.length <= showCount) {
      return items
    }

    const activeIndex = items.findIndex((h) => h.id === activeId)
    if (activeIndex === -1) {
      return items.slice(0, showCount)
    }

    // 尽量让当前标题居中，前后各显示 2 个
    let startIndex = Math.max(0, activeIndex - 2)
    let endIndex = startIndex + showCount

    // 如果后面不够，往前补
    if (endIndex > items.length) {
      endIndex = items.length
      startIndex = Math.max(0, endIndex - showCount)
    }

    return items.slice(startIndex, endIndex)
  }

  // 点击标题滚动到对应位置
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const offset = 160
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset

    window.scrollTo({ top: offsetPosition, behavior })

    // 更新 URL hash（不触发跳转）
    window.history.pushState(null, '', `#${id}`)
  }

  const visibleHeadings = getVisibleHeadings()

  return (
    <>
      {/* PC 端 TOC - 固定在右侧 */}
      <nav
        className="fixed top-1/2 right-4 z-10 hidden max-h-[70vh] w-60 -translate-y-1/2 overflow-y-auto opacity-48 transition-all! hover:opacity-100 xl:block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="文章目录"
      >
        {/* 标题 */}
        <div className="text-text-tertiary mb-4 text-xs font-medium">目录</div>

        {/* 标题列表 */}
        <ul className="text-sm">
          {items.map((item) => {
            const isActive = item.id === activeId
            const isH3 = item.level === 3
            const isVisible = visibleHeadings.some((h) => h.id === item.id)

            return (
              <li
                key={item.id}
                className={cn('overflow-hidden transition-all! duration-200', isH3 && 'pl-3')}
                style={{
                  maxHeight: isVisible ? '2rem' : '0',
                  marginBottom: isVisible ? '0.25rem' : '0',
                  opacity: isVisible ? 1 : 0,
                }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToHeading(item.id)
                  }}
                  className={cn(
                    'block w-full truncate text-left',
                    isActive
                      ? 'text-text-primary font-medium'
                      : isHovered
                        ? 'text-text-primary'
                        : 'text-text-tertiary',
                  )}
                  title={item.title}
                >
                  {item.title}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

/**
 * 移动端静态文章目录组件
 *
 * 功能：
 * - 接收手动定义的 items (id, title, level)
 * - 底部浮动按钮
 * - 点击展开抽屉显示完整目录
 * - 滚动时高亮当前章节
 * - 点击标题后自动关闭抽屉并滚动到对应位置
 */
export function StaticTableOfContentsMobile({
  items = [],
  behavior = 'smooth',
}: StaticTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  // 使用更科学的高亮逻辑 hook
  useActiveHeading(items, setActiveId)

  // 点击标题滚动到对应位置
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    const offset = 80
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior,
    })

    // 更新 URL hash（不触发跳转）
    window.history.pushState(null, '', `#${id}`)

    // 关闭抽屉
    setIsOpen(false)
  }

  // 如果没有 items，不渲染
  if (items.length === 0) {
    return null
  }

  return (
    <>
      {/* 浮动按钮 - 仅移动端显示 */}
      <button
        onClick={() => setIsOpen(true)}
        className="group/btn bg-bg-secondary border-border text-text-primary fixed right-4 bottom-10 z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all! hover:shadow-xl xl:hidden"
        aria-label="打开文章目录"
      >
        <MenuIcon className="h-6 w-6 transition-transform group-active/btn:scale-90" />
      </button>

      {/* 抽屉背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm xl:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 抽屉内容 */}
      <div
        className={cn(
          'bg-bg-primary border-border fixed right-0 bottom-0 z-50 h-[60vh] w-full transform rounded-t-2xl border-t shadow-2xl transition-all! duration-300 ease-in-out xl:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* 把手 */}
        <div
          className="absolute top-0 right-0 left-0 flex h-6 w-full items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="bg-border h-1 w-12 rounded-full" />
        </div>

        {/* 标题 */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4 pt-6">
          <span className="text-text-primary text-lg font-medium">目录</span>
          <button
            onClick={() => setIsOpen(false)}
            className="group/btn text-text-tertiary hover:text-text-primary p-1 transition-colors"
          >
            <CloseIcon className="h-5 w-5 transition-transform group-active/btn:scale-90" />
          </button>
        </div>

        {/* 列表 */}
        <div className="h-[calc(60vh-6rem)] overflow-y-auto px-6 py-4">
          <ul className="space-y-3">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <li key={item.id} className={cn(item.level === 3 && 'pl-4')}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToHeading(item.id)
                    }}
                    className={cn(
                      'block w-full truncate text-left transition-all duration-200',
                      isActive ? 'text-text-primary font-medium' : 'text-text-tertiary',
                    )}
                    title={item.title}
                  >
                    {item.title}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
