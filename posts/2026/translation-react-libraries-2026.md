---
title: '[译] 2026 年 React 核心库怎么选'
date: 2026-10-11
topic: '技术'
excerpt: '介绍 2026 年值得了解的 React 核心库、常见的基础组件。'
original: false
author: 'Robin Wieruch'
tags:
  - 'React'
  - 'npm 包'
  - '解决方案'
  - '生态系统'
---

> 原文：React Libraries for 2026
>
> 时间：2026 年 5 月 26 日
>
> 作者：Robin Wieruch
>
> 链接：https://www.robinwieruch.de/react-libraries/

---

React 已经发展了相当长的时间。多年来，围绕它形成了庞大（有时也令人眼花缭乱）的生态系统。对于从其他语言或框架转过来的开发者来说，要弄清楚使用 React 构建 Web 应用究竟需要哪些库，往往并不容易。

从本质上说，React 让开发者能够使用 [函数组件](https://www.robinwieruch.de/react-function-component/) 构建以组件为中心的用户界面。React 内置了 [React Hooks](https://www.robinwieruch.de/react-hooks/) 等机制，用于管理本地状态、处理副作用和优化性能，但归根结底，我们仍然是在组合函数（组件和 Hooks）来构建 UI。

本文将介绍 2026 年值得了解的 React 核心库。这些库是使用 React 开发大型应用时常见的基础组件。无论你刚开始学习 React，还是已经有丰富的开发经验，这份指南都能帮助你更轻松地了解庞大的 React 生态。

下面就来看看开发下一个 React 应用时可以考虑使用哪些库。

## 创建新的 React 项目

React 初学者经常会问的第一个问题是：如何搭建 React 项目？可选工具很多，挑选合适的工具可能让人无从下手。在 React 社区中，最受欢迎的选择之一是 [Vite](https://vitejs.dev/)。它可以轻松创建使用不同库（例如 React）的项目，也支持按需启用 TypeScript。Vite 的 [性能也非常出色](https://twitter.com/rwieruch/status/1491093471490412547)。

如果你已经熟悉 React，也可以考虑直接使用流行的 React（元）框架，而不是 Vite。[Next.js](https://nextjs.org/) 是广泛使用的选择，它构建于 React 之上，因此掌握 [React 基础知识](https://www.roadtoreact.com/)十分重要。Next.js 内置了许多功能，例如多种渲染方式、基于文件的路由以及 API 路由。

Next.js 最初主要用于服务端渲染（Web 应用），如今也可用于静态站点生成，并支持 ISR 等其他渲染模式。Next.js 近年的重要变化是引入了 React Server Components（RSC，React 服务端组件）和 React Server Functions（RSF，React 服务端函数）。自 2023 年以来，它们推动了一场重要的范式转变：将部分 React 组件从客户端移到服务端执行。

快速崛起的 Next.js 替代方案是 [TanStack Start](https://tanstack.com/start)，它于 2026 年 3 月发布了 1.0 版本。它将 TanStack Router 的类型安全路由与基于文件的路由、服务端函数和 SSR 结合起来。RSC 支持目前仍处于实验阶段，但已列入规划。如果你看重成熟度和生态系统，Next.js 仍然是默认选择，如果你追求一流的类型安全和 TanStack 的开发体验，那么 TanStack Start 也值得尝试。

另一个选择是 [React Router](https://reactrouter.com/) v7。它于 2024 年末与 Remix 合并，如今既可以作为路由库使用，也可以作为完整框架使用，提供 Loaders、Actions、可选的 SSR 以及实验性的 RSC 支持。

如果你最关注静态内容的性能，可以看看 [Astro](https://astro.build/)。它与具体框架无关，能够很好地与 React 配合使用，即使组件是用 React 编写的，发送到浏览器的也可以只有 HTML 和 CSS。只有在组件需要交互能力时，才会加载 JavaScript，从而优化页面性能。

如果你只是想弄清楚 Vite 之类的工具是如何工作的，可以尝试 [手动搭建 React 项目](https://www.robinwieruch.de/minimal-react-webpack-babel-setup/)。从最基础的 HTML 和 JavaScript 项目开始，再自行添加 React 及其配套工具（例如 Webpack、Babel）。日常开发中通常不必这样做，尤其是 Vite 已逐渐取代 Webpack 成为主流选择之后，不过，亲手搭建一次仍然是了解底层工具链的好方法。

如果你是资深 React 开发者，想尝试一些新东西，可以看看 [RedwoodSDK](https://rwsdk.com/)（以 Cloudflare 为优先、服务端优先的 React 方案，支持 RSC，自 2025 年末起提供 1.0 beta。原来的 RedwoodJS 已更名为 Redwood GraphQL），或者 [Waku](https://github.com/dai-shi/waku)。Waku 由 Zustand 的开发者创建，原生支持 RSC，目前处于 1.0 alpha 阶段。

还有一点值得在新项目中留意：[React Compiler](https://react.dev/blog/2025/10/07/react-compiler-1) 于 2025 年 10 月达到 1.0 版本，并已得到 Vite、Next.js 和 Expo 的开箱支持。它会自动对组件和 Hooks 进行记忆化优化，因此大多数手动使用 `useMemo` 和 `useCallback` 的场景都可以减少。

**推荐：**

- 面向客户端渲染的 React 应用：Vite
- 面向全栈开发的 React 应用：Next.js（同时值得关注新兴的 TanStack Start）
- 面向静态站点生成的 React 应用：Astro

## React 包管理器

在 JavaScript 生态（也包括 React）中，安装库，也就是依赖和 npm 包时，使用最广泛的包管理器是 [npm](https://www.npmjs.com/)，因为它随每个 Node.js 安装包一起提供。[pnpm](https://pnpm.io/) 是有力的替代方案，凭借安装速度和磁盘空间利用率优势，已经成为许多新项目的默认选择。[Bun](https://bun.sh/) 则是快速成长的第三个选项：它是一套一体化工具链，集包管理器、运行时、打包器和测试运行器于一身，安装速度尤其快，采用率也在迅速提升。

如果你要开发多个相互依赖的 React 应用，或者多个应用需要共享一组自定义 UI 组件，可以了解一下 monorepo（单体仓库）模式。npm 和 pnpm 都通过 workspaces 支持 monorepo，其中 pnpm 尤其适合这种场景。再搭配 [Turborepo](https://turborepo.org/) 等 monorepo 流水线工具，开发体验会更完善。对于规模更大或包含多种语言的项目，[Nx](https://nx.dev/) 提供了功能更全面的 monorepo 平台。

**推荐：**

- 选择一种包管理器，并在项目中保持一致。
  - 默认且最普及：npm
  - 性能更好，但普及度略低：pnpm
- 如果需要 monorepo，可以了解 Turborepo。

## React 状态管理

React 内置了两个用于管理本地状态的 Hook：[useState](https://www.robinwieruch.de/react-usestate-hook) 和 [useReducer](https://www.robinwieruch.de/react-usereducer-hook/)。对于全局状态，[useContext](https://www.robinwieruch.de/react-usecontext-hook/) 可以让你将数据从顶层组件传递给更深层的组件，而不必层层传递 [props](https://www.robinwieruch.de/react-pass-props-to-component/)，从而避免 prop drilling（属性逐层传递）。

这三个 Hook 已经足以实现强大的状态管理：可以通过 `useState`/`useReducer` 将状态放在组件附近管理，也可以结合 `useContext` 来管理全局状态。

如果你发现自己频繁使用 React Context 来管理共享或全局状态，那么一定要看看 [Zustand](https://github.com/pmndrs/zustand)。它可以管理全局应用状态，任何连接到对应 Store 的 React 组件都可以读取和修改这些状态。

如今，Zustand 已经成为 React 社区中公认的全局状态管理标准。就我个人而言，自 2021 年以来，我几乎没有再使用过其他状态管理库。TanStack Query 负责服务端状态，React 内置 Hooks 负责本地状态，而 URL 则可以承载共享的 UI 状态，因此真正需要专用 Store 的场景已经少了很多。你仍然会在旧版 React 应用中经常遇到 Redux，如果确实需要全局 Store，Zustand 是一个合理的选择。

如果你使用 Redux，也应该了解一下 [Redux Toolkit](https://redux-toolkit.js.org/)。如果你偏好状态机，[XState](https://github.com/statelyai/xstate) 是最成熟的选择。如果需要全局 Store，但不喜欢 Zustand 或 Redux，也可以看看其他流行的状态管理方案，例如原子化状态管理库 [Jotai](https://github.com/pmndrs/jotai)，或 [MobX](https://github.com/mobxjs/mobx)（它仍在维护中，但如今更多出现在旧代码库中）。

还有一种值得了解的模式：将筛选条件、标签页和分页等状态保存在 URL 中。[nuqs](https://nuqs.dev/) 提供了带类型的搜索参数，以及类似 Hook 的 API。它与具体框架无关，Sentry、Supabase、Vercel 和 Clerk 都在使用它。

**推荐：**

- 使用 `useState`/`useReducer` 管理组件内部或共享状态。
- 按需使用 `useContext`，管理少量全局状态。
- 如果全局状态较多，可以使用 Zustand 或其他替代方案。

## React 数据获取

React 内置的 Hooks 很适合管理 UI 状态，但如果要管理远程数据的状态（也就是缓存）和执行数据获取，我建议使用专门的数据获取库，例如 [TanStack Query](https://tanstack.com/query)，它以前叫作 React Query。

TanStack Query 主要用于从 API 获取远程数据，因此通常不会被视为传统的状态管理库。不过，它会负责管理远程数据的各种状态，例如缓存和乐观更新。

TanStack Query 最初是为消费 [REST API](https://www.robinwieruch.de/node-express-server-rest-api/) 而设计的，如今也支持 [GraphQL](https://www.roadtographql.com/)。如果你希望使用更专门的 GraphQL 库，可以选择 [Apollo Client](https://www.apollographql.com/docs/react/)（v4 更轻量，与 React 解耦，并考虑了 React Compiler 兼容性）、轻量级的 [urql](https://formidable.com/open-source/urql/)，或为 Meta 内部规模设计、场景相对小众的 [Relay](https://github.com/facebook/relay)。

如果你已经在使用 Redux，并希望在 Redux 中集成数据获取和状态管理，那么可以考虑 [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)，而不是再引入 TanStack Query。RTK Query 与 Redux 集成得十分紧密。

如果前端和后端都由你掌控，而且两端都使用 TypeScript，可以看看 [tRPC](https://trpc.io/)，它能提供端到端的类型安全 API，显著提升开发效率和开发体验。你也可以将它与 TanStack Query 结合使用，在通过带类型的函数调用后端的同时，获得数据获取库提供的各种便利功能。

最后，如果你使用的（元）框架支持 React Server Components/Server Functions（RSC/RSF），例如 Next.js，也可以直接利用它们获取数据。你可以在服务端获取数据，再将数据传递给客户端，从而避免使用客户端数据获取库。

**推荐：**

- 服务端数据获取：
  - 如果所用的（元）框架支持，优先考虑 React Server Components/Functions。
- 客户端数据获取：
  - REST API 或 GraphQL API：TanStack Query。
  - 可搭配 Axios 或 [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 使用。
  - GraphQL API：Apollo Client。
  - 如果需要更完善的 GraphQL 开发体验，可考虑专门的 GraphQL 方案。
- 前后端紧密耦合的架构：tRPC。

## 使用 React Router 进行路由管理

如果你使用 Next.js 这样的 React 框架，路由功能通常已经内置。对于 Next.js 之外的项目，最流行的路由库是 [React Router](https://reactrouter.com/)。React Router 现在提供两种模式：一种是用于客户端路由的传统库模式（例如在 Vite SPA 中使用），另一种是完整框架模式（即原来的 Remix），提供 loaders、actions、服务端渲染和实验性的 RSC 支持。

另一个强有力的替代方案是 [TanStack Router](https://tanstack.com/router)。它目前已经稳定，尤其适合在 React 项目中使用 TypeScript 的开发者。与 TanStack 家族其他工具一样，在 API 设计和类型推断方面表现出色。

React Router 和 TanStack Router（搭配 TanStack Start）都在推进对 React Server Components（RSC）的支持。这意味着某些组件可以在服务端执行，以满足不同需求，例如减小打包体积或在服务端获取数据。

如果你刚开始学习 React，还不急着在项目中引入路由器，可以先尝试了解 [React 的条件渲染](https://www.robinwieruch.de/conditional-rendering-react/)。条件渲染不能取代路由，但能帮助你理解如何在页面层级切换组件。

**推荐：**

- 服务端路由：Next.js、React Router（框架模式）或 TanStack Start。
- 客户端路由：
  - 使用最广泛：React Router。
  - 值得关注的新选择：TanStack Router。

## React 中的 CSS 样式

React 中有很多 CSS 样式方案，也存在大量不同观点，因此仅用一个章节很难讲清楚。如果你想深入了解这一主题并掌握各种选择，可以阅读下面的指南。

React 初学者可以先在 JSX 中使用 `style` 对象编写内联样式。不过，在真正的应用中，这种方式应该谨慎使用：

```javascript
const Headline = ({ title }) => <h1 style={{ color: 'blue' }}>{title}</h1>
```

React 的 JSX 内联样式可以通过 JavaScript 动态设置，其他样式可以放在独立 CSS 文件里：

```javascript
import './Headline.css'

const Headline = ({ title }) => (
  <h1 className="headline" style={{ color: 'blue' }}>
    {title}
  </h1>
)
```

当应用逐渐变大时，还可以考虑其他样式方案。在继续之前补充一点：如果需要在 React 中有条件地应用 `className{:.string}`，可以使用 [clsx](https://github.com/lukeed/clsx) 这样的工具库。

首先，我推荐 [Tailwind CSS](https://tailwindcss.com/)，它是最流行的 Utility-First CSS（实用优先 CSS）方案。Tailwind 提供预定义的 CSS 类，可以提高开发效率，并让 React 应用的设计系统更统一。不过，代价是需要熟悉大量工具类，而且 JSX 中可能会出现很长的类名列表：

```javascript
const Headline = ({ title }) => <h1 className="text-blue-700">{title}</h1>
```

Tailwind v4 于 2025 年 1 月发布，是当前的主要版本。配置方式已从 `tailwind.config.js{:.string}` 转移到 CSS 中的 `@theme{:css}`，新的 Oxide 引擎显著提升了速度，内容来源也会自动检测。如果你要启动新项目，通常应从 v4 开始。

其次，可以考虑 CSS Modules。它是众多 CSS-in-CSS 方案之一，能够将 CSS 封装在与组件相邻的模块中，避免样式意外影响其他组件：

```javascript
import styles from './style.module.css'

const Headline = ({ title }) => <h1 className={styles.headline}>{title}</h1>
```

第三种方案是 CSS-in-JS，例如 [styled-components](https://www.robinwieruch.de/react-styled-components/) 和 [Emotion](https://emotion.sh/)。这类库可以把样式和 React 组件放在一起：

```javascript
import styled from 'styled-components'

const BlueHeadline = styled.h1`
  color: blue;
`

const Headline = ({ title }) => <BlueHeadline>{title}</BlueHeadline>
```

对于新项目，我不推荐使用这两种方案。styled-components 自 2025 年 3 月起 [正式进入维护模式](https://github.com/orgs/styled-components/discussions/5657)，维护者也建议不要在新项目中采用它。Emotion 仍在维护，但如今主要因为 MUI v5 及之后的版本依赖它而继续广泛存在。两者都通过 React Context 在运行时处理样式，这与 React Server Components 的工作方式存在冲突，也正是现代替代方案转向构建时编译的原因。

目前的趋势已经明显转向 Utility-First CSS，而 Tailwind CSS 是业界标准。若团队希望保留 CSS-in-JS 的编写体验，同时避免运行时开销，可以选择 [PandaCSS](https://panda-css.com/)（零运行时，由 Chakra/Zag 的作者开发，也是 Chakra UI v3 的基础）或 [vanilla-extract](https://vanilla-extract.style/)（以 TypeScript 为先，使用类型安全的 `.css.ts` 文件）。[StyleX](https://stylexjs.com/) 是 Meta 的原子化 CSS-in-JS 方案，[UnoCSS](https://unocss.dev/) 则是比 Tailwind 更灵活的实用优先方案。

此外，React 19 原生支持 `<style>` 的优先级处理和去重，缓解了 CSS-in-JS 过去试图解决的一些问题。因此，纯 CSS Modules 或 Tailwind CSS 比以往更值得考虑。

**推荐：**

- Utility-First CSS（最流行），例如 Tailwind CSS。
- CSS-in-CSS，例如 CSS Modules。
- 如果希望用 JavaScript 驱动样式，又不想承担运行时开销，可以选择构建时 CSS-in-JS，例如 PandaCSS 或 vanilla-extract。

## React UI 组件库

对于初学者来说，从零开始构建可复用组件，是一种很有价值、也很值得推荐的学习方式。无论是 [下拉菜单](https://www.robinwieruch.de/react-dropdown/)、[选择框](https://www.robinwieruch.de/react-select/)、[单选按钮](https://www.robinwieruch.de/react-radio-button/) 还是 [复选框](https://www.robinwieruch.de/react-checkbox/)，最终都应该了解如何自行实现这些 UI 组件。

不过，如果你没有足够的时间和资源从头开发所有组件，可以使用 UI 组件库。它提供大量预构建组件，并让这些组件遵循统一的设计系统、功能规范和无障碍要求：

- [Material UI（MUI）](https://material-ui.com/)（在自由职业项目中仍很常见）
- [Mantine](https://mantine.dev/)（v8，2026 年综合实力很强的方案之一）
- [Chakra UI](https://chakra-ui.com/)（v3，基于 PandaCSS 重写）
- [Hero UI](https://www.heroui.com/)（前身为 Next UI）
- [Park UI](https://park-ui.com/)（基于 Ark UI）
- [PrimeReact](https://primereact.org/)
- [Ant Design](https://ant.design/)（在企业级和数据密集型 B2B 项目中仍是常见的默认选择）

不过，整体趋势正转向无头（headless）UI 库。这类库不提供预设样式，但提供现代组件库所需的功能和无障碍支持。它们通常会与 Tailwind 等 Utility-First CSS 方案搭配使用：

- [shadcn/ui](https://ui.shadcn.com/)（自 2023 年已成为公认标准，2026 年可选基于 Radix 或 Base UI 原语安装组件区块）
- [Radix](https://www.radix-ui.com/)（`shadcn/ui` 最初采用的基础组件方案）
- [Base UI](https://base-ui.com/)（由 Radix、Floating UI 和 MUI 的作者打造，2026 年发布 1.0，如今与 Radix 一样，是 `shadcn/ui` 的一等支持目标）
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
- [Ark UI](https://ark-ui.com/)（由 Chakra UI 团队打造，基于 Zag 状态机）
- [Ariakit](https://ariakit.org/)
- [Daisy UI](https://daisyui.com/)（v5，兼容 Tailwind v4，已悄然成为下载量最高的 UI 库之一）
- [Headless UI](https://headlessui.com/)
- [Tailwind UI](https://www.tailwindui.com/)（付费）

如果你喜欢 Bootstrap，也可以使用 [React Bootstrap](https://react-bootstrap.github.io/)，前提是它符合项目所需的设计风格。

## React 动画库

Web 应用中的动画通常可以从 CSS 开始。不过，当需求逐渐复杂时，你会发现仅靠 CSS 动画可能无法满足所有要求。React 中常见的动画库包括：

- [Motion](https://motion.dev/)（公认标准，前身为 Framer Motion，v12 已全面支持 React 19）
- [react-spring](https://www.react-spring.dev/)（适合基于物理效果的动画，是相对小众的选择）
- [GSAP](https://gsap.com/)（被 Webflow 收购后改用 MIT 许可证，适合复杂的时间轴动画）

## React 可视化与图表库

如果你真的想从头开始构建图表，就离不开 [D3](https://d3js.org/)。它是一个底层可视化库，提供了构建精彩图表所需的各种能力。不过，学习 D3 本身就是一段不短的旅程，因此很多开发者会选择 React 图表库，以一定的灵活性为代价换取开箱即用的体验。常见方案包括：

- [Recharts](http://recharts.org/)（个人推荐，`shadcn/ui` 图表基于它构建）
  - 提供开箱即用的图表。
  - 组合能力出色。
  - 可以按需组合组件并进行定制。
- [Tremor](https://tremor.so/)
  - 预设计的图表组件，与 `shadcn/ui` 的视觉风格一致。
  - 在 SaaS 仪表盘中很受欢迎。
- [visx](https://github.com/airbnb/visx)
  - 更接近底层 D3，而不是高度封装的抽象。
  - 学习曲线更陡。
- 其他开箱即用程度更高、但定制相对困难的图表库：
  - [nivo](https://nivo.rocks/)
  - [react-chartjs](https://github.com/reactchartjs/react-chartjs-2)
  - [Victory](https://formidable.com/open-source/victory/)（其开发速度已放缓，目前更活跃的开发主要集中在 Victory Native XL）

## React 表单库

React 生态中最受欢迎的表单库无疑是 [React Hook Form](https://react-hook-form.com/)。它提供了表单所需的大部分功能，包括校验（最常见的选择是 [Zod](https://github.com/colinhacks/zod)）、表单提交、表单状态管理等。对于刚开始在 React 中处理表单的开发者来说，这是一个很好的起点。

还有两个替代方案值得了解：

- [TanStack Form](https://tanstack.com/form) 已经稳定，并且正在迅速普及，如果你需要类型安全的复杂表单，或者已经使用 TanStack 生态中的其他工具，它尤其值得考虑。
- [Conform](https://conform.guide/) 适合渐进增强服务端 Action 表单，尤其 Next.js App Router 或 React Router 框架模式。

在现有代码库中，你可能仍会遇到 [Formik](https://github.com/jaredpalmer/formik) 或 [React Final Form](https://final-form.org/react)，但两者目前实际上都已缺乏维护，因此不建议用于新项目。

**推荐：**

- React Hook Form，并结合 Zod 进行校验。

## React 代码规范与结构

如果你希望团队采用统一、合理的代码风格，可以在 React 项目中使用 [ESLint](https://eslint.org/)。ESLint 这样的代码检查工具能够强制执行特定的代码规范。例如，你可以要求项目遵循某份流行的风格指南。还可以将 [ESLint 集成到 IDE 或编辑器中](https://www.robinwieruch.de/vscode-eslint/)，让它及时指出代码中的问题。ESLint v9 的 Flat Config（扁平化配置）已成为默认配置方式，`typescript-eslint{:.string}` 生态也已跟上相关变化。

如果你希望项目使用统一的代码格式，可以使用 [Prettier](https://github.com/prettier/prettier)。它是一款风格明确的代码格式化工具，可选配置并不多。你可以将它 [集成到编辑器或 IDE 中](https://www.robinwieruch.de/how-to-use-prettier-vscode/)，让代码在保存时自动格式化。不过，Prettier 不能取代 ESLint，但可以与它 [很好地配合使用](https://www.robinwieruch.de/prettier-eslint/)。

2026 年值得关注的趋势，是基于 Rust 和 Go 的替代工具。[oxlint](https://oxc.rs/) 是速度快得多的 ESLint 替代方案，并且正在复用现有 ESLint 插件生态（其插件 API 仍处于 alpha 阶段，但已经能运行约 99.5% 的现有插件）。配套格式化工具 [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) 兼容 Prettier，速度约为 Prettier 的 30 倍。oxlint 的类型感知规则由 [tsgolint](https://github.com/oxc-project/tsgolint) 提供支持，tsgolint 基于微软的 [tsgo](https://github.com/microsoft/typescript-go)，后者于 2026 年 4 月进入 TypeScript 7.0 Beta 阶段，可作为 `tsc` 的直接替代品，速度提升约 7 到 10 倍。对于 2026 年的新项目，我推荐 oxlint + oxfmt，但也要明确说明，oxfmt 仍处于 beta 阶段，类型感知的 oxlint 规则则处于 alpha 阶段。它们已经可以用于生产环境，但采用前应清楚了解这些成熟度限制。

如果你更倾向于使用稳定、单一二进制文件的工具链，[Biome](https://biomejs.dev/) v2 可以在一个工具中完成代码检查和格式化，支持类型感知规则，并提供稳定的插件 API。

**推荐：**

- 面向未来的新项目：oxlint + oxfmt，等 tsgo 稳定后，可用它加速类型检查。
- 想立即使用稳定的单一二进制工具：Biome v2。
- 追求成熟、插件丰富和稳健：ESLint + Prettier。

## React 身份认证

React 应用可能需要实现注册、登录和登出等身份认证功能，通常还包括重置密码和修改密码等能力。这些功能远不止前端 React 的范畴，因为相关逻辑一般由后端应用负责管理。

从学习角度看，最好的方式是自己实现一个带身份认证的全栈应用（例如参考 [The Road to Next](https://www.road-to-next.com/)）。但身份认证涉及大量安全风险和容易被忽略的细节，因此在生产环境中，我建议使用第三方身份认证服务：

- [Better Auth](https://www.better-auth.com/)（公认 2026 年自托管身份认证开源首选，可与独立 OAuth 辅助库 [Arctic](https://arcticjs.dev/) 配合使用）
- [Auth.js](https://authjs.dev/)（v5，前身为 NextAuth，维护者目前建议新项目使用 Better Auth）
- [Clerk](https://clerk.com/)（付费）或 [Kinde](https://kinde.com/)（付费，还集成了功能开关和计费能力）
- [WorkOS 的 AuthKit](https://www.authkit.com/)（托管式登录，如果未来需要 B2B 功能，也支持企业级 SSO/SCIM）
- [Stack Auth](https://stack-auth.com/)（开源的 Clerk 替代方案，支持自托管）
- [Supabase Auth](https://supabase.com/docs/guides/auth/overview)、[Convex Auth](https://labs.convex.dev/auth) 或 Firebase Auth（如果已依赖这些服务，通常是最简单的选择）
- [Auth0](https://auth0.com/) 或 [AWS Cognito](https://aws.amazon.com/cognito/)（适合企业场景或 AWS 技术栈）

## React 后端

随着 React 越来越多地向服务端发展，Next.js（适合以动态 Web 应用为主的项目）或 Astro（适合以静态网站为主的项目）这样的（元）框架，成为 React 项目很自然的落脚点。[React Router](https://reactrouter.com/) v7（Remix 与 React Router 合并后的版本）和 [TanStack Start](https://tanstack.com/start)（2026 年 3 月起提供 1.0 版本）同样是合理的全栈选择。

如果你无法使用全栈框架，但仍想留在 JavaScript/TypeScript 生态中，那么 [Hono](https://hono.dev/) 是 2026 年面向边缘运行时的前沿选择，[tRPC](https://trpc.io/)（v11）则可以为这些技术栈提供端到端类型安全。老牌的 [Express](https://expressjs.com/) 依然可靠，并于 2024 年末发布 v5，支持更现代的 async/await 中间件。其他替代方案包括 [Fastify](https://fastify.dev/)、[NestJS](https://nestjs.com/) 和以 Bun 为先的 [Elysia](https://elysiajs.com/)。

另外也值得一提的是 [Koa](https://koajs.com/) 和 [Hapi](https://hapi.dev/)，它们如今仍偶尔出现在较老的代码库中。

## React 数据库

数据库本身并不专属于 React，但随着全栈 React 应用越来越流行，React 与数据库层的距离也比以往更近。开发 Next.js 应用时，你很可能会用到数据库 ORM。当前主要的两个选择是 [Drizzle ORM](https://orm.drizzle.team/)（于 2025 年末在每周下载量上超过 Prisma，是无服务器和边缘计算场景的默认选择之一）以及 [Prisma](https://www.prisma.io/)（生态仍然最成熟，适合希望开箱即用、功能齐全的团队）。

更轻量的替代方案是 [Kysely](https://kysely.dev/)，它属于查询构建器，而不是完整的 ORM。

在数据库服务方面，[Supabase](https://supabase.com/)（基于 Postgres）和 [Firebase](https://firebase.google.com/) 仍然是热门的一体化后端方案。如果你希望数据库和后端整合在同一套服务中，[Convex](https://www.convex.dev/) 已成为很有竞争力的响应式替代方案，并且为 React 提供了一流的 Hooks 支持。

常见的无服务器数据库替代方案包括：[Neon](https://neon.tech/)（于 2025 年被 Databricks 收购，目前仍在运营）、[Turso](https://turso.tech/)（面向边缘环境的 libSQL，2026 年常见的技术组合是 Hono + Drizzle + Cloudflare Workers）以及 [Xata](https://xata.io/)（于 2025 年转向面向 AI/Agent 工作负载的开源 Postgres）。[PlanetScale](https://planetscale.com/) 也仍在运营，但在 2024 年取消业余爱好者套餐后，已转向仅面向企业客户。

## React 应用托管

部署和托管 React 应用，与部署其他 Web 应用并没有太大区别。如果你希望完全掌控运行环境，可以考虑 [DigitalOcean](https://m.do.co/c/fb27c90322f3) 或 [Hetzner](https://www.hetzner.com/) 等服务，并自行管理基础设施。

如果你更喜欢省心的方案，希望托管平台负责大部分运维工作，那么对于 Next.js 项目来说，[Vercel](https://vercel.com/) 的使用体验最顺畅。不过需要注意其中的取舍：免费套餐不允许商业用途，而且当规模扩大时，带宽和函数调用的超额费用可能迅速累积。[Netlify](https://www.netlify.com/) 是最直接的竞争者，其按席位计费方式更加友好。

如果你想自托管，又希望平台能代劳一部分工作，[Coolify](https://coolify.io/) 已发展为这一领域领先的开源 PaaS，可一键部署技术栈中许多原本需要手动配置的服务。

对于全栈 React 应用，[Cloudflare](https://www.cloudflare.com/) 也越来越成为一流的部署目标，可使用 Workers、Pages、R2 和 D1 等产品，而且其免费套餐提供的带宽额度相当有竞争力。

如果你已经在使用 Firebase 或 Supabase 这样的第三方后端即服务（BaaS），也可以看看它们是否同时提供托管服务。其他热门托管平台包括 [Render](https://render.com/)、[Fly.io](https://fly.io/)、[Railway](https://railway.app/)，或者直接使用 AWS、Azure、Google Cloud。

## React 测试

React 应用测试的基础是测试框架，例如推荐使用的 [Vitest](https://vitest.dev/)（v3 提供了成熟的浏览器模式，并由 Playwright/WebdriverIO 提供支持）或 [Jest](https://github.com/facebook/jest)（v30，仍适用于旧有的 CommonJS 项目和 React Native 项目，后者对 Vitest 的支持有限）。两者都提供测试运行器、断言库，以及 spy、mock 和 stub 等能力，足以构成完整的测试框架。

你最终很可能会用到流行的 [React Testing Library（RTL）](https://www.robinwieruch.de/react-testing-library/)。它运行在测试框架提供的环境中，是一套功能全面的 React 测试库。RTL 可以渲染组件，并模拟 HTML 元素上的用户事件，随后再由测试框架执行断言。

对于 React 端到端（E2E）测试，2026 年最明确的默认选择是 [Playwright](https://playwright.dev/)，它在新项目中的采用率占据主导地位。如果团队已经投入使用 [Cypress](https://www.robinwieruch.de/react-testing-cypress/) 或者更看重它的组件测试开发体验，那么 Cypress 依然是不错的选择。两种工具都可以自动化并模拟浏览器中的用户操作，从用户视角验证 React 应用的行为是否符合预期。

**推荐：**

- 单元测试/集成测试：Vitest + React Testing Library（最常见的组合）。
- 端到端测试：Playwright 或 Cypress。
- 也可以按需使用 Vitest 的快照测试。

## React 与不可变数据结构

原生 JavaScript 已经提供了不少工具，可以按照不可变数据的方式处理数据结构。不过，如果你和团队希望强制执行不可变数据模式，最流行的选择是 [Immer](https://github.com/immerjs/immer)。如果你比较关注性能，[Mutative](https://github.com/unadlib/mutative) 是一个可直接替换 Immer 的方案，它使用相同的 draft API，但运行时速度显著更快。需要注意的是，React Compiler 会自动进行记忆化优化，因此在组件代码中手动强调不可变性的必要性已经降低，如今 Immer 最适合的使用场景是 Redux Toolkit 和 reducer 模式。

## React 国际化

为 React 应用实现 [国际化（i18n）](https://www.robinwieruch.de/react-internationalization/) 时，不能只考虑翻译文本，还要处理复数形式、日期与货币格式，以及其他许多细节。常见的国际化库包括：

- [react-i18next](https://github.com/i18next/react-i18next)（生态最大、稳妥的默认选择）
- [next-intl](https://next-intl.dev/)（Next.js 项目的标准选择）
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)（编译时处理，提供类型安全的 `m.key()` 函数，并支持 tree-shaking，与运行时国际化库相比，打包体积通常小得多）
- [Lingui](https://lingui.dev/)（编译时处理消息，在使用 PO 文件的团队中颇受欢迎）
- [FormatJS](https://github.com/formatjs/formatjs)（仍在维护，但目前更多用于既有项目）

## React 富文本编辑器

2026 年，如果要为 React 选择富文本编辑器，我会优先考虑以下方案：

- [Tiptap](https://tiptap.dev/)（默认首选，v3 支持 SSR/JSX，核心使用 MIT 许可证，可选 Tiptap Cloud AI 和协作）
- [BlockNote](https://www.blocknotejs.org/)（基于 Tiptap 构建的 Notion 风格块编辑器，内置基于 Yjs 的协作能力，如果你想开箱即用地获得类似 Notion 的体验，它是首选之一）
- [Plate](https://platejs.org/)（v49 及之后版本，与 shadcn/ui 原生风格契合的选择）
- [Lexical](https://lexical.dev/)（由 Meta 支持，为 Facebook、Instagram 和 WhatsApp Web 提供编辑器能力）
- [Slate](https://www.slatejs.org/)（底层编辑器引擎，Plate 构建于其上）

## React 支付集成

如果要在 React 应用中集成支付，最常见的服务提供商是 Stripe 和 PayPal。两者都提供了方便的 React 集成方式。

- [PayPal](https://developer.paypal.com/docs/checkout/)
- Stripe：
  - [React Stripe Elements](https://github.com/stripe/react-stripe-js)
  - [Stripe Checkout](https://stripe.com/docs/payments/checkout)

如果你需要 Merchant of Record（MoR，名义商户）服务，由服务提供商代为处理销售税、增值税（VAT）和合规事务，那么 2026 年值得了解的选择包括：

- [Paddle](https://www.paddle.com/)（成熟的 SaaS MoR 服务）
- [Polar.sh](https://polar.sh/)（开源，在独立开发者和开发者工具创业团队中快速成长）
- [Lemon Squeezy](https://www.lemonsqueezy.com/)（2024 年被 Stripe 收购，但仍独立运营，与 Stripe 自有服务有重叠）
- [Braintree](https://www.braintreepayments.com/)（归 PayPal 所有）

## React 中的日期与时间

如果你的应用经常处理日期、时间和时区，可以考虑专门库来提高处理效率。常见选择包括：

- [date-fns](https://github.com/date-fns/date-fns)（v4 增加了原生时区支持）
- [Day.js](https://github.com/iamkun/dayjs)

对于新代码来说，一个重要进展是 [Temporal API](https://github.com/tc39/proposal-temporal)：它于 2026 年 3 月达到 TC39 Stage 4 阶段，现已纳入 ES2026。近期版本的 Chrome、Firefox 和 Edge 已原生支持 Temporal，Safari 仍在跟进。一旦目标运行环境满足要求，Temporal 就有望成为 date-fns 和 Day.js 的标准化替代方案，在此之前，date-fns 和 Day.js 仍是实用的过渡选择。

## React 桌面应用

对于 2026 年新开发的跨平台桌面应用，我的默认推荐是 [Tauri](https://tauri.app/)。Tauri 2.0 已一流支持 iOS 和 Android，生成的二进制文件体积大约比 Electron 小一个数量级，内存占用也更低。如果你需要成熟的生态系统和可预测的 Chromium 行为，[Electron](https://www.electronjs.org/) 仍是稳妥的选择，VS Code、Slack 和 Discord 这类应用都是典型例子。

## React 文件上传

- 带有 `type="file"{:.string}` 的 `<input />{:html}` 原生上传输入框。
- [react-dropzone](https://react-dropzone.js.org/)（仍是标准的无头拖放区域方案，近期维护不算活跃，但还没有竞品出现）。

## React 邮件

只用 HTML 编写邮件很麻烦。幸运的是，有些库可以使用 React 组件创建响应式 HTML 邮件：

- [react-email](https://react.email/)（推荐，由 Resend 团队开发，已成为公认标准）
- [jsx-email](https://jsx.email/)（以 Tailwind CSS 为先、采用插件式架构，是主要替代方案）

如果你在寻找邮件服务提供商，2026 年我最推荐 [Resend](https://resend.com/)，因为它的开发体验很好，并且与 react-email 紧密集成。[Postmark](https://postmarkapp.com/) 是长期专注于事务性邮件的服务商，[Plunk](https://www.useplunk.com/) 是支持自托管的开源方案，老牌服务 [Twilio SendGrid](https://sendgrid.com/) 和 [Mailgun](https://www.mailgun.com/) 则仍然适用于企业级发送规模。

## 拖放交互（DnD，Drag and Drop）

我个人用过 [react-beautiful-dnd 的后继项目](https://github.com/hello-pangea/dnd)，体验不错。它仍在积极维护，也很适合对列表进行重新排序。另一个流行方案是 [dnd kit](https://dndkit.com/)，灵活性和可选能力更多，但学习曲线也更陡。经过 2023 至 2024 年的一段沉寂期后，dnd kit 在 2025 至 2026 年重新持续发布，并重新设计了核心包，因此不必再过分担心它是否已经停止维护。对于与框架无关、强调性能的场景，也值得看看 [Atlassian 的 Pragmatic drag-and-drop](https://github.com/atlassian/pragmatic-drag-and-drop)。

## 使用 React 进行移动端开发

将 React 从 Web 带到移动端，首选方案是 [React Native](https://reactnative.dev/)。到了 2026 年，许多团队会直接说“Expo”，因为 [Expo](https://www.robinwieruch.de/react-native-expo/) 实际上已经成为 React Native 的默认框架。React Native 的新架构现已默认启用，也是未来的发展方向。如果你需要在 Web 和移动端之间共享统一的组件，[Tamagui](https://tamagui.dev/) 是领先的跨平台样式系统。如果你希望用同一套代码真正覆盖不同平台，[Solito](https://solito.dev/) 可以连接 React Navigation 与 Next.js。

## React VR/AR

你也可以使用 React 开发虚拟现实（VR）或增强现实（AR）体验。坦白说，我没有亲自使用过这些库，不过，2026 年如果要在 React 中开发 AR/VR，我会优先考虑以下方案：

- [react-three-fiber](https://github.com/pmndrs/react-three-fiber)（由 Poimandres 维护，是 Three.js 的 React 渲染器）
- [@react-three/drei](https://github.com/pmndrs/drei)（与 react-three-fiber 搭配使用的一组重要辅助工具）
- [@react-three/xr](https://github.com/pmndrs/xr)（同样来自 Poimandres，2026 年在 React 中实现 VR/AR 的实际选择，支持命中测试、锚点、网格/平面检测以及 Quest 模拟器）

## React 设计与原型开发

对于 2026 年的 React 开发者来说，AI UI 生成工具已经取代手绘草图，成为从想法快速走向可运行组件的最快方式。[Vercel 的 v0](https://v0.dev/) 是默认首选：它能生成适用于生产环境的 React 代码，并使用 Tailwind 和 shadcn/ui，如今还提供完整编辑器、Git 集成和数据库连接。[Lovable](https://lovable.dev/) 是端到端构建全栈 MVP 的替代方案（React + Supabase），如果你希望灵活选择框架并直接在浏览器中执行代码，也可以看看 [Bolt.new](https://bolt.new/)。如果只想在聊天中生成一次性的组件，[Claude Artifacts](https://www.anthropic.com/news/artifacts) 也很出色。

与设计师协作时，[Figma](https://www.figma.com/) 仍然是设计交付的行业标准。Figma Make（通过提示词生成 React）和 Code Connect（将 Figma 组件关联到真实代码库）已经弥合了大部分设计到代码之间的差距，而这曾经是 Anima、Locofy 和 Builder.io 等工具重点解决的问题。

## React 组件文档

如果你负责编写组件文档，可以选择多种 React 文档工具。我曾在不少项目中使用过 [Storybook](https://storybook.js.org/)，对它的评价比较中立。Storybook 9 内置了基于 Vitest 的测试功能，安装体积也比早期版本小得多。对于只面向 React、希望更轻量的项目，可以了解 [Ladle](https://ladle.dev/)，它的冷启动速度更快。[React Cosmos](https://reactcosmos.org/) 仍适合已经在使用它的团队，而 [Docusaurus](https://github.com/facebook/docusaurus) 更适合构建通用文档网站。

---

归根结底，React 生态是一个以 React 为核心、具有高度灵活性的工具体系。你可以根据实际需求，审慎选择要引入的库：从小而简单的方案开始，在遇到具体问题时再逐步增加依赖。反过来说，如果 React 本身已经足以满足需求，也完全可以只使用核心库，保持项目轻量。
