---
title: '现代化的高质量 React Hooks 库（已开源）'
date: 2024-07-04
topic: '前端'
excerpt: '一个现代化、SSR 友好且高度优化的 React Hooks 库。'
tags:
  - React
  - Hooks
  - 开源
  - TypeScript
---

![@shined/react-use 文档首页](https://s2.loli.net/2024/07/03/XjReoNwi5mI7MbO.png)

## 为什么做这个库

在日常的 React 开发中，我总是会遇到一些重复的场景：处理鼠标位置、监听窗口大小、管理状态……每次都要写一遍类似的逻辑，既枯燥又容易出错。虽然社区已经有不少优秀的 Hooks 库，但在使用过程中，我发现它们或多或少都存在一些痛点：

- 有的库对 SSR 支持不够友好，在 Next.js 项目中经常会报错
- 有的库函数引用不稳定，导致不必要的重渲染
- 有的库缺少详细文档，用起来总是要翻源码
- 有的库类型定义不够完善，写 TypeScript 时体验不佳

后来接触到 Vue 生态的 [VueUse](https://vueuse.org/)，被它的设计理念和开发体验深深吸引。我就在想，能不能把这种体验带到 React 生态？于是就有了 `@shined/react-use` 这个项目。

## 项目介绍

`@shined/react-use` 是一个对 SSR（服务端渲染）友好、全面且高度优化的 React Hooks 库，提供灵活高效的钩子解决方案。完全采用 TypeScript 开发，配备包含丰富示例的交互式文档。

这个项目主要受到 [VueUse](https://vueuse.org/) 的启发，同时也吸取了 [react-use](https://github.com/streamich/react-use)、[ahooks](https://ahooks.js.org/) 以及社区内许多其他优秀库的经验。特别感谢开源社区，尤其是这些库的作者们，他们的工作给了我很多灵感。

## 核心特性

### 🎯 灵活性

提供了 [ElementTarget](https://sheinsight.github.io/react-use/zh-cn/docs/features/element-target)、[Ref Getter](https://sheinsight.github.io/react-use/zh-cn/docs/features/ref-getter)、[Pausable](https://sheinsight.github.io/react-use/zh-cn/docs/features/pausable) 等特性，让你可以根据实际需求灵活组合使用。

### 📦 可摇树优化

采用 [ESM](https://nodejs.org/api/esm.html) 设计和交付，支持 Tree Shaking。只会打包你实际用到的代码，不用担心包体积。

### 📖 交互式文档

每个 Hook 都有详细的文档和可交互的示例，还有 [在线 Playground](https://react-online.vercel.app/#code=aW1wb3J0IHsgY3JlYXRlUm9vdCB9IGZyb20gJ3JlYWN0LWRvbS9jbGllbnQnCmltcG9JdCB7IHVzZU1vdXNlLCB1c2VSZWFjdGl2ZSB9IGZyb20gJ0BzaGluZWQvcmVhY3QtdXNlJwoKCmZ1bmN0aW9uIEFwcCgpIHsKICBjb25zdCB7IHgsIHkgfSA9IHVzZU1vdXNlKCkKICBjb25zdCBbeyBjb3VudCB9LCBtdXRhdGVdID0gdXNlUmVhY3RpdmUoeyBjb3VudDogMCB9KQoKICBjb25zdCBhZGRPbmUgPSAoKSA9PiBtdXRhdGUuY291bnQrKwoKICByZXR1cm4gKAogICAgPGRpdj4KICAgICAgPGRpdj4oeCwgeSk6ICh7eH0sIHt5fSk8L2Rpdj4KICAgICAgPGJ1dHRvbiBvbkNsaWNrPXthZGRPbmV9PkNvdW50OiB7Y291bnR9PC9idXR0b24%2BCiAgICA8L2Rpdj4KICApCn0KCmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSEpLnJlbmRlcig8QXBwIC8%2BKQo%3D) 可以直接体验。不用担心看文档找不到重点。

### 🪶 轻量级

整个库 [零依赖](https://github.com/sheinsight/react-use/blob/main/package.json)，不会给你的项目带来额外负担。

### 🌐 对 SSR 友好

所有 Hooks 都经过测试，确保在 Next.js、Remix 等 SSR 框架中能正常工作。不会出现 `window is not defined` 这种经典报错。

### 🔷 TypeScript 优先

完全用 [TypeScript](https://www.typescriptlang.org/) 编写，类型定义清晰准确。每个 Hook 都有详细的 [JSDoc](https://jsdoc.app/) 注释，在 IDE 里鼠标悬停就能看到说明，写起来很舒服。

### ✅ 全面测试

（测试覆盖正在完善中……这个坑还在填）

## 性能优化

在开发这个库的过程中，我特别关注性能方面的优化。毕竟 Hooks 是要在每次渲染时都执行的，如果性能不好，很容易成为应用的瓶颈。

### 安全状态管理

为所有有状态的 Hooks 实现了 [安全状态](https://sheinsight.github.io/react-use/zh-cn/docs/optimization/safe-state) 策略。简单来说，就是在组件卸载后，不会再执行 `setState` 操作，避免了 React 的经典警告："Can't perform a React state update on an unmounted component"。

### 函数引用稳定

默认情况下，每个导出的函数都经过了 [稳定化](https://sheinsight.github.io/react-use/zh-cn/docs/optimization/stabilization) 处理。这意味着函数引用不会在每次渲染时都变化，可以安全地作为其他 Hooks 的依赖项，不用担心触发不必要的重新执行。

### 避免过期闭包

通过内部使用 [最新状态](https://sheinsight.github.io/react-use/zh-cn/docs/optimization/latest-state) 策略，避免了 React 开发中常见的过期闭包问题。你可以放心地在回调函数中使用最新的 props 和 state，不用在 `useEffect` 的依赖数组里纠结。

### 可控的渲染行为

某些 Hooks 支持 [Pausable](https://sheinsight.github.io/react-use/zh-cn/docs/features/pausable) 特性，可以在需要的时候暂停和恢复它们的行为。比如在弹窗打开时暂停某些监听器，可以进一步减少不必要的重渲染。

## 工程化实践

做这个库的过程，也是对现代前端工程化的一次完整实践。这里记录一些技术选型和配置，也算是给自己留个备忘：

### 项目架构

采用主流的 **pnpm + monorepo** 架构，源码、文档、示例项目都在同一个仓库里。这样方便统一管理，修改代码后可以立即在示例项目里验证效果。

使用 `.node-version` 和 `packageManager` 字段锁定 Node.js 和包管理器版本，确保团队成员（虽然目前就我一个人）和 CI 环境的一致性。

### 构建和开发工具

- **tsup**：源码构建工具，基于 esbuild，又快又好用
- **Biome**：代码检查和格式化，基于 Rust 的现代工具，比 ESLint + Prettier 快太多
- **Vitest**：测试框架，现代化、ESM 优先，和 Vite 生态无缝集成
- **Docusaurus**：文档站点，成熟稳定，社区生态好
- **UnoCSS**：用于文档站点的示例样式，原子化 CSS，按需生成

### CI/CD 流程

配置了完整的 **GitHub Actions** 工作流：

- **CI**：每次 push 和 PR 都会自动运行 lint 和类型检查
- **Release**：自动发布到 npm，配置了 [provenance](https://docs.npmjs.com/generating-provenance-statements) 认证，提高供应链安全性
- **GitHub Pages**：文档站点自动部署，push 到 main 分支就会更新

### 版本管理

- **bumpp**：一站式版本管理工具，自动处理 version bump、git tag、commit 和 push
- **conventional-changelog-cli**：根据提交信息自动生成 `CHANGELOG.md`
- **changelogithub**：发布时自动生成和发布 GitHub Release

### 包配置规范

仔细配置了 `package.json`，包括：

- **exports**：规范的导出配置，支持 ESM 和 CJS
- **sideEffects**：标记无副作用，帮助打包工具更好地 Tree Shaking
- **typesVersions**：类型声明版本配置，确保不同 TypeScript 版本的兼容性
- **clean-pkg-json**：发布前自动清理 `package.json`，移除开发相关字段

## 核心 Hooks 设计

在实现上层功能 Hooks 之前，我先花了不少时间打磨底层的基础 Hooks。这些基础 Hooks 看起来不起眼，但它们是整个库的地基，直接影响到上层功能的质量和性能。

### useSafeState

一个安全的 `useState` 替代品，除了基本功能外，还支持深度比较（deep compare）。在组件卸载后不会执行 state 更新，符合 React 官方的最佳实践。

### useStableFn

确保函数引用稳定的关键 Hook，也是内部渲染优化的核心之一。所有导出的回调函数都经过它处理。

### useTargetElement

统一处理所有 `ElementTarget` 类型的参数（可以是 DOM 元素、Ref 对象或者选择器）。有了它，其他 Hooks 就不用各自处理元素获取逻辑了。

### usePausable

支持底层的可暂停特性，让 Hooks 可以在运行时暂停和恢复。这是可选的渲染优化手段之一。

### useSupported

统一检测浏览器 API 的可用性。对于有兼容性问题的功能，可以优雅地降级。

### useEventListener

处理各种符合事件接口的实例（DOM、EventTarget 等）的事件监听。内部会自动处理添加和移除监听器。

### useLatest

通过稳定的 Ref 引用来避免过期闭包问题。这是很多 Hooks 内部依赖的基础工具。

### create-xxx-effect 系列

基于 `useEffect` 衍生出的一系列底层 Hooks，比如 `useMount`、`useUnmount`、`useUpdateEffect` 等。它们是很多上层 Hooks 的基础依赖。

## 写在最后

做这个库的过程挺有意思的，从最初的想法到现在可用的版本，学到了很多东西。既有技术层面的（比如如何设计一个好用的 Hooks API、如何优化性能），也有工程层面的（比如如何配置一个规范的开源项目、如何写好文档）。

当然，现在这个库还远称不上完美。测试覆盖还不够完善，一些 Hooks 的 API 设计可能还有优化空间，文档也可以写得更详细一些。不过开源嘛，最重要的是先把东西做出来，然后在使用和反馈中不断迭代改进。

如果你在用 React 开发项目，不妨试试这个库。如果遇到问题或者有什么建议，欢迎在 GitHub 上提 Issue 或者 PR。我会尽量及时回复的。

## 相关链接

- [GitHub 仓库](https://github.com/sheinsight/react-use)
- [官方文档（中英双语）](https://sheinsight.github.io/react-use)
