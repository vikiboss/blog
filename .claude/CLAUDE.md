# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Viki 的个人博客，基于 Next.js 16 (App Router) + React 19 + Tailwind CSS v4 构建。纯 Markdown（不是 MDX）+ unified 生态处理内容。

## 开发命令

```bash
pnpm dev              # 开发模式（bun + next dev）
pnpm build            # 构建生产版本
pnpm type-check       # TypeScript 类型检查
pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式化
pnpm test             # 运行 vitest 单元测试
pnpm test -- <file>   # 运行单个测试文件
```

## 架构概览

### 渲染策略

- **文章页** — SSG，`generateStaticParams` 预生成所有 slug
- **OG 图片** — `opengraph-image.tsx` + `@vercel/og`，`force-static` 构建时生成
- **RSS** — `app/rss/route.ts`，动态 Route Handler
- **API** — `app/api/` 下的 Route Handler（如内容搜索）
- **大部分页面** — Server Components，仅交互部分（主题切换、图片缩放、互动按钮等）使用 Client Components

### 内容与数据

- **文章** — `posts/{年份}/*.md`，Front Matter 必须包含 `title`、`date`、`excerpt`，可选 `tags`、`draft`、`top`、`top_image`
- **结构化数据** — `data/*.json`（碎碎念、Mio 说、大事记、友链、收藏夹等），通过 `lib/data.ts` 统一导出
- **站点配置** — `data/site.json` → `lib/config.ts` 组装

### Markdown 处理（`lib/markdown.ts`）

统一使用一条 unified 处理链，主要插件：

- `remark-gfm` + `remark-breaks` — GFM 语法 + 换行
- `remark-spoiler`（自定义）— `||text||` 剧透语法
- `remark-emoji-pack`（自定义）— 表情包语法
- `rehype-sanitize` — HTML 安全过滤
- `rehype-pretty-code` — 双主题代码高亮（one-light / one-dark-pro）
- `rehype-slug` + `rehype-autolink-headings` — 标题锚点
- `rehype-zoom-image`（自定义）— 图片缩放标记
- `rehype-external-links` — 外部链接 `target="_blank"`

核心 API：`parseMarkdown()`（短内容）、`parseArticle()`（文章）、`parseMessage()`（留言板）、`parseMarkdownBatch()`（批量）

### 互动系统

基于 `@vercel/kv` 的配置驱动互动系统（`lib/interactions.ts`），支持点赞等互动，按天限制次数。

### 组件组织

- **页面专属组件** — 内聚在对应路由的 `_components/` 子目录中（如 `app/game/_components/`），page.tsx 用相对路径 import（`./_components/xxx`）
- **公共组件** — 保留在顶层 `components/`，用 `@/components/xxx` import
- **Server Actions** — `actions/` 目录
- `_components` 内部互引用 `./` 相对路径，引用公共模块用 `@/` alias

### 关键工具模块

| 模块 | 用途 |
|---|---|
| `lib/cn.ts` | `clsx` + `tailwind-merge` 合并类名，**必须使用**，禁止模板字符串拼接 |
| `lib/dayjs.ts` | dayjs 实例（相对时间 + 中文本地化） |
| `lib/seo.ts` | JSON-LD 结构化数据 + canonical URL |
| `lib/text-formatter.ts` | pangu 盘古之白 + 名词大小写规范化 |
| `lib/posts.ts` | 文章读取 + Jaccard 推荐算法 |
| `lib/reading-time.ts` | 阅读时间（中英混合 400 字/分钟） |
| `lib/word-count.ts` | 字数统计 |

### 页面路由

首页 `/`、文章详情 `/[slug]`、文章归档 `/posts`、碎碎念 `/thoughts`、Mio 说 `/mio-says`、大事记 `/timeline`、友链 `/friends`、储物箱 `/collection`、书影音 `/library`、电子游戏 `/game`、岛读 `/reading`、话匣子 `/messages`、关于 `/about`、RSS `/rss`

## 代码规范

### 命名

- **文件** — `kebab-case`（`theme-toggle.tsx`）
- **导出组件** — `PascalCase`（`export function ThemeToggle`）
- **工具函数** — `camelCase`
- **常量** — `SCREAMING_SNAKE_CASE`

### 格式化

无分号、单引号、尾随逗号、`printWidth: 100`、`tabWidth: 2`（Prettier 配置在 `package.json` 中）

### 样式

- Tailwind CSS v4，CSS-first 配置（无 `tailwind.config.ts`），主题变量在 `app/styles/vars.css`
- 全局样式入口 `app/globals.css`，拆分为 `app/styles/` 下的子文件
- 类名合并使用 `cn()`，不用模板字符串

### 图标

SVG 图标集中在 `icons/` 目录，每个图标独立组件，必须支持 `className` prop，使用 `currentColor`

### 中文排版

遵循盘古之白：中英混排加空格、中数混排加空格、使用中文标点
