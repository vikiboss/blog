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
    title: pages.tech.title,
    description: pages.tech.description,
    alternates: {
      canonical: generateCanonicalUrl(pages.tech.slug),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: generateCanonicalUrl(pages.tech.slug),
      title: `${pages.tech.title} | ${siteConfig.name}`,
      description: pages.tech.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: pages.tech.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pages.tech.title} | ${siteConfig.name}`,
      description: pages.tech.description,
      images: [`${siteConfig.url}/opengraph-image`],
    },
  }
}

export default async function PostsPage() {
  const allPosts = await getAllPosts({ isOriginal: false })
  const posts = allPosts.filter((post) => !post.top)

  // 计算总字数
  const totalWords = allPosts.reduce((sum, post) => sum + post.wordCount, 0)

  // 按年份和月份分组
  const postsByYear = Object.groupBy(posts, (post) => dayjs(post.date).year())

  // 生成从最早文章到当前年份的完整年份列表
  const currentYear = dayjs().year()
  const earliestYear =
    posts.length > 0 ? Math.min(...posts.map((p) => dayjs(p.date).year())) : currentYear
  const allYears = Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => currentYear - i)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(pages.tech.title, pages.tech.description, pages.tech.slug),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首页', url: '/' },
              { name: pages.tech.title, url: pages.tech.slug },
            ]),
          ),
        }}
      />
      <div className="space-y-12 py-8 sm:py-12">
        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-3xl font-bold sm:text-4xl">{pages.tech.title}</h1>
          <p className="text-text-secondary">
            {`${pages.tech.description}共 ${allPosts.length.toLocaleString('zh-Hans-CN')} 篇，累计 ${totalWords.toLocaleString('zh-Hans-CN')} 字，按年份分组展示。`}
          </p>
        </section>

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
                  <span className="text-text-tertiary mx-1 text-base font-normal sm:text-lg">
                    ({yearPosts.length.toLocaleString('zh-Hans-CN')})
                  </span>
                </h2>
                <div className="border-border-secondary space-y-2 border-l-2 pl-4 sm:pl-6">
                  {hasNoPosts ? (
                    <p className="text-text-secondary text-xs italic opacity-60 sm:text-sm">
                      暂无文章，过阵子再来看看吧
                    </p>
                  ) : (
                    yearPosts.map((post) => (
                      <PostListItem key={post.slug} author={post.author} post={post} />
                    ))
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
