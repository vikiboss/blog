/**
 * Button - 通用按钮组件
 * 统一样式，支持不同尺寸，children 可包含文本和图标
 */

import { cn } from 'cn'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ size = 'md', className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // 基础样式
        'group/btn inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'text-text-primary',

        // 只在未 disabled 时生效的交互效果
        'enabled:hover:bg-bg-tertiary enabled:hover:text-text-primary',
        'enabled:active:bg-bg-tertiary enabled:active:text-text-primary',

        // disabled 状态
        'disabled:cursor-not-allowed disabled:opacity-50',

        // 尺寸样式
        size === 'sm' && 'px-2 py-1 text-xs',
        size === 'md' && 'px-2.5 py-1.5 text-xs sm:text-sm',
        size === 'lg' && 'px-3 py-2 text-sm sm:text-base',

        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span className="inline-flex items-center gap-1.5 transition-transform group-active/btn:scale-90">
        {children}
      </span>
    </button>
  )
}
