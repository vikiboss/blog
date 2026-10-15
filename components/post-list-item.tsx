import Link from 'next/link'
import { cn } from 'cn'
import { PostDate } from './post-date'
import { DraftBadge } from './draft-badge'
import { ViewTransition } from 'react'

import type { PostMetadata } from '@/lib/posts'
import type { PostDateProps } from './post-date'

interface PostListItemProps {
  dateFormat?: PostDateProps['format']
  gap?: '5rem' | '6rem'
  post: PostMetadata
  author?: string
}

export function PostListItem({ post, gap = '5rem', author, dateFormat }: PostListItemProps) {
  return (
    <article
      key={post.slug}
      className={cn(
        'grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 py-2 sm:py-1.5',
        gap === '5rem' && 'sm:grid-cols-[5rem_1fr_auto]',
        gap === '6rem' && 'sm:grid-cols-[6rem_1fr_auto]',
      )}
    >
      <div className="text-text-secondary flex shrink-0 items-baseline gap-2 text-xs sm:text-sm">
        <PostDate date={post.date} format={dateFormat ?? 'month-day'} />
      </div>

      <div className="col-span-2 flex flex-col gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:flex-row sm:items-center">
        {post.draft && <DraftBadge className="mt-0.5 hidden sm:inline" />}
        <ViewTransition name={`post-title-${post.slug}`} default="transform">
          <Link href={`/${post.slug}`} className="link flex-1 text-sm leading-snug sm:text-base">
            {post.title}
          </Link>
        </ViewTransition>
        {author && <span className="text-text-secondary text-sm italic">作者: {author}</span>}
      </div>

      <div className="text-text-secondary col-start-2 row-start-1 flex items-center gap-2 font-mono text-xs sm:col-start-3 sm:row-start-1 sm:text-sm">
        {post.draft && <DraftBadge className="inline sm:hidden" />}
      </div>

      {post.excerpt && (
        <p className="text-text-secondary col-span-full text-xs leading-relaxed sm:col-span-2 sm:col-start-2 sm:row-start-2 sm:text-sm">
          {post.excerpt}
        </p>
      )}
    </article>
  )
}
