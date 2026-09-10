---
title: 'GitHub 语言统计又双叒叕抽风？手把手教你驯服'
date: 2026-01-05
topic: '技术'
excerpt: '今天你的 GitHub 语言统计抽风了吗？'
tags:
  - 'GitHub'
  - 'Linguist'
  - '编程语言统计'
  - '开源项目'
  - 'Git'
  - '.gitattributes'
---

在 GitHub 项目主页里，有一个区域专门用来显示该项目的主要编程语言分布情况。比如下面这张截取自 Linux 内核仓库主页的语言统计图：

![Linux 的语言分布](https://s2.loli.net/2026/01/05/GlJYDSUOt2naKC4.png)

> 从图中可以看到，截止本文发布时，Linux 内核虽然开始 Rust 化，但 C 语言仍然还是以 98% 的比例占据着主导地位，遥遥领先。~~Rust 大哥再使把劲儿，争取超过 10%。~~

这个功能是通过 GitHub 官方开源的 [Linguist](https://github.com/github/linguist) 工具实现的。Linguist 会分析仓库中的文件，识别编程语言并计算它们所占的比例，然后提供给 GitHub 在项目主页上展示。

然而，Linguist 并不是完美的。有时它会误判某些文件的语言类型，或者将一些不相关的文件（如文档、配置文件、预下载的 npm 包、生成的代码等）纳入统计，导致显示的语言分布与实际情况不符。~~不知道的还以为你用 Markdown 写原生 APP。（笑~~

举例来说，之前用过的一个博客主题因为内联了大量 CSS 库的代码，Linguist 就以为这个项目用 CSS 写的，然后就开始给我乱搞：

![博客主题的语言分布](https://s2.loli.net/2026/01/05/XY6lDwrf8bJumeM.png)

> 实际上，它主要用 HTML （Pug 模板语言） 和 JavaScript 写的，CSS 只是从第三方库里拷贝过来的样式代码而已，并不是我自己写的。

但是我们也不能完全责怪 Linguist，因为它毕竟只是一个自动化的工具，有什么给什么，说一不二，无法设身处地地理解项目的实际用途和结构。

好在 Linguist 项目组也不是不干活的，他们提供了配置途径，让我们可以手动调整和优化语言统计结果，从而让它更符合实际情况。

你可以在项目根目录下创建一个名为 `.gitattributes` 的文件，来告诉 Linguist 忽略某些文件或目录，或者将它们归类为特定的语言。

下面是一个简单而全面的例子：

```properties
# 标记 vendor 代码（内联的 npm 包等不是你自己写的代码）
vendored/* linguist-vendored

# 不检测某些特定文件或文件夹
tools/export_bom.py -linguist-detectable

# 标记所有 .es 文件为 JavaScript 代码
*.es linguist-language=JavaScript

# 标记某个文件夹下为生成的代码
build/* linguist-generated
```

> 你可以在 [Linguist 官方文档](https://github.com/github/linguist/blob/main/docs/overrides.md) 中找到更多配置选项和说明。

这样，你就可以更精确地控制哪些文件应该被纳入语言统计，哪些文件应该被忽略，让 GitHub 更懂你的项目。

到这还没完，其实写这篇文章的动机，正是因为我自己最近也遇到了类似的问题。

最近在用 [protobuf.js](https://github.com/protobufjs/protobuf.js) 获取和处理 B 站弹幕数据，通过 [protobuf-cli](https://github.com/protobufjs/protobuf.js/tree/master/cli) 结合 proto 文件生成了一大堆 JavaScript 代码和 TypeScript 的类型定义。

相关功能完美实现，美滋滋地 push 了，打开主页一看，好家伙，Top 语言直接变成了 JavaScript，占比高达 95.8%，TypeScript 大哥已经被挤到犄角旮旯去了：

![B 站弹幕项目的语言分布（修复前）](https://s2.loli.net/2026/01/05/7KrOMpiqsBfVygF.png)

认真看完整篇文章的你，想必已经知道该怎么办了吧？

是的没错，就按照刚才说的简单配置下 `.gitattributes` 就行了：

```properties
# see https://github.com/github-linguist/linguist/blob/main/docs/overrides.md#generated-code
src/modules/bili/proto/compiled.js linguist-generated
src/modules/bili/proto/compiled.d.ts linguist-generated
```

再次美滋滋地 push 一遍，完美解决。

![B 站弹幕项目的语言分布（修复后）](https://s2.loli.net/2026/01/05/JT4jKvp189ed6QM.png)
