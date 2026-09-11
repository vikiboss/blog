'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
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
      className="border-border bg-bg-primary/80 sticky top-0 z-40 max-w-3xl border-b px-4 backdrop-blur-sm select-none sm:px-6"
    >
      <div className="flex items-center justify-between py-2 sm:py-2.5">
        <Link href="/" passHref className="no-underline" onClick={handleTitleClick}>
          <div>
            <TitleTag className="text-text-primary text-sm font-semibold sm:text-base">
              {siteConfig.name}
            </TitleTag>
            <p className="text-text-tertiary hidden text-xs leading-tight sm:block">
              {siteConfig.tagline.replace(/[\.。~=!～!]$/, '')}
            </p>
          </div>
        </Link>

        <nav
          role="navigation"
          aria-label="主导航"
          className="flex items-center gap-2 text-xs sm:gap-4 sm:text-sm"
        >
          <Link
            href={pages.posts.slug}
            className={cn(
              'text-text-primary',
            )}
          >
            {pages.posts.title}
          </Link>

          <Link
            href={pages.thoughts.slug}
            className={cn(
              'text-text-primary',
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
              className={cn(
                'group/btn text-text-primary',
              )}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              <span className="inline-block transition-transform group-active/btn:scale-90">
                更多 ▾
              </span>
            </button>
            {isMoreOpen && (
              <div className="bg-bg-primary border-border absolute top-full right-0 mt-1 min-w-25 rounded-md border py-2 text-nowrap shadow">
                <Link
                  key={pages.mioSays.slug}
                  href={pages.mioSays.slug}
                  className={cn(
                    'text-text-primary',
                    'block px-4 py-2',
                  )}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.mioSays.title}
                </Link>

                {showSecret &&
                  SECRET_PAGES.map((page) => (
                    <Link
                      key={page.slug}
                      href={page.slug}
                      className={cn(
                        'text-text-primary',
                        'block px-4 py-2',
                      )}
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
                  className={cn(
                    'text-text-primary',
                    'block px-4 py-2',
                  )}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.about.title}
                </Link>

                <div className="border-border my-1 border-t" />

                <Link
                  href={pages.friends.slug}
                  className={cn(
                    'text-text-primary',
                    'block px-4 py-2',
                  )}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.friends.title}
                </Link>

                <a
                  href={pages.messages.slug}
                  className={cn(
                    'text-text-primary',
                    'block px-4 py-2',
                  )}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.messages.title}
                </a>

                <a
                  href={pages.reading.slug}
                  className={cn(
                    'text-text-primary',
                    'block px-4 py-2',
                  )}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {pages.reading.title}
                </a>

                <div className="sm:hidden">
                  <div className="border-border my-2 border-t" />
                  <a
                    href={siteConfig.author.github}
                    target="_blank"
                    className={cn(
                      'text-text-primary',
                      'block px-4 py-2',
                    )}
                    onClick={() => setIsMoreOpen(false)}
                  >
                    GitHub
                  </a>

                  <a
                    href={siteConfig.links.rss}
                    target="_blank"
                    className={cn(
                      'text-text-primary',
                      'block px-4 py-2',
                    )}
                    onClick={() => setIsMoreOpen(false)}
                  >
                    RSS
                  </a>

                  <a
                    href={siteConfig.links.travellings}
                    target="_blank"
                    className={cn(
                      'text-text-primary',
                      'block px-4 py-2',
                    )}
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
