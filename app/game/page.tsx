import { SteamProfile } from './_components/steam-profile'
import { SteamGameLibrary } from './_components/steam-game-library'
import { OtherGames } from './_components/other-games'
import { CS2Inventory } from './_components/cs2-inventory'
import { HokSkins } from './_components/hok-skins'
import { siteConfig } from '@/lib/config'
import { pages } from '@/lib/data'
import { getHokSkins } from '@/lib/hok'
import { RefreshButton } from '@/components/refresh-button'
import { generateCanonicalUrl, generateBreadcrumbSchema, generateWebPageSchema } from '@/lib/seo'
import { StaticTableOfContents } from '@/components/table-of-contents'
import { getSteamProfile, getLibraryGames, getRecentlyPlayed, getCS2Inventory } from '@/lib/steam'

import type { Metadata } from 'next'

export const revalidate = 600 // 缓存 10 分钟

export const metadata: Metadata = {
  title: pages.game.title,
  description: pages.game.description,
  alternates: {
    canonical: generateCanonicalUrl(pages.game.slug),
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale.replace('-', '_'),
    url: generateCanonicalUrl(pages.game.slug),
    title: `${pages.game.title} | ${siteConfig.name}`,
    description: pages.game.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: pages.game.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${pages.game.title} | ${siteConfig.name}`,
    description: pages.game.description,
    images: [`${siteConfig.url}/opengraph-image`],
  },
}

export default async function GamePage() {
  // 在服务端并行获取所有游戏数据
  const [profile, libraryGames, recentGames, cs2Inventory] = await Promise.all([
    getSteamProfile(),
    getLibraryGames(),
    getRecentlyPlayed(),
    getCS2Inventory(),
  ])

  // // 在服务端并行获取所有游戏数据
  // const [profile, libraryGames, recentGames, cs2Inventory, hokSkins] = await Promise.all([
  //   getSteamProfile(),
  //   getLibraryGames(),
  //   getRecentlyPlayed(),
  //   getCS2Inventory(),
  //   getHokSkins(),
  // ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateWebPageSchema(pages.game.title, pages.game.description, pages.game.slug),
          ),
        }}
      />
      {/* Preconnect to external domains for better performance */}
      <link rel="preconnect" href="https://s2.loli.net" />
      <link rel="dns-prefetch" href="https://s2.loli.net" />

      <link rel="preconnect" href="https://avatars.steamstatic.com" />
      <link rel="dns-prefetch" href="https://avatars.steamstatic.com" />

      <link rel="preconnect" href="https://shared.akamai.steamstatic.com" />
      <link rel="dns-prefetch" href="https://shared.akamai.steamstatic.com" />

      <link rel="preconnect" href="https://community.akamai.steamstatic.com" />
      <link rel="dns-prefetch" href="https://community.akamai.steamstatic.com" />

      <link rel="preconnect" href="https://game-1255653016.file.myqcloud.com" />
      <link rel="dns-prefetch" href="https://game-1255653016.file.myqcloud.com" />

      <StaticTableOfContents
        items={[
          { id: 'profile', title: '个人资料', level: 1 },
          { id: 'library', title: 'Steam 游戏', level: 1 },
          { id: 'cs2', title: 'Counter-Strike 2 库存', level: 1 },
          { id: 'other', title: '其他游戏', level: 1 },
          // { id: 'hok', title: '王者皮肤', level: 1 },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: '首页', url: '/' },
              { name: pages.game.title, url: pages.game.slug },
            ]),
          ),
        }}
      />
      <div className="space-y-8 py-8 sm:space-y-12 sm:py-12">
        {/* Header */}
        <section className="space-y-3" id="title">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold sm:text-4xl">{pages.game.title}</h1>
            <RefreshButton />
          </div>
          <p className="text-text-secondary">{`${pages.game.description}。`}</p>
        </section>

        {/* Steam 个人资料卡片 - 纯服务端组件 + 客户端刷新按钮 */}
        <SteamProfile id="profile" profile={profile} />

        {/* Steam 游戏库 - 纯服务端组件 + 客户端视图切换 */}
        <SteamGameLibrary id="library" libraryGames={libraryGames} recentGames={recentGames} />

        {/* CS2 库存 - 纯服务端组件 */}
        <CS2Inventory id="cs2" items={cs2Inventory} />

        {/* 其他游戏 - 纯 SSR 数据 */}
        <OtherGames id="other" />

        {/* 王者皮肤 - 纯服务端组件 */}
        {/* <HokSkins id="hok" data={hokSkins} /> */}
      </div>
    </>
  )
}
