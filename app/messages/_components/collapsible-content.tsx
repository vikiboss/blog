'use client'

import { useState } from 'react'
import { ChevronUpIcon } from '@/icons/chevron-up'
import { ChevronDownIcon } from '@/icons/chevron-down'
import { CodeBlockEnhancer } from '@/components/code-block-enhancer'

interface CollapsibleContentProps {
  html: string
  maxLines?: number
}

export function CollapsibleContent({ html, maxLines = 3 }: CollapsibleContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showButton, setShowButton] = useState(false)

  // 检测内容是否被截断
  const checkOverflow = (element: HTMLDivElement | null) => {
    if (!element) return
    setShowButton(element.scrollHeight > element.clientHeight)
  }

  return (
    <CodeBlockEnhancer>
      <div className="relative">
        <div
          ref={(el) => {
            if (el && !isExpanded) checkOverflow(el)
          }}
          className="message-content prose prose-sm dark:prose-invert max-w-none"
          style={!isExpanded ? { maxHeight: `${maxLines * 1.72}em`, overflow: 'hidden' } : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {showButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group/btn text-text-primary mt-1.5 inline-flex items-center justify-center text-xs font-medium transition-colors"
          >
            <span className="inline-flex items-center gap-0.5 transition-transform group-active/btn:scale-90">
              {isExpanded ? '收起' : '更多'}
              {isExpanded ? (
                <ChevronUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              )}
            </span>
          </button>
        )}
      </div>
    </CodeBlockEnhancer>
  )
}
