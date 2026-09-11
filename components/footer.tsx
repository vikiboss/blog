import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import { siteConfig } from '@/lib/config'

function CopyrightText() {
  return (
    <span className="text-text-secondary">
      © {siteConfig.copyright.year.start}-{siteConfig.copyright.year.end} {siteConfig.author.name}.
      All rights reserved.
    </span>
  )
}

export function LicenseText({ className, short }: { className?: string; short?: boolean }) {
  return (
    <span className={cn('text-text-tertiary', className)}>
      {short ? '文章以' : '除特殊说明外，文章均以'}
      <a
        href={siteConfig.copyright.license.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-primary mx-1"
      >
        {siteConfig.copyright.license.name}
      </a>
      协议共享，转载请注明出处。
    </span>
  )
}

function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      <a
        href={siteConfig.author.github}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-primary"
        title="访问 GitHub 主页"
      >
        GitHub
      </a>
      <a
        href={siteConfig.links.rss}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-primary"
        title="RSS"
      >
        RSS
      </a>
      <a
        href={siteConfig.links.travellings}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-primary"
        title="开往，友链接力"
      >
        开往 · 友链接力
      </a>
    </div>
  )
}

function Tagline() {
  return (
    <div className="text-text-secondary flex items-center gap-2">
      <Link passHref href="/">
        <Image
          className="round-cobblestone inline-block rounded-full align-middle"
          src="/avatar.png"
          alt="头像"
          width={20}
          height={20}
        />
      </Link>
      {siteConfig.name}
    </div>
  )
}

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-border max-w-3xl border-t px-4 transition-opacity sm:px-6"
    >
      <div className="mx-auto w-full max-w-3xl pt-4 pb-16 sm:pt-6 sm:pb-20">
        {/* 移动端布局 */}
        <div className="flex flex-col gap-4 py-2 text-sm sm:hidden">
          <Tagline />
          <LicenseText short />
          <CopyrightText />
        </div>

        {/* 桌面端布局 */}
        <div className="hidden sm:block">
          <div className="flex flex-col gap-3 text-left text-xs">
            <Tagline />
            <LicenseText />
            <CopyrightText />
          </div>
        </div>
      </div>
    </footer>
  )
}
