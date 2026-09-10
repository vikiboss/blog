import Link from 'next/link'
import { cn } from '@/lib/cn'
import { PostDate } from './post-date'
import { DraftBadge } from './draft-badge'
import { ReadingTime } from './reading-time'
import { ViewTransition } from 'react'

import type { PostMetadata } from '@/lib/posts'
import type { PostDateProps } from './post-date'

interface PostListItemProps {
  dateFormat?: PostDateProps['format']
  gap?: '5rem' | '6rem'
  post: PostMetadata
}

export function PostListItem({ post, gap = '5rem', dateFormat }: PostListItemProps) {
  return (
    <article
      key={post.slug}
      className={cn(
        'grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 py-2 sm:py-1.5',
        gap === '5rem' && 'sm:grid-cols-[5rem_1fr_auto]',
        gap === '6rem' && 'sm:grid-cols-[6rem_1fr_auto]',
      )}
    >
      <div className="text-text-tertiary flex shrink-0 items-center gap-2 font-mono text-xs sm:text-sm">
        <PostDate date={post.date} format={dateFormat ?? 'month-day'} />
      </div>

      <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        {post.draft && <DraftBadge className="mt-0.5 hidden sm:inline" />}
        <ViewTransition name={`post-title-${post.slug}`} default="transform">
          <Link
            href={`/${post.slug}`}
            className="text-text-primary flex-1 text-sm leading-snug sm:text-base"
          >
            {post.title}
          </Link>
        </ViewTransition>
        <span className="text-text-tertiary hidden text-xs sm:inline sm:text-sm">
          #{post.topic}
        </span>
      </div>

      <div className="text-text-tertiary col-start-2 row-start-1 flex items-center gap-2 font-mono text-xs sm:col-start-3 sm:row-start-1 sm:text-sm">
        <span className="shrink-0 sm:hidden">·</span>
        <span className="shrink-0">
          <span className="inline sm:hidden">#{post.topic}</span>
        </span>
        <span className="shrink-0 sm:hidden">·</span>
        <span className="w-12 sm:w-16 shrink-0 sm:text-right">
          <ReadingTime minutes={post.readingTime} />
        </span>
        {post.draft && <DraftBadge className="inline sm:hidden" />}
      </div>

      {post.excerpt && (
        <p className="text-text-tertiary col-span-full text-xs leading-relaxed sm:col-span-2 sm:col-start-2 sm:row-start-2">
          {post.excerpt}
        </p>
      )}
    </article>
  )
}
