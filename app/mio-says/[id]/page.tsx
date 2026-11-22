import { cn } from 'cn'
import { pages } from '@/lib/data'
import { mioSays } from '@/lib/data'
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
  return mioSays.map((mioSay) => ({ slug: mioSay.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  const path = `${pages.mioSays.slug}/${id}`
  const mioSay = mioSays.find((t) => t.id === id)

  if (!mioSay) {
    return {
      title: 'Mio Says Not Found',
      description: 'The Mio Says you are looking for does not exist.',
    }
  }

  return {
    title: `${pages.mioSays.title} #${id}`,
    description: cleanMarkdownContent(mioSay.content).slice(0, 160), // 从内容中提取描述，限制在 160 字符
    alternates: {
      canonical: generateCanonicalUrl(path),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: generateCanonicalUrl(path),
      title: `${pages.mioSays.title} #${id} | ${siteConfig.name}`,
      description: cleanMarkdownContent(mioSay.content).slice(0, 160), // 从内容中提取描述，限制在 160 字符
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${pages.mioSays.title} #${id}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pages.mioSays.title} #${id} | ${siteConfig.name}`,
      description: cleanMarkdownContent(mioSay.content).slice(0, 160), // 从内容中提取描述，限制在 160 字符
      images: [`${siteConfig.url}/opengraph-image`],
    },
  }
}

export default async function ThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const mioSay = mioSays.find((t) => t.id === id)

  if (!mioSay) {
    notFound()
  }

  const totalWords = countWords(mioSay?.content || '')
  const counts = await getInteractionCounts('mio-says', [id])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(
              `${pages.mioSays.title} #${id} | ${siteConfig.name}`,
              pages.mioSays.description,
              `${pages.mioSays.slug}/${id}`,
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
              { name: pages.mioSays.title, url: pages.mioSays.slug },
              { name: `#${id}`, url: `${pages.mioSays.slug}/${id}` },
            ]),
          ),
        }}
      />
      <div className="space-y-12 py-8 sm:py-12">
        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-mio-pink text-3xl font-bold sm:text-4xl">
            {pages.mioSays.title} #{id}
          </h1>
          <p className="text-text-secondary flex items-baseline gap-1">
            {siteConfig.lover.name} 发布于 <PostDate date={mioSay.date} format="detail" />
            {totalWords >= 20 ? `，共 ${totalWords} 字` : ''}
          </p>
        </section>

        <section
          // @ts-expect-error for custom css var
          style={{ '--accent-color': 'var(--color-mio-pink)' }}
        >
          <article id={mioSay.id} className="thought-card space-y-2 pb-4 sm:pb-6">
            {/* 文本内容 */}
            {mioSay.content && mioSay.content.trim() !== '' && (
              <MarkdownLite content={mioSay.content} />
            )}

            {/* 图片 */}
            {mioSay.images && mioSay.images.length > 0 && (
              <div
                className={cn(
                  'grid grid-cols-1 gap-2 pt-2',
                  mioSay.images.length > 1 ? 'sm:grid-cols-2' : '',
                )}
              >
                {mioSay.images.map((image, imageIndex) => {
                  return (
                    <div
                      key={imageIndex}
                      className="border-border flex w-full items-center justify-center overflow-hidden rounded-md border"
                      style={{ backgroundColor: 'var(--color-image-bg)' }}
                    >
                      <ZoomImage
                        src={image}
                        alt={
                          mioSay.content && mioSay.content.trim() !== ''
                            ? `${mioSay.content.slice(0, 20)}... 的图片 ${imageIndex + 1}`
                            : `${pages.mioSays.title} 图片 ${imageIndex + 1}`
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

        {typeof counts[mioSay.id] === 'number' && (
          <section className="flex items-center justify-center">
            <InteractionButton
              id={mioSay.id}
              type="mio-says"
              initialCount={counts[mioSay.id]}
              revalidatePagePath={['/mio-says', `/mio-says/${id}`]}
              className="text-lg sm:text-xl"
              iconClassName="text-2xl sm:text-3xl"
            />
          </section>
        )}
      </div>
    </>
  )
}
