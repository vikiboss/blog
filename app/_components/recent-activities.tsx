import Link from 'next/link'
import { ImageIcon } from '@/components/image-icon'
import { RelativeTime } from '@/components/relative-time'
import { pages, type ShortPost } from '@/lib/data'
import { truncateText, cleanMarkdownContent } from '@/lib/markdown'

interface RecentActivitiesProps {
  title?: string
  shortPosts: ShortPost[]
  totalCount: number
  showMoreThreshold: number
}

/**
 * 最近动态组件（服务端组件）
 * 展示最新的碎碎念，随性卡片式风格
 */
export async function RecentActivities({
  title,
  shortPosts,
  totalCount,
  showMoreThreshold,
}: RecentActivitiesProps) {
  if (shortPosts.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <h2 className="text-text-secondary text-lg font-semibold">{title}</h2>

      {/* 使用网格布局，响应式 */}
      <div className="grid gap-2 sm:grid-cols-1 sm:gap-2.5">
        {shortPosts.map((thought) => {
          const hasImages = thought.images && thought.images.length > 0

          return (
            <article key={thought.id} className="relative space-y-1 bg-transparent">
              {/* 头部信息 */}
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary font-mono text-[11px] font-medium">
                  #{thought.id}
                </span>
                <span className="text-text-tertiary">·</span>
                <RelativeTime date={thought.date} className="text-text-tertiary text-[11px]" />
              </div>

              {/* 内容预览 */}
              {thought.content && thought.content.trim() !== '' && (
                <div className="flex items-center gap-2">
                  {hasImages && <ImageIcon />}
                  <Link href={`${pages.thoughts.slug}/${thought.id}`}>
                    <p className="text-text-primary line-clamp-1 text-xs leading-relaxed">
                      {truncateText(cleanMarkdownContent(thought.content), 60)}
                    </p>
                  </Link>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* 查看全部链接 */}
      {totalCount > showMoreThreshold && (
        <div className="pt-1">
          <a
            href={pages.thoughts.slug}
            className="text-text-secondary hover:text-text-primary text-[11px]"
          >
            查看全部（{totalCount.toLocaleString('zh-Hans-CN')}）→
          </a>
        </div>
      )}
    </section>
  )
}
