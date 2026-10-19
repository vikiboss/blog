/**
 * Message Card - 留言卡片
 * 显示作者信息、留言内容、UA 信息
 */

import { parseMessage } from '@/lib/markdown'
import { MessageAuthor } from './message-author'
import { CollapsibleContent } from './collapsible-content'

import type { Message } from '@/lib/messages'
import type { ReactNode } from 'react'

interface MessageCardProps {
  message: Message
  actions?: ReactNode
}

export async function MessageCard({ message, actions }: MessageCardProps) {
  const html = await parseMessage(message.content)

  return (
    <article className="group border-border-secondary bg-bg-primary rounded-lg border p-4 transition">
      {/* 头部：作者信息 */}
      <div className="mb-3">
        <MessageAuthor author={message.author} createdAt={message.createdAt} ua={message.ua} />
      </div>

      {/* 留言内容 */}
      <CollapsibleContent html={html} maxLines={18} />

      {/* 操作按钮 */}
      {actions}
    </article>
  )
}
