import { cn } from 'cn'
import { pages } from '@/lib/data'
import { thoughts } from '@/lib/data'
import { notFound } from 'next/navigation'
import { PostDate } from '@/components/post-date'
import { ZoomImage } from '@/components/zoom-image'
import { siteConfig } from '@/lib/config'
import { countWords } from '@/lib/word-count'
import { MarkdownLite } from '@/components/markdown-lite'
import { InteractionButton } from '@/components/interaction-button'
import { cleanMarkdownContent } from '@/lib/markdown'
import { getInteractionCounts } from '@/lib/interactions'
import { generateCanonicalUrl, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo'

import type { Metadata } from 'next'

export const revalidate = 14400 // 缓存 4 小时

export async function generateStaticParams() {
  return thoughts.map((thought) => ({ slug: thought.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const path = `${pages.thoughts.slug}/${id}`
  const thought = thoughts.find((t) => t.id === id)

  if (!thought) {
    return {
      title: 'Thought Not Found',
      description: 'The thought you are looking for does not exist.',
    }
  }

  return {
    title: `${pages.thoughts.title} #${id}`,
    description: cleanMarkdownContent(thought.content).slice(0, 160), // 从内容中提取描述，限制在 160 字符
    alternates: {
      canonical: generateCanonicalUrl(path),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: generateCanonicalUrl(path),
      title: `${pages.thoughts.title} #${id} | ${siteConfig.name}`,
      description: cleanMarkdownContent(thought.content).slice(0, 160), // 从内容中提取描述，限制在 160 字符
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${pages.thoughts.title} #${id}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pages.thoughts.title} #${id} | ${siteConfig.name}`,
      description: cleanMarkdownContent(thought.content).slice(0, 160), // 从内容中提取描述，限制在 160 字符
      images: [`${siteConfig.url}/opengraph-image`],
    },
  }
}

export default async function ThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const thought = thoughts.find((t) => t.id === id)

  if (!thought) {
    notFound()
  }

  const totalWords = countWords(thought?.content || '')
  const counts = await getInteractionCounts('thoughts', [id])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(
              `${pages.thoughts.title} #${id} | ${siteConfig.name}`,
              pages.thoughts.description,
              `${pages.thoughts.slug}/${id}`,
            ),
          ),
        }}
      />

      {/* Preconnect to external domains for better performance */}
      <link rel="preconnect" href="https://s2.loli.net" />
      <link rel="dns-prefetch" href="https://s2.loli.net" />
      <link rel="preconnect" href="https://image.viki.moe" />
      <link rel="dns-prefetch" href="https://image.viki.moe" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首页', url: '/' },
              { name: pages.thoughts.title, url: pages.thoughts.slug },
              { name: `#${id}`, url: `${pages.thoughts.slug}/${id}` },
            ]),
          ),
        }}
      />
      <div className="space-y-12 py-8 sm:py-12">
        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {pages.thoughts.title} #{id}
          </h1>
          <p className="text-text-secondary flex items-baseline gap-1">
            {siteConfig.author.name} 发布于 <PostDate date={thought.date} format="detail" />
            {totalWords >= 20 ? `，共 ${totalWords} 字` : ''}
          </p>
        </section>

        <section>
          <article id={thought.id} className="thought-card space-y-2 pb-4 sm:pb-6">
            {/* 文本内容 */}
            {thought.content && thought.content.trim() !== '' && (
              <MarkdownLite content={thought.content} />
            )}

            {/* 图片 */}
            {thought.images && thought.images.length > 0 && (
              <div
                className={cn(
                  'grid grid-cols-1 gap-2 pt-2',
                  thought.images.length > 1 ? 'sm:grid-cols-2' : '',
                )}
              >
                {thought.images.map((image, imageIndex) => {
                  return (
                    <div
                      key={imageIndex}
                      className="border-border flex w-full items-center justify-center overflow-hidden rounded-md border"
                      style={{ backgroundColor: 'var(--color-image-bg)' }}
                    >
                      <ZoomImage
                        src={image}
                        alt={
                          thought.content && thought.content.trim() !== ''
                            ? `${thought.content.slice(0, 20)}... 的图片 ${imageIndex + 1}`
                            : `${pages.thoughts.title} 图片 ${imageIndex + 1}`
                        }
                        width={800}
                        height={450}
                        sizes="(max-width: 640px) 100vw, 50vw"
                        preload
                        className={cn('aspect-video w-full object-contain')}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </article>
        </section>

        {typeof counts[thought.id] === 'number' && (
          <section className="flex items-center justify-center">
            <InteractionButton
              id={thought.id}
              type="thoughts"
              initialCount={counts[thought.id]}
              revalidatePagePath={['/thoughts', `/thoughts/${id}`]}
              className="text-lg sm:text-xl"
              iconClassName="text-2xl sm:text-3xl"
            />
          </section>
        )}
      </div>
    </>
  )
}
