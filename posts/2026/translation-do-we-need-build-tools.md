---
title: '[译] 我们还需要构建工具吗？'
date: 2026-08-11
topic: '技术'
excerpt: '探讨一下构建工具的必要性'
tags:
  - '开发'
  - '技术'
  - 'API'
  - '软件工程'
---

> 原文：Do we still need build tools?
>
> 时间：2026 年 7 月 3 日
>
> 作者：Ollie Williams
>
> 链接：https://olliewilliams.xyz/blog/no-build

---

2026 年的前端开发，构建工具到底还有多不可或缺？让我们一探究竟。

## CSS 还需要构建工具吗？

### 前缀

Autoprefixer、esbuild 和 Lightning CSS 可以自动为 CSS 添加厂商前缀。本周，Autoprefixer 在 NPM 上的下载量高达 49,587,933 次。如果你的代码库里没有用到 `stretch` 关键字、`user-select` 或 `box-decoration-break`，那就没必要用前缀工具。还有一些属性、值和选择器需要加前缀，但因为它们没有标准化的等价写法，只能手动加，比如 `-webkit-text-stroke`、`-webkit-text-fill-color`、`-webkit-line-clamp` 和 `::-webkit-scrollbar`。举个例子，如果你在 CSS 里写了 `text-stroke`，Autoprefixer 这类工具不会自动加上 `-webkit` 前缀，因为 `text-stroke` 本身并不是一个标准化的 CSS 属性。

