import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404',
  description: '页面走丢了',
}

export const dynamic = 'force-static'
export const revalidate = 31536000 // 缓存 1 年

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* 404 数字 */}
      <div className="relative mb-6">
        <div className="text-text-tertiary text-[100px] leading-none font-black opacity-24 sm:text-[140px] dark:opacity-36">
          404
        </div>
        <h1 className="text-text-primary absolute inset-0 flex items-center justify-center text-3xl font-bold text-nowrap sm:text-4xl">
          页面走丢了
        </h1>
      </div>

      {/* 描述文本 */}
      <p className="text-text-secondary mb-8 text-sm sm:text-base">
        你可能输错了地址，或者这个页面已经不存在了
      </p>

      <a href="/" className="text-text-primary">
        回到首页 →
      </a>
    </div>
  )
}
