import Image from 'next/image'
import { RSSIcon } from '@/components/rss-icon'
import { cn } from '@/lib/cn'

import type { Friend, FriendStatus } from '@/lib/data'

interface FriendCardProps {
  friend: Friend
}

const STATUS_CONFIG: Record<FriendStatus, { label: string }> = {
  archived: {
    label: '已归档',
  },
  active: {
    label: '活跃',
  },
  pending: {
    label: '等待确认',
  },
  offline: {
    label: '访问异常',
  },
  lost: {
    label: '已失联',
  },
}

export function FriendCard({ friend }: FriendCardProps) {
  const status = friend.status ?? 'active'
  const isActive = status === 'active'
  const isArchived = status === 'archived'
  const statusConfig = isActive || isArchived ? null : STATUS_CONFIG[status]

  return (
    <div
      id={friend.id}
      className={cn(
        'group relative flex items-start gap-3 opacity-80 hover:opacity-100',
        !isActive && 'grayscale hover:grayscale-0',
      )}
    >
      <a
        title={`${friend.name}: ${friend.description || '这位朋友有点懒，什么也没留下~'}`}
        href={friend.url}
        target="_blank"
        className="no-icon absolute inset-0"
        aria-label={`访问 ${friend.name} 的网站`}
      />

      <a href={friend.url} className="no-icon no-underline">
        {friend.avatar ? (
          <Image
            src={friend.avatar}
            alt={friend.name}
            width={54}
            height={54}
            className="border-border aspect-square shrink-0 rounded-lg border object-cover transition-all! group-hover:scale-110"
          />
        ) : (
          <div className="border-border bg-bg-secondary text-text-secondary flex h-14 w-14 shrink-0 items-center justify-center rounded border text-3xl font-semibold transition-all! group-hover:scale-110">
            {friend.name.charAt(0).toUpperCase()}
          </div>
        )}
      </a>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 sm:h-7!">
          <h3 className="text-text-primary truncate font-medium">{friend.name}</h3>
          {friend.rss && status === 'active' && (
            <div className="relative z-10">
              <RSSIcon href={friend.rss} tooltip="支持 RSS" className="z-10 sm:h-7! sm:w-7!" />
            </div>
          )}
          {statusConfig && (
            <span
              className={cn(
                'text-text-tertiary border-border relative z-10 inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] leading-none font-medium',
              )}
            >
              {statusConfig.label}
            </span>
          )}
        </div>

        <p className="text-text-tertiary line-clamp-2 truncate text-sm leading-relaxed text-nowrap">
          {friend.description || '这位朋友有点懒，什么也没留下~'}
        </p>
      </div>
    </div>
  )
}
