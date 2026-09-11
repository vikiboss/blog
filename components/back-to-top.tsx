'use client'

import { cn } from '@/lib/cn'
import { useEffect, useState } from 'react'
import { ChevronUpIcon } from '@/icons/chevron-up'

/**
 * 回到顶部按钮组件
 *
 * 功能：
 * - 滚动到一定距离后显示，带淡入动画
 * - 点击后平滑滚动到页面顶部
 * - 移动端：圆形按钮，位于目录按钮上方
 * - PC 端：圆形按钮，固定在右下角
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 滚动阈值：滚动超过 300px 后显示按钮
    const SCROLL_THRESHOLD = 300

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsVisible(scrollTop > SCROLL_THRESHOLD)
    }

    // 监听滚动事件
    window.addEventListener('scroll', handleScroll, { passive: true })

    // 初始化时检查一次
    handleScroll()

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 点击回到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {/* 移动端按钮 - 位于目录按钮上方 */}
      <button
        onClick={scrollToTop}
        className={cn(
          'group/btn bg-bg-secondary border-border text-text-primary fixed right-4 bottom-24 z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all! hover:shadow-xl xl:hidden',
          isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        aria-label="回到顶部"
      >
        <ChevronUpIcon className="h-6 w-6 transition-transform group-active/btn:scale-90" />
      </button>

      {/* PC 端按钮 - 固定在右下角 */}
      <button
        onClick={scrollToTop}
        className={cn(
          'group/btn bg-bg-secondary border-border text-text-primary fixed right-8 bottom-8 z-40 hidden h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all! hover:shadow-xl xl:flex',
          isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        aria-label="回到顶部"
      >
        <ChevronUpIcon className="h-6 w-6 transition-transform group-active/btn:scale-90" />
      </button>
    </>
  )
}
