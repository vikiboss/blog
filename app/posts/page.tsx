import { dayjs } from '@/lib/dayjs'
import { pages } from '@/lib/data'
import { siteConfig } from '@/lib/config'
import { PostListItem } from '@/components/post-list-item'
import { getAllPosts, type PostMetadata } from '@/lib/posts'
import { YEAR_DESC_MAP } from '@/lib/year-desc'
import { generateCanonicalUrl, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo'

import type { Metadata } from 'next'

export const revalidate = 86400 // 缓存 1 天

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pages.posts.title,
    description: pages.posts.description,
    alternates: {
      canonical: generateCanonicalUrl(pages.posts.slug),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: generateCanonicalUrl(pages.posts.slug),
      title: `${pages.posts.title} | ${siteConfig.name}`,
      description: pages.posts.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: pages.posts.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pages.posts.title} | ${siteConfig.name}`,
      description: pages.posts.description,
      images: [`${siteConfig.url}/opengraph-image`],
    },
  }
}

export default async function PostsPage() {
  const allPosts = await getAllPosts()
  const pinnedPosts = allPosts.filter((post) => post.top)
  const posts = allPosts.filter((post) => !post.top)

  // 计算总字数
  const totalWords = allPosts.reduce((sum, post) => sum + post.wordCount, 0)

  // 按年份和月份分组
  const postsByYear = Object.groupBy(posts, (post) => dayjs(post.date).year())

  const getPostsByMonth = (yearPosts: PostMetadata[]) => {
    const grouped = Object.groupBy(yearPosts, (post) => dayjs(post.date).month())
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([month, posts]) => ({ month: Number(month), posts: posts! }))
  }

  // 生成从最早文章到当前年份的完整年份列表
  const currentYear = dayjs().year()
  const earliestYear =
    posts.length > 0 ? Math.min(...posts.map((p) => dayjs(p.date).year())) : currentYear
  const allYears = Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => currentYear - i)

  // 空年份提示语
  const emptyYearMessages = [
    '这一年的想法还在酝酿中',
    '这一年选择了沉淀与思考',
    '这一年暂时放下了写作',
    '这一年在积累更多的灵感',
    '这一年在探索新的领域',
    '这一年在享受生活的美好',
  ]

  const getEmptyYearMessage = (year: number) => {
    // 根据年份确定性地选择一条提示语
    const index = year % emptyYearMessages.length
    return emptyYearMessages[index]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(pages.posts.title, pages.posts.description, pages.posts.slug),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首页', url: '/' },
              { name: pages.posts.title, url: pages.posts.slug },
            ]),
          ),
        }}
      />
      <div className="space-y-12 py-8 sm:py-12">
        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-3xl font-bold sm:text-4xl">{pages.posts.title}</h1>
          <p className="text-text-secondary">
            {`${pages.posts.description}，共 ${allPosts.length.toLocaleString('zh-Hans-CN')} 篇，累计 ${totalWords.toLocaleString('zh-Hans-CN')} 字，按年份分组展示。`}
          </p>
        </section>

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-text-primary text-xl font-bold sm:text-2xl">
              置顶{' '}
              <span className="text-text-tertiary text-base font-normal sm:text-lg">
                ({pinnedPosts.length.toLocaleString('zh-Hans-CN')})
              </span>
            </h2>
            <div className="border-border-tertiary space-y-1 border-l-2 pl-4 sm:pl-6">
              {pinnedPosts.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Posts by Year */}
        <section className="space-y-12">
          {allYears.map((year) => {
            const yearPosts = postsByYear[year] || []
            const hasNoPosts = yearPosts.length === 0

            return (
              <div key={year} className="space-y-4 sm:space-y-6">
                {/* 年份标题 */}
                <h2 className="text-text-primary text-xl font-bold sm:text-2xl">
                  <span>{year}</span>
                  <span className="text-text-tertiary/60 mx-1">/</span>
                  <span className="text-text-tertiary">{YEAR_DESC_MAP.get(year)}</span>
                  <span className="text-text-tertiary mx-1 text-base font-normal sm:text-lg">
                    ({yearPosts.length.toLocaleString('zh-Hans-CN')})
                  </span>
                </h2>
                <div className="border-border-tertiary space-y-2 border-l-2 pl-4 sm:pl-6">
                  {hasNoPosts ? (
                    <p className="text-text-tertiary text-xs italic opacity-60 sm:text-sm">
                      {getEmptyYearMessage(year)}
                    </p>
                  ) : (
                    yearPosts.map((post) => <PostListItem key={post.slug} post={post} />)
                  )}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </>
  )
}
