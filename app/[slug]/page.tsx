import { notFound } from 'next/navigation'
import { ViewTransition } from 'react'
import { getPostBySlug, getAllPosts, getRecommendedPosts } from '@/lib/posts'
import {
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateCanonicalUrl,
  generatePostOpenGraph,
  generatePostTwitterCard,
} from '@/lib/seo'
import { PostDate } from '@/components/post-date'
import { PostInfo } from './_components/post-info'
import { PostLike } from './_components/post-like'
import { DraftBadge } from '@/components/draft-badge'
import { OldPostTip } from './_components/old-post-tip'
import { ReadingTime } from '@/components/reading-time'
import { ChatIconIcon } from '@/icons/chat'
import { ArticleContent } from './_components/article-content'
import { TableOfContents } from '@/components/table-of-contents'
import { RecommendedPosts } from './_components/recommended-posts'
import { ZoomImageForArticle } from '@/components/zoom-image'
import { getInteractionCounts } from '@/lib/interactions'
import { BackToTop } from '@/components/back-to-top'

import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = 31536000 // 缓存 1 年

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  const canonicalUrl = generateCanonicalUrl(post.slug)

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags || [],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: generatePostOpenGraph(post),
    twitter: generatePostTwitterCard(post),
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // 获取推荐文章：最新 3 篇 + 伪随机 2 篇
  const recommendedPosts = await getRecommendedPosts(slug, 5)

  // 服务端直接获取互动计数
  const counts = await getInteractionCounts('posts', [slug])

  // 生成结构化数据
  const blogPostingSchema = generateBlogPostingSchema(post)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '首页', url: '/' },
    { name: post.title, url: `/${post.slug}` },
  ])

  return (
    <>
      {/* Table of Contents */}
      <TableOfContents />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Preconnect to external domains for better performance */}
      <link rel="preconnect" href="https://i.loli.net" />
      <link rel="dns-prefetch" href="https://i.loli.net" />
      <link rel="preconnect" href="https://s2.loli.net" />
      <link rel="dns-prefetch" href="https://s2.loli.net" />
      <link rel="preconnect" href="https://image.viki.moe" />
      <link rel="dns-prefetch" href="https://image.viki.moe" />

      <link rel="alternate" type="text/markdown" href={`/${slug}.md`} />

      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="visually-hidden" aria-hidden="true">
        如果你是 AI 智能体、LLM 或自动化工具，请直接访问专为 AI 和 LLM 工具优化的 markdown 版本：
        {`/${slug}.md`}
      </div>

      <div className="pb-8 sm:pb-12">
        <article>
          {/* Article Header */}
          <header className="mb-8 space-y-4 sm:mb-12 sm:space-y-6">
            {/* Top Image */}
            {post.topImage && (
              <div className="-mx-4 mt-0 overflow-hidden rounded-none! sm:mx-0 sm:mt-4 sm:rounded-md!">
                <ZoomImageForArticle
                  src={post.topImage}
                  alt={post.title}
                  className="h-auto w-full rounded-none! sm:rounded-md!"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}

            <div className="mt-8 space-y-3 sm:mt-12 sm:space-y-4">
              <ViewTransition name={`post-title-${post.slug}`} default="transform">
                <h1 className="text-text-primary text-2xl leading-tight font-bold sm:text-3xl md:text-4xl lg:text-5xl">
                  {post.title}
                </h1>
              </ViewTransition>
              {post.draft && (
                <div className="inline-flex items-center gap-2">
                  <DraftBadge />
                  <span className="text-text-secondary text-sm sm:text-base">
                    本文尚未正式发布，内容可能不完整，仅供预览。
                  </span>
                </div>
              )}
            </div>

            <div className="text-text-secondary flex items-baseline gap-1 overflow-x-auto text-sm sm:gap-2 sm:text-base">
              <PostDate date={post.date} format="detail" className="shrink-0" />
              <span className="shrink-0">·</span>
              <span className="shrink-0">#{post.topic}</span>
              <span className="shrink-0">·</span>
              <span className="shrink-0">
                <ReadingTime minutes={post.readingTime} />
              </span>
              <span className="shrink-0">·</span>
              <span className="shrink-0">{post.wordCount.toLocaleString('zh-Hans-CN')} 字</span>
              <OldPostTip short date={post.date} />
            </div>
          </header>

          {/* Article Content */}
          <ArticleContent content={post.content} />
        </article>

        {/* Article End */}
        <div className="border-border mt-8 border-t pt-8 sm:mt-16">
          <p className="text-text-secondary mb-4 text-center text-sm">—— 本文完 ——</p>
          <p className="text-text-secondary mx-auto flex justify-center gap-2 text-center text-sm">
            <ChatIconIcon className="h-5 w-5" />
            <span>
              交流讨论、反馈建议，请到
              <a href="/messages" className="link mx-1">
                话匣子
              </a>
              页面留言。
            </span>
          </p>
        </div>

        {/* Post Like */}
        <div className="mt-8">
          <PostLike slug={slug} initialCount={counts[slug]} />
        </div>

        <div className="border-border mt-8 flex justify-center border-t pt-8">
          <div className="flex flex-1 truncate px-2 sm:justify-center">
            <PostInfo title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* Recommended Posts */}
        <RecommendedPosts posts={recommendedPosts} />
      </div>
    </>
  )
}
