import { cn } from '@/lib/cn'
import { dayjs, TZ_SHANGHAI } from '@/lib/dayjs'
import { pages } from '@/lib/data'
import { siteConfig } from '@/lib/config'
// import { Noto_Serif_SC } from 'next/font/google'
import { RefreshButton } from '@/components/refresh-button'
import { ReadingComments } from './_components/comments'
import { generateCanonicalUrl, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo'
import { getReadingByDate, getLunarInfo } from '@/lib/reading'

import type { Metadata } from 'next'

// const notoSerifSC = Noto_Serif_SC({
//   weight: '400',
//   subsets: ['latin'],
//   display: 'swap',
//   preload: true,
// })

export const revalidate = 86400 // 缓存 1 天

export const metadata: Metadata = {
  title: pages.reading.title,
  description: pages.reading.description,
  alternates: {
    canonical: generateCanonicalUrl(pages.reading.slug),
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale.replace('-', '_'),
    url: generateCanonicalUrl(pages.reading.slug),
    title: `${pages.reading.title} | ${siteConfig.name}`,
    description: pages.reading.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: pages.reading.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${pages.reading.title} | ${siteConfig.name}`,
    description: pages.reading.description,
    images: [`${siteConfig.url}/opengraph-image`],
  },
}

export default async function ReadingDetailPage() {
  const reading = await getReadingByDate()

  // 获取农历信息
  const readingDate = new Date(reading.date)
  const lunar = getLunarInfo(readingDate)
  const day = dayjs(reading.date).tz(TZ_SHANGHAI).format('D')
  const yearMonth = dayjs(reading.date).tz(TZ_SHANGHAI).format('YYYY 年 M 月')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(
              pages.reading.title,
              pages.reading.description,
              pages.reading.slug,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首页', url: '/' },
              { name: pages.reading.title, url: pages.reading.slug },
            ]),
          ),
        }}
      />
      <div className={cn('mx-auto max-w-3xl px-2 py-12 sm:px-6')}>
        {/* 日期标题 - 文艺布局 */}
        <header className="relative mb-8 sm:mb-12">
          <div className="mb-6 flex items-center justify-between gap-2 text-sm italic opacity-60 sm:mb-8 sm:text-base">
            岛读：每日一篇名家短文
            <RefreshButton />
          </div>
          <div className="flex items-start justify-between gap-8">
            {/* 左侧：日期信息 */}
            <div className="flex items-end gap-4 sm:gap-6">
              {/* 大数字 */}
              <div className="text-7xl leading-none font-medium tracking-widest sm:text-9xl">
                {day}
              </div>

              {/* 右侧：阳历和农历 */}
              <div className="flex flex-col justify-center space-y-2">
                {/* 农历 */}
                <div className="text-xs opacity-50 sm:text-sm">
                  农历 {lunar.month}月{lunar.day}
                </div>

                {/* 节日 */}
                {lunar.festival && (
                  <div className="text-xs opacity-75 sm:text-sm">{lunar.festival}</div>
                )}

                {/* 阳历 */}
                <div className="text-sm opacity-75 sm:text-lg">
                  {yearMonth}，星期
                  {['日', '一', '二', '三', '四', '五', '六'][readingDate.getDay()]}
                </div>
              </div>
            </div>

            {/* 右侧：竖向 tip */}
            <div className="flex items-start">
              <div
                style={{ textCombineUpright: 'all' }} // 竖向排布文本优化，允许短文本横向排列
                className="text-sm tracking-widest [writing-mode:vertical-rl] sm:text-base"
              >
                {reading.tip}
              </div>
            </div>
          </div>
        </header>

        {/* 文章正文 */}
        <article className="mb-12 text-lg leading-relaxed">
          <div className="break-all whitespace-pre-line">
            {reading.content.trim().replaceAll('\n\n', '\n').replaceAll('\n', '\n\n')}
          </div>
        </article>

        {/* 作品信息 - 低调展示在正文后 */}
        <div className="mb-8 text-center sm:mb-16">
          <p className="mb-2 text-base opacity-50 sm:text-lg">{reading.name_formatted}</p>
          <p className="text-sm opacity-40">{reading.author}</p>
        </div>

        {/* 互动数据 */}
        <div className="border-border mb-12 flex items-center justify-center gap-8 border-y py-6 text-sm opacity-60">
          {reading.like_count > 0 && <span>{reading.like_count} 喜欢</span>}
          {reading.comment_count > 0 && <span>{reading.comment_count} 评论</span>}
        </div>

        {/* 评论区 */}
        <ReadingComments comments={reading.comments} />
      </div>
    </>
  )
}
