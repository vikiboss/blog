'use client'

import Link from 'next/link'
import { cn } from 'cn'
import { RSSIcon } from './rss-icon'
import { useEffect, useRef, useState } from 'react'
import { pages } from '@/lib/data'
import { siteConfig } from '@/lib/config'
import { GitHubIcon } from './github-icon'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { TravellingsIcon } from './travellings-icon'
import { SearchTrigger } from './search/search-trigger'
import { toast } from 'sonner'
import { printEasterEgg } from '@/lib/easter-egg'
import { TriangleDownIcon } from '@/icons/triangle-down'

const SECRET_PAGES = [pages.library, pages.game, pages.timeline] as const

const CLICK_THRESHOLD = 3
const CLICK_WINDOW_MS = 2000
const EASTER_EGG_KEY = 'easter-egg-unlocked'

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const TitleTag = isHome ? 'h1' : 'div'
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const consolePrinted = useRef(false)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (localStorage.getItem(EASTER_EGG_KEY) === 'true') {
      setShowSecret(true)
    }

    if (consolePrinted.current) return
    consolePrinted.current = true

    printEasterEgg(SECRET_PAGES, siteConfig.url)
  }, [])

  function handleTitleClick(e: React.MouseEvent) {
    clickCount.current += 1

    if (clickCount.current > 1) {
      e.preventDefault()
    }

    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0
    }, CLICK_WINDOW_MS)

    if (clickCount.current >= CLICK_THRESHOLD) {
      clickCount.current = 0
      if (clickTimer.current) clearTimeout(clickTimer.current)
      setShowSecret(true)
      localStorage.setItem(EASTER_EGG_KEY, 'true')
      toast('隐藏页面已解锁，可在「更多」中查看 ✦')
    }
  }

  return (
    <header
      role="banner"
      className="border-border bg-bg-primary/72 sticky top-0 z-40 max-w-3xl border-b px-4 backdrop-blur-sm select-none sm:px-6"
    >
      <div className="flex items-center justify-between py-1 sm:py-2">
        <Link href="/" passHref onClick={handleTitleClick}>
          <TitleTag className="text-sm font-semibold sm:text-base">{siteConfig.name}</TitleTag>
          <p className="text-text-secondary hidden text-xs leading-tight sm:block">
            {siteConfig.tagline.replace(/[\.。~=!～!]$/, '')}
          </p>
        </Link>

        <nav
          role="navigation"
          aria-label="主导航"
          className="flex items-center text-sm sm:text-base"
        >
          <Link
            href={pages.posts.slug}
            className={cn(
              'active:bg-bg-secondary sm:hover:bg-bg-tertiary rounded px-1.5 py-0.5 font-medium',
            )}
          >
            {pages.posts.title}
          </Link>

          <Link
            href={pages.tech.slug}
            className={cn(
              'active:bg-bg-secondary sm:hover:bg-bg-tertiary rounded px-1.5 py-0.5 font-medium',
            )}
          >
            {pages.tech.title}
          </Link>

          <Link
            href={pages.thoughts.slug}
            className={cn(
              'active:bg-bg-secondary sm:hover:bg-bg-tertiary rounded px-1.5 py-0.5 font-medium',
            )}
          >
            {pages.thoughts.title}
          </Link>

          {/* <Link
            href={pages.mioSays.slug}
            className={cn(
              'text-text-primary',
            )}
          >
            {pages.mioSays.title}
          </Link> */}

          {/* <Link
            href={pages.about.slug}
            className={cn(
              'text-text-primary',
            )}
            onClick={() => setIsMoreOpen(false)}
          >
            {pages.about.title}
          </Link> */}

          {/* "更多"下拉菜单 */}
          <div className="relative flex items-center">
            <button
              onClick={() => {
                setIsMoreOpen(!isMoreOpen)
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setTimeout(() => {
                    setIsMoreOpen(false)
                  }, 150)
                }
              }}
              className={cn('group/btn text-text-primary px-2 py-1 font-medium')}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              <span className="inline-flex items-center transition-transform group-active/btn:scale-90">
                更多
                <TriangleDownIcon className="size-4" />
              </span>
            </button>
            {isMoreOpen && (
              <div className="bg-bg-primary border-border-tertiary absolute top-full right-0 mt-1 min-w-25 rounded-md border font-medium text-nowrap shadow-sm">
                <Link
                  key={pages.mioSays.slug}
                  href={pages.mioSays.slug}
                  className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.mioSays.title}
                </Link>

                {showSecret &&
                  SECRET_PAGES.map((page) => (
                    <Link
                      key={page.slug}
                      href={page.slug}
                      className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                      onClick={() => {
                        setIsMoreOpen(false)
                      }}
                    >
                      {page.title}
                    </Link>
                  ))}

                <Link
                  key={pages.about.slug}
                  href={pages.about.slug}
                  className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.about.title}
                </Link>

                <div className="border-border my-1 border-t" />

                <Link
                  href={pages.friends.slug}
                  className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.friends.title}
                </Link>

                <a
                  href={pages.messages.slug}
                  className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.messages.title}
                </a>

                <a
                  href={pages.reading.slug}
                  className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.reading.title}
                </a>

                <div className="sm:hidden">
                  <div className="border-border my-2 border-t" />
                  <a
                    href={siteConfig.author.github}
                    target="_blank"
                    className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                    onClick={() => setIsMoreOpen(false)}
                  >
                    GitHub
                  </a>

                  <a
                    href={siteConfig.links.rss}
                    target="_blank"
                    className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                    onClick={() => setIsMoreOpen(false)}
                  >
                    RSS
                  </a>

                  <a
                    href={siteConfig.links.travellings}
                    target="_blank"
                    className={cn('hover:bg-bg-tertiary block px-2 py-1 m-1 rounded')}
                    onClick={() => setIsMoreOpen(false)}
                  >
                    开往 · 友链接力
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <GitHubIcon href={siteConfig.author.github} className="hidden sm:flex" />
            <RSSIcon href={siteConfig.links.rss} className="hidden sm:flex" />
            <TravellingsIcon href={siteConfig.links.travellings} className="hidden sm:flex" />
            <SearchTrigger />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
