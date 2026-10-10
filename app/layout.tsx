import './globals.css'

import { pages } from '@/lib/data'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { siteConfig } from '@/lib/config'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/toast-provider'
import { GoogleAnalytics } from '@next/third-parties/google'
import { CloudflareAnalytics } from './_components/cloudflare-analytics'
import { generateCanonicalUrl } from '@/lib/seo'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next'

import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.theme.background.light },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.theme.background.dark },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
    keywords: siteConfig.keywords,
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      apple: '/apple-icon.png',
    },
    alternates: {
      canonical: generateCanonicalUrl('/'),
    },
    openGraph: {
      type: 'website',
      locale: siteConfig.locale.replace('-', '_'),
      url: siteConfig.url,
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: ['/opengraph-image'],
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        {/* <link rel="preconnect" href="https://www.googletagmanager.com" /> */}
        {/* <link rel="dns-prefetch" href="https://www.googletagmanager.com" /> */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={siteConfig.name}
          href={siteConfig.links.rss}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${pages.thoughts.title} | ${siteConfig.name}`}
          href={`${pages.thoughts.slug}${siteConfig.links.rss}`}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${pages.mioSays.title} | ${siteConfig.name}`}
          href={`${pages.mioSays.slug}${siteConfig.links.rss}`}
        />
        {siteConfig.seo.bing && <meta name="msvalidate.01" content={siteConfig.seo.bing} />}
        {siteConfig.seo.google && (
          <meta name="google-site-verification" content={siteConfig.seo.google} />
        )}
        {siteConfig.seo.baidu && (
          <meta name="baidu-site-verification" content={siteConfig.seo.baidu} />
        )}
      </head>
      <body className="font-case bg-bg-primary text-text-primary font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider />
          <div className="flex min-h-screen min-w-80 flex-col sm:mx-auto sm:max-w-3xl">
            <a href="#main-content" className="skip-to-content">
              跳转到主要内容
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              <div className="container mx-auto max-w-3xl px-4 sm:px-6">{children}</div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>

        {siteConfig.analytics.cloudflare && (
          <CloudflareAnalytics token={siteConfig.analytics.cloudflare} />
        )}

        {siteConfig.analytics.google && <GoogleAnalytics gaId={siteConfig.analytics.google} />}

        <VercelAnalytics />
        <VercelSpeedInsights />
      </body>
    </html>
  )
}