`user-select` 去前缀是 [Interop 2026](https://github.com/web-platform-tests/interop/blob/main/2026/README.md#:~:text=Unprefixing%20the%20%2Dwebkit%2Duser%2Dselect%20property) 的一部分，预计今年内会落地。

### 语法降级

「语法降级」就是把现代 CSS 转换成旧浏览器也能理解的写法。PostCSS 最早提供这项功能，随后 [esbuild](https://esbuild.github.io/content-types/#css) 和 [Lightning CSS](https://lightningcss.dev/transpilation.html)（被 [Bun](https://bun.com/docs/bundler/css#syntax-lowering)、Rspack 和 Turbopack 使用）也跟进了。

不同工具支持的降级特性略有差异，主要包括：

- 现代颜色函数，如 `lab()`、`lch()`、`oklab()`、`oklch()`、`color()`、`hwb()`，带 alpha 的十六进制颜色，以及现代 RGB/HSL 语法
- `color-mix()`
- `inset` 简写
- 嵌套
- 渐变插值
- `light-dark()`
- 逻辑属性
- `system-ui` 字体
- 数学函数，如 `round()`、`mod()`、`cos()`、`tan()`、`pow()` 等

这些特性要么已经属于「基线广泛可用」（即所有主流浏览器已支持至少两年半），要么将在今年内达到该状态。有些特性，比如 `inset` 和 `font-family` 的 `system-ui` 值，甚至已经支持了更久。

语法降级有严重的局限性。像 `inset` 这样的简单简写属性可以轻松转换为展开写法，但 `light-dark()` 这样的完整功能几乎无法被高保真模拟。构建工具很难让一个新 CSS 特性「即插即用」，表现得和在最新浏览器里完全一样。强行使用某个特性，而输出代码却截然不同，最终可能弊大于利。而且，编写的代码和 DevTools 里显示的内容不一致，会让调试变得更困难。

### 预处理器：Sass 和 Less

Sass 曾红极一时，但如今已风光不再，因为它的最佳特性大多已被 CSS 吸收，而且往往以更优的形式呈现。这一切始于 CSS 自定义属性，后来又有嵌套，嵌套早在 2023 年就已获得所有浏览器支持。CSS 颜色函数如 `alpha()`、`color-mix()` 和 CSS 相对颜色，都比 Sass 的颜色函数更强大。Sass 已经 [弃用](https://sass-lang.com/documentation/breaking-changes/if-function/) 了自己的 `if()` 函数，转而推荐官方的 CSS `if()` 语法。Chrome 已正式支持 `if()` 和 `@function`，未来这些特性可能会获得更广泛的浏览器支持。此外，[CSS 规范](https://drafts.csswg.org/css-mixins/#defining-mixins) 中还有关于 mixin 的定义，目前微软 Edge 团队正 [在 Chromium 中实现](https://bsky.app/profile/patrickbrosset.com/post/3mpxkfv25vc2k)。

### @import 合并

像 [esbuild](https://esbuild.github.io/content-types/#css)、[PostCSS Bundler](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-bundler)、postcss-import 和 [Lightning CSS](https://lightningcss.dev/bundling.html) 这类工具，可以将通过 `@import` 引用的多个 CSS 文件合并成一个 `.css` 输出文件。同样，Sass 也有自己 [独特的方式](https://sass-lang.com/documentation/at-rules/use/) 把多个 `.scss` 文件合并为单个 `.css` 文件。如果你编写的 CSS 文件不止一两个，把它们合并起来将是一个非常值得推荐的构建步骤。

在「无构建」项目中，每个你编写的 CSS 文件都需要单独的 `@import` 或 `<link>` 标签，也就是说，每个文件都会产生一个独立的 HTTP 请求。Ruby on Rails 的创建者 David Heinemeier Hansson 是为数不多公开倡导纯「无构建」前端开发的知名人物之一。在 DHH 公司开发的 Hey.com 上，文档的 `<head>` 里足足有 147 个 `<link rel="stylesheet">` 元素。这个网站并不慢，Lighthouse 性能测试得分 94，但在这种规模下这么做实在难以理直气壮，而且肯定不是最优解。

![DHH 有关 Hey.com 无构建网站的推文](https://image.viki.moe/blog/no-build/7eaf4c.png)

Jake Archibald [曾撰文](https://jakearchibald.com/2021/f1-perf-part-7/#:~:text=A%20big%20part%20of%20gzip%20and%20brotli%20compression%20involves%20back%2Dreferences%2C%20eg%20%22the%20next%2050%20bytes%20are%20the%20same%20as%20this%20bit%20earlier%20in%20the%20resource%22.%20That%20can%20only%20happen%20in%20a%20single%20resource%2C%20so%20compressing%20lots%20of%20small%20resources%20is%20less%20efficient%20than%20compressing%20one%20combined%20resource)  讨论过合并资源带来的压缩收益：

> gzip 和 brotli 压缩很大程度上依赖于反向引用，比如「接下来 50 个字节与资源前面某处相同」。这种优化只能在单个资源内进行，所以压缩大量小文件的效果不如压缩一个合并后的大文件。

### 压缩

压缩会去除注释和空白字符。对 CSS 进行压缩仍然是推荐的最佳实践。

## JavaScript 还需要构建工具吗？

### ECMAScript 模块打包

JavaScript 模块打包器包括 Parcel、Bun、Rspack、Webpack、Turbopack、esbuild、Rollup 及其继任者 Rolldown（Vite 正在使用）。

打包在性能上有得有失。打包会损害缓存粒度，一个小模块改动，整个 bundle 就会失效。但相比优点，这个缺点通常可以忽略：

- gzip / brotli 压缩在处理大文件时比处理大量小文件更高效。
- 打包器可以剔除未使用的代码。
- 打包器通过扁平化导入链，减少请求瀑布。
- 即便有 HTTP/2 和 HTTP/3，HTTP 请求的数量仍然至关重要。

Rolldown 文档中的 [为什么还需要打包器？](https://rolldown.rs/in-depth/why-bundlers) 一页解释道：

> 尽管 HTTP/2 在理论上支持无限多路复用，但大多数浏览器 / 服务器对每个连接的最大并发流数量默认限制在 100 左右。每个网络请求还会在服务器和客户端带来固定的开销（头部处理、TLS 加密、多路复用等）。请求越多，服务器负载越大，而实际并发能力还受限于服务器响应模块文件的速度。包含数千个未打包模块的应用，即便在 HTTP/2 下也会造成严重的网络瓶颈。

虽然打包的性能优势绝对大于劣势，但如果你只有少量的 JavaScript 文件，不打包也完全可行。V8 博客在 2018 年 [发过一篇文章](https://v8.dev/features/modules#bundle)，里面提到，对于「模块总数少于 100 个且依赖树相对较浅（即最大深度小于 5）」的 Web 应用，跳过打包也没问题。

![前 Chrome 开发团队成员有关模块数的推文](https://image.viki.moe/blog/no-build/4bae1f.png)

#### 不止是 ES 模块

有些打包器不仅打包 JavaScript 模块。Webpack 率先通过所谓的「loader」实现了在 JavaScript 中 [导入其他资源类型](https://webpack.js.org/concepts/#loaders)。某种程度上，类似的功能已经进入了 Web 标准。通过 import attribute 语法导入 JSON，自 2025 年初起已获得所有浏览器支持。CSS module scripts 在 Chrome/Edge 和 Firefox 中可用。导入文本的功能最近也在 [Firefox 153](https://www.firefox.com/en-US/firefox/153.0beta/releasenotes/#:~:text=Developers%20can%20now%20use%20the%20text%20import%20attribute%20to%20import%20text%20files%20using%20the%20module%20system.) 中落地。此外还有一个 [导入字节](https://github.com/tc39/proposal-import-bytes)的规范，但尚未在浏览器中实现。

```js
import json from "./data.json" with { type: "json" };
import text from "/file.txt" with { type: "text" };
import bytes from "./photo.png" with { type: "bytes" };
import styles from "./styles.css" with { type: "css" };

document.adoptedStyleSheets.push(styles);
```

#### 用 modulepreload 避免瀑布

如果模块 A 导入了模块 B，而模块 B 又导入了模块 C，那么只有当模块 A 加载完毕后，浏览器才会发现并去获取模块 B，以此类推。这种嵌套导入链导致模块被发现得很晚，从而形成瀑布，一系列串行请求。要获取完整的模块依赖图，需要多次网络往返。HTTP/2 和 HTTP/3 对此无济于事。打包并非唯一的解决方案。通过预加载文件，浏览器可以提前获知所有文件，并行获取，而不是逐个串行。

管理预加载语句本身也有负担。举个真实例子，Hey 邮箱 Web 应用在 `<head>` 中有 259 个 `<link rel="modulepreload">` 元素。一些工具，如后端框架 [Ruby on Rails](https://guides.rubyonrails.org/v7.2/asset_pipeline.html#preloading-pinned-modules) 会提供辅助。

最近，预加载其他模块类型已经成为可能。在 Chrome、Edge 和 Safari 中，JSON 可以通过 `<head>` 中的 `modulepreload` 预加载。Chrome/Edge 还可以预加载 CSS。根据 HTML 规范，[预加载文本](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload#:~:text=It%20can%20be%20set%20to%20%22script%22%2C%20%22style%22%2C%20%22json%22%2C%20%22text%22) 应该也是可行的，但目前还没有浏览器实现。

```html
<link rel="modulepreload" as="style" href="/styles.css"> 
<link rel="modulepreload" as="json" href="/data.json">
<link rel="modulepreload" as="text" href="/file.txt">
```

#### 第三方依赖

打包器最初在前端流行时，主要卖点并非性能优化。打包器曾是，现在也依然是，让无法在浏览器中运行的 CommonJS 依赖能够在浏览器中使用的唯一方式，但这个问题如今基本已经过时了。标准 ES 模块（ESM）自 2018 年起就获得所有浏览器支持，生态也在慢慢跟上。NPM 上仅以 ESM 格式发布的包，其 [占比](https://github.com/wooorm/npm-esm-vs-cjs) 已从 2021 年的 6% 增长到现在的 16%。同时支持 ESM 和 CJS 的双格式包，则从 2021 年的 1.7% 增长到如今的 22%。当然，仍有很多后端 / Node.js 相关的包以及无人维护的老旧包只以 CommonJS 发布，但只要是近年发布的、正经的前端包，基本都会提供 ESM 格式。

另一个关键拼图，import maps，自 2023 年初起已获得完整浏览器支持，并被像 Shopify 这样复杂的大规模 Web 应用 [所使用](https://shopify.engineering/resilient-import-maps)。尽管如此，不使用打包器而直接使用包仍然比想象中困难。

从 NPM（或 JSR）仓库使用依赖的最简单方式，是通过公共 CDN，如 [esm.sh](https://esm.sh/)、[UNPKG](https://unpkg.com/) 或 [JSPM](https://generator.jspm.io/)，配合 import map。

```html
<script type="importmap">
  {
    "imports": {
      "lit": "https://esm.sh/lit@3.3.3"
    }
  }
</script>
```

这很好用，但缺点是[你无法控制服务的可用性](https://www.theverge.com/2024/4/12/24128276/open-source-unpkg-cdn-down)。esm.sh 和 UNPKG 都是很棒的项目，但从长远看，它们可能会变得无人维护（比如 [Skypack](https://github.com/skypackjs/skypack-cdn/issues/362)），或存在安全隐患（比如 [polyfill.io](https://simonwillison.net/2024/Jun/25/polyfill-supply-chain-attack/)），甚至直接下线（比如 RawGit）。

如果你想自己托管依赖呢？Django 框架的联合创始人 Simon Willison 在 [博客中](https://simonwillison.net/2024/Nov/23/without-a-build-system/) 写道：

> 我有时觉得，当下计算机科学中最难的问题，就是拿到一个 NPM 库，然后想办法下载下来，并在 `<script>` 标签中使用它，而无需卷入某种复杂的构建系统。

在 NPM 和打包器流行之前，[vendor](https://htmx.org/essays/vendoring/)（手动下载并复制）依赖是常见做法。开发者手动下载或复制粘贴 jQuery 源码（举个例子）到自己的项目中。虽然看起来过时，但对于只有一两个依赖且很少更新的网站，这种方式的开发体验反而比现代实践更好。不过，如果你依赖很多且更新频繁，NPM 的优势就相当明显了，只需运行 `npm outdated` 就能检查哪些包已过时，再运行 `npm update` 即可全部更新到最新版本。此外，NPM 还能让你接收已安装包的安全警报。但 NPM 最重要的价值在于处理传递性依赖。

有些项目，如 jQuery 和 HTMX，是自包含的，它们不导入任何其他依赖。这使得下载和使用它们 [异常简单](https://htmx.org/docs/#:~:text=easiest%20way%20to%20install%20htmx%20is%20to%20simply%20copy%20it%20into%20your%20project)。但如果一个依赖本身又有自己的依赖呢？HTMX 的作者 [这样解释](https://htmx.org/essays/vendoring/#:~:text=On%20the%20other,on%20and%20on.)：

> 「手动 vendoring 还有一个巨大的缺陷：通常没有办法很好地处理所谓的传递性依赖问题。如果 htmx 有子依赖，即它依赖的其他库。那么为了正确地 vendoring，你还得把那些库也一并下载。如果那些依赖还有进一步的依赖，你还要继续安装…… 如此往复。」

像 NPM、Yarn、pnpm 和 Bun 这样的包管理器会下载整个依赖树。比如运行 `npm i lit`，也会同时下载 Lit 的所有依赖。但即便下载了所有需要的代码，你也不能直接在前端使用…… 你可能想这样尝试：

```html
<script type="importmap">
  {
    "imports": {
      "lit": "/node_modules/lit/index.js",
    }
  }
</script>
```

但事实上，你还得为每个传递性依赖都做映射。以 Lit 为例，你需要这样写：

```html
<script type="importmap">
  {
    "imports": {
      "lit": "/node_modules/lit/index.js",
      "@lit/reactive-element": "/node_modules/@lit/reactive-element/reactive-element.js",
      "lit-html": "/node_modules/lit-html/lit-html.js",
      "lit-html/": "/node_modules/lit-html/",
      "lit-element": "/node_modules/lit-element/index.js",
      "lit-element/": "/node_modules/lit-element/"
    }
  }
</script>
```

手动编写 import map 可能会变得相当复杂，因此有一个工具，[JSPM](https://jspm.org/getting-started#:~:text=JSPM%20makes%20working%20with%20import%20maps%20simpler%20by%20automating%20their%20creation%20and%20management.)，它承诺「通过自动化 import map 的创建和管理，让工作变得更简单」。

Lea Verou，前 W3C 技术架构组成员，曾 [详细撰文](https://lea.verou.me/blog/2026/web-deps/#rawdogging-node_modules%2F-imports)讨论过 Web 依赖问题，并解释了直接使用 `node_modules` 中代码的弊端：

> 首先，直接部署整个 `node_modules` 目录既浪费资源，又存在安全风险。事实上，大多数无服务器托管平台（如 Netlify 或 Vercel）会在构建完成后自动将其从公开部署文件中移除。其次，这违反了封装原则：包内部的路径通常被视为包本身的实现细节。

现实是，你可能还是应该使用像 esbuild 或 Rolldown 这样的现代打包器 🤷♂️。

### 转译器

Babel、tsc、SWC、esbuild 和 oxc-transform 可以将用最新语法编写的 JavaScript 代码转换为旧浏览器能理解的语法。最新版本的 Babel [不再](https://babeljs.io/blog/2026/06/16/8.0.0#:~:text=also%20no%20longer%20compiles%20to%20ES5%20and%20CommonJS%20by%20default) 默认编译为 ES5。这个变化来得实在太晚了。Chrome 团队的工程师 Philip Walton 在 2024 年曾指出：

> 互联网上大多数网站都交付了转译为 ES5 的代码，但它们在 IE 11 中仍然无法运行，这意味着转译器和 polyfill 带来的体积膨胀被 100% 的用户下载，却没有给任何人带来收益。

Babel 长期以来为了照顾早已不存在的浏览器而膨大输出代码。现在工具有了更好的默认配置（而且你也应该指定 browserslist），但这提醒我们，行业标准下那些为服务用户而采用的复杂工具链，有时反而可能伤害用户。转译会显著增加打包体积。Chrome 团队的 Walton [发现](https://philipwalton.com/articles/the-state-of-es5-on-the-web/)：

> 如果你用 Babel 转译这一行代码，并配置它添加 polyfill，即便你根据源码使用情况仅限制在所需的 polyfill，它也会从 31 字节膨胀到 11,217 字节（压缩后）。

虽然新 JavaScript 特性层出不穷，但 ES5 到 ES6 之间的巨大鸿沟不会重演。过早采用某些特性（如装饰器）可能会因规范变动而带来麻烦。而一些最重要的新增特性，比如 Temporal，如果没有庞大的 polyfill 就无法使用。简单地等待新 JavaScript 特性在所有浏览器中落地，也是一种合理的策略。

### 类型

[JSDoc](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html#providing-type-hints-in-js-via-jsdoc) 可以在普通 `.js` 文件中使用类型注解。现代代码编辑器（如 VS Code）会利用 TypeScript 引擎读取 JSDoc 注释，完全不需要构建工具。虽然我对它的语法不太感冒，但一些大型项目（如 [Svelte](https://news.ycombinator.com/item?id=35891259#:~:text=wi-,ll%20result%20in%20smaller,dealing%20with%20build%20steps.,-We)）已经采用了 JSDoc。

还有一个令人兴奋的标准提案叫 [Type Annotations](https://github.com/tc39/proposal-type-annotations)（之前叫 Types as Comments），但它停留在 stage 1 已经有一段时间了。

### 压缩

除了去除注释和空白字符，压缩器还可以对 JavaScript 进行「丑化」，包括删除未使用代码和「混淆」变量名（将长变量名替换为短字母名）。压缩 JavaScript 仍然是推荐的最佳实践。

### JavaScript 框架

一些流行的 JS 框架（例如 [Preact](https://preactjs.com/guide/v11/no-build-workflows/)、[Vue](https://vuejs.org/guide/extras/ways-of-using-vue.html#standalone-script)）从技术上讲可以不用构建步骤，但这种方式有局限性（无法使用 JSX、单文件组件等）。[HTM](https://github.com/developit/htm) 是一个无需构建步骤的 JSX 替代方案。而 HTMX、AlpineJS 和 Hotwire 这类工具则完全不依赖任何构建工具。

![React Router 作者 Michael Jackson 的一条推文](https://image.viki.moe/blog/no-build/09bf11.png)

## 为什么这很重要？

Tailwind、TypeScript 和 JSX 几乎无处不在，它们都需要构建步骤，所以这篇文章可能看起来有些「不合时宜」。前端构建工具本身在不断进步，但开发者对它们的满意度自 2016 年以来并未改变，[一直维持在 3.6/5 分](https://2025.stateofjs.com/en-US/libraries/build-tools/#build_tools_happiness)。配置繁琐、过于复杂和性能问题是构建工具最主要的 [痛点](https://2025.stateofjs.com/en-US/libraries/build-tools/#build_tools_pain_points)。当被问及「JavaScript 中你最头疼的是什么？」时，构建工具问题 [排名](https://2025.stateofjs.com/en-US/usage/#top_js_pain_points) 甚至高于异步代码、安全和错误处理。

![构建工具排在代码架构、状态管理、依赖管理、日期和性能之后，位列第六](https://image.viki.moe/blog/no-build/7439cf.png)

最近，我参与的一个项目构建失败了，原因是一个完全合法的 CSS 选择器（`::details-content::after`）导致 Lightning CSS 崩溃（尽管这个选择器已被所有浏览器支持）。每个构建工具都有数百个未解决的 GitHub Issue。Stack Overflow 上关于 Webpack 的问题多达 42,497 个，其中 10,845 个问题从未得到任何回答。我的希望是，随着 Web 标准的不断改进，构建工具可以变得更轻量、更简单，因为在大项目中完全放弃它们并不是一个好选择。

## 译者注

本文借助 AI 完成初稿，译者进行了逐段校对、润色及排版。如有理解偏差，欢迎指正。
