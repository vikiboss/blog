import { friends, pages } from '@/lib/data'
import { createHighlighter } from 'shiki/bundle-web.mjs'
import { siteConfig } from '@/lib/config'
import { FriendCard } from './_components/friend-card'
import { RandomFriends } from './_components/random-friends'
import { FriendJsonBlock } from './_components/friend-json-block'
import { generateCanonicalUrl, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo'

import type { Metadata } from 'next'

export const revalidate = 86400 // 缓存 1 天

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pages.friends.title,
    description: pages.friends.description,
    alternates: {
      canonical: generateCanonicalUrl(pages.friends.slug),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: generateCanonicalUrl(pages.friends.slug),
      title: `${pages.friends.title} | ${siteConfig.name}`,
      description: pages.friends.description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: pages.friends.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pages.friends.title} | ${siteConfig.name}`,
      description: pages.friends.description,
      images: [`${siteConfig.url}/opengraph-image`],
    },
  }
}

const shiki = await createHighlighter({
  themes: ['one-dark-pro', 'one-light'],
  langs: ['json'],
})

const json = JSON.stringify(
  {
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.tagline,
    avatar: `${siteConfig.url}${siteConfig.links.avatar}`,
    rss: `${siteConfig.url}/rss`,
  },
  null,
  2,
)

export default async function FriendsPage() {
  const html = shiki.codeToHtml(json, {
    lang: 'json',
    theme: 'one-dark-pro',
    defaultColor: false,
    cssVariablePrefix: '--shiki-',
    transformers: [
      {
        pre(this, hast) {
          hast.properties.style = 'margin: 0;'
          return hast
        },
      },
    ],
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(
              pages.friends.title,
              pages.friends.description,
              pages.friends.slug,
            ),
          ),
        }}
      />
      {/* 头像服务 */}
      <link rel="preconnect" href="https://q1.qlogo.cn" />
      <link rel="dns-prefetch" href="https://q1.qlogo.cn" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首页', url: '/' },
              { name: pages.friends.title, url: pages.friends.slug },
            ]),
          ),
        }}
      />
      <div className="space-y-4 py-8 sm:space-y-8 sm:py-12">
        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-3xl font-bold sm:text-4xl">友链</h1>
          <p className="text-text-secondary">
            {`${pages.friends.description}。共收录 ${friends.filter((f) => f.status !== 'archived').length} 位好友。`}
          </p>
        </section>

        {/* Friend Link Info */}
        <section className="prose border-border-tertiary">
          <details>
            <summary>
              <div className="text-base font-semibold">交换友链 （点击展开）</div>
            </summary>
            <div className="text-text-secondary space-y-4 text-sm">
              <div>
                本博客支持展示以下内容，仅名称和地址必须。如需交换，请按以下格式在
                <a href="/messages" className="mx-1">
                  话匣子
                </a>
                页面留言。
              </div>
              <FriendJsonBlock html={html} json={json} />
              <div>
                注：建议贵站建站半年以上、站点稳定、原创为主、非商业化。交换完记得经常来玩！
              </div>
            </div>
          </details>
        </section>

        {/* Friends Grid */}
        <section>
          <RandomFriends friends={friends} />
        </section>
      </div>
    </>
  )
}
