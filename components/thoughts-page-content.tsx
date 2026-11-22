'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { LazyImage } from './lazy-image'
import { RelativeTime } from './relative-time'
import { InteractionButton } from './interaction-button'
import { StaticTableOfContents, type StaticTocItem } from './table-of-contents'
import { pages } from '@/lib/data'
import { cleanMarkdownContent } from '@/lib/markdown'
import { getThoughtsPage, type PagedThoughtItem, type PostType } from '@/actions/thoughts'
import { CodeBlockEnhancer } from './code-block-enhancer'

interface ThoughtCardClientProps {
  thought: PagedThoughtItem
  index: number
  total: number
  mioTheme?: boolean
  contentPrefix?: string
}

function ThoughtCardClient({
  thought,
  index,
  total,
  mioTheme,
  contentPrefix,
}: ThoughtCardClientProps) {
  const shouldPriority = index < 3
  const slug = mioTheme ? pages.mioSays.slug : pages.thoughts.slug

  return (
    <article
      id={thought.id}
      className="thought-card space-y-2 pb-4 sm:pb-6"
      style={{
        borderBottom:
          index < total - 1
            ? mioTheme
              ? '1px solid var(--color-mio-border)'
              : '1px solid rgba(128, 128, 128, 0.1)'
            : 'none',
      }}
    >
      <div className="flex items-center gap-2 text-sm">
        <a
          href={`${slug}/${thought.id}`}
          className="link"
          style={
            mioTheme
              ? {
                  color: 'var(--color-mio-pink)',
                  textDecorationColor: 'var(--color-mio-pink)',
                }
              : undefined
          }
        >
          #{thought.id}
        </a>
        <span className="text-text-secondary">·</span>
        <RelativeTime date={thought.date} className="text-text-secondary" />
        {typeof thought.initialCount === 'number' && (
          <>
            <span className="text-text-secondary">·</span>
            <InteractionButton
              id={thought.id}
              type={mioTheme ? 'mio-says' : 'thoughts'}
              initialCount={thought.initialCount}
              revalidatePagePath={slug}
            />
          </>
        )}
      </div>

      {thought.html && (
        <CodeBlockEnhancer>
          <div className="prose" dangerouslySetInnerHTML={{ __html: thought.html }} />
        </CodeBlockEnhancer>
      )}

      {thought.images && thought.images.length > 0 && (
        <div
          className={cn(
            'grid grid-cols-1 gap-2 pt-1',
            thought.images.length > 1 ? 'sm:grid-cols-2' : '',
          )}
        >
          {thought.images.map((image, imageIndex) => (
            <div
              key={imageIndex}
              className="border-border flex w-full items-center justify-center overflow-hidden rounded-md border"
              style={{ backgroundColor: 'var(--color-image-bg)' }}
            >
              <LazyImage
                src={image}
                alt={
                  thought.content && thought.content.trim() !== ''
                    ? `${thought.content.slice(0, 20)}... 的图片 ${imageIndex + 1}`
                    : `${contentPrefix}图片 ${imageIndex + 1}`
                }
                width={800}
                height={450}
                className="w-full"
                sizes="(max-width: 640px) 100vw, 50vw"
                preload={shouldPriority && imageIndex === 0}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

function itemToToc(item: PagedThoughtItem): StaticTocItem {
  return {
    id: item.id,
    title: `#${item.id} ${item.content ? cleanMarkdownContent(item.content) : '无内容'}...`,
  }
}

interface ThoughtsPageContentProps {
  type: PostType
  initialItems: PagedThoughtItem[]
  initialHasMore: boolean
  mioTheme?: boolean
  contentPrefix?: string
  emptyMessage?: string
}

export function ThoughtsPageContent({
  type,
  initialItems,
  initialHasMore,
  mioTheme = false,
  contentPrefix = '碎碎念',
  emptyMessage = '还没有内容，快来记录吧',
}: ThoughtsPageContentProps) {
  const [items, setItems] = useState<PagedThoughtItem[]>(initialItems)
  const [tocItems, setTocItems] = useState<StaticTocItem[]>(() => initialItems.map(itemToToc))
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(2)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const result = await getThoughtsPage(type, page)
      setItems((prev) => [...prev, ...result.items])
      setTocItems((prev) => [...prev, ...result.items.map(itemToToc)])
      setHasMore(result.hasMore)
      setPage((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [type, page, loading, hasMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (items.length === 0) {
    return <p className="text-text-secondary text-sm italic">{emptyMessage}</p>
  }

  return (
    <>
      <StaticTableOfContents behavior="auto" items={tocItems} />
      <div
        className="space-y-8"
        // @ts-expect-error for custom css var
        style={mioTheme ? { '--accent-color': 'var(--color-mio-pink)' } : undefined}
      >
        {items.map((item, index) => (
          <ThoughtCardClient
            key={item.id}
            thought={item}
            index={index}
            total={items.length}
            mioTheme={mioTheme}
            contentPrefix={contentPrefix}
          />
        ))}
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loading && <div className="text-text-secondary text-sm">加载中...</div>}
          </div>
        )}
      </div>
    </>
  )
}
