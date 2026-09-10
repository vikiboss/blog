---
title: 'CSS 样式隔离与性能优化'
date: 2022-02-21
topic: '笔记'
excerpt: '探讨 CSS 样式隔离与性能优化策略，分析方案优劣。'
tags:
  - 'CSS'
  - 'BEM'
  - '性能'
  - 'CSS 模块'
  - 'PostCSS'
---

## CSS 的发展历程

CSS 从诞生到现在，经历了多个发展阶段，每个阶段都在尝试解决不同的问题：

- **手写原生 CSS** - 使用 [BEM 命名法](http://getbem.com/introduction/)等规范来约束命名
- **预处理器时代** - [Sass](https://sass-lang.com/)、[Less](https://lesscss.org/) 和 [Stylus](https://stylus-lang.com/) 等工具让 CSS 编写更高效
- **后处理器出现** - [PostCSS](https://postcss.org/) 以插件的方式提供各种功能，如 [autoprefixer](https://github.com/postcss/autoprefixer) 自动添加浏览器前缀
- **模块化方案** - CSS Modules 需要搭配 [webpack](https://webpack.js.org/)、[Gulp](https://gulpjs.com/) 或 [Parcel](https://parceljs.org/) 等构建工具使用
- **CSS in JS** - 将样式写在 JS 中，代表作是基于 React 的 [styled-components](https://github.com/styled-components/styled-components)

原生 CSS 的一个大问题是**样式全局生效**，很容易造成命名冲突。为了解决这个问题，社区提出了各种样式隔离方案。

## 样式隔离方案

### BEM 命名法

BEM 是由 Yandex 团队提出的一套 CSS 命名规范，全称是 Block（块）、Element（元素）、Modifier（修饰符）。通过规范的命名约定，让类名更有意义，从名字就能看出元素的含义和结构层次。

BEM 的核心规则如下：

- **单中划线 `-`** - 仅作为连字符，连接块或元素名称中的多个单词
- **双下划线 `__`** - 连接块和块的子元素
- **双中划线 `--`** - 描述元素的状态或变体

举个例子：

```css
/* Block：可以理解为一个组件或模块 */
.article-detail {
  display: flex;
}

/* Element：Block 的组成部分 */
.article-detail__button {
  width: 120px;
  height: 36px;
}

/* Modifier：描述元素的状态或变体 */
.article-detail__button--primary {
  color: #fff;
  background-color: #3af;
}
```

虽然 BEM 能有效避免样式冲突，但缺点也很明显：类名写起来很繁琐，开发效率不高，维护成本也比较大。

### CSS Modules

CSS Modules 本质上还是 CSS 文件，但需要配合构建工具（如 webpack）使用。它为原生 CSS 增加了很多实用的[特性](https://github.com/css-modules/css-modules)：

- **作用域控制** - 默认样式是局部作用域，也可以显式声明全局样式
- **模块化导入** - 可以像 JS 模块一样被导入和使用
- **自动哈希** - 打包时会将类名转换为哈希值，彻底避免类名冲突

代码示例：

```css
/* style.css */
.className {
  color: green;
  background: red;
}

.otherClassName {
  /* 样式组合：继承 className 的样式 */
  composes: className;
  color: yellow;
}

.anotherClassName {
  /* 从其他文件导入样式 */
  composes: className from './base.css';
}

/* 默认是局部作用域，也可以显式声明 */
:local(.localClass) {
  color: #333;
}

/* 全局作用域 */
:global(.globalClass) {
  color: #666;
}
```

在 JS 中这样使用：

```js
import styles from './style.css'

element.innerHTML = `<div class="${styles.className}"></div>`
// 如果类名包含中划线，使用方括号语法
element.innerHTML = `<div class="${styles['class-name']}"></div>`
```

在 webpack 中的配置：

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            modules: {
              // 自定义哈希格式，可以使用多种变量
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
            },
          },
        },
      },
    ],
  },
}
```

打包后，类名会被转换为哈希值：

```css
/* 原来的 .className 变成了 */
._2DHwuiHWMnKTOYG45T0x34 {
  color: red;
}

/* 原来的 .otherClassName 变成了 */
._10B-buq6_BEOTOl9urIjf8 {
  background-color: blue;
}
```

### CSS 预处理器

为了让 CSS 编写更加高效和灵活，社区开发了很多 **CSS 预处理器**：

- [Sass](https://sass-lang.com/) - 最流行的 CSS 预处理器
- [Less](https://lesscss.org/) - 语法接近 CSS，学习成本低
- [Stylus](https://stylus-lang.com/) - 语法最灵活，可省略大括号和分号

这些预处理器虽然语法有些差异，但核心功能大同小异：

- **嵌套规则** - 可以像 HTML 层级一样嵌套编写样式
- **变量支持** - 定义颜色、尺寸等可复用的变量
- **函数功能** - 提供颜色处理、数学计算等内置函数
- **样式继承** - 支持 `@extend` 或 `@mixin` 等复用机制
- **文件导入** - 使用 `@import` 引入其他预处理器文件
- **高级特性** - 条件语句、循环语句等编程能力

需要注意的是，`@import` 的行为取决于导入的文件类型：

- **导入原生 CSS 文件**（如 `reset.css`）- 会产生额外的 HTTP 请求
- **导入预处理器文件**（如 `.scss`、`.less`、`.styl`）- 编译时会被合并，不产生额外请求

示例代码：

```css
/* ❌ 导入原生 CSS，会产生 HTTP 请求 */
@import 'reset.css';

/* ✅ 导入预处理器文件，编译时合并，不产生额外请求 */

/* body.less */
body {
  background: #eee;
}

/* style.less */
@import 'body.less'; /* 编译时会被合并到一个文件 */
```

### PostCSS

随着前端工程化的发展，PostCSS 应运而生。有人这样形容它：

> PostCSS 就是 CSS 界的 Babel。

PostCSS 通过解析 CSS 代码生成抽象语法树（AST），然后对 AST 进行各种转换处理，最终生成新的 CSS 代码。它本身只是一个平台，真正的功能来自于各种插件。

常见的应用场景：

- **语法校验** - 配合 [stylelint](https://stylelint.io/) 检测 CSS 语法错误
- **自动补全** - 使用 [autoprefixer](https://github.com/postcss/autoprefixer) 自动添加浏览器前缀
- **语法转译** - 将 CSS 新特性转译为兼容旧浏览器的代码

## CSS 性能优化

除了样式隔离，性能优化也是 CSS 开发中很重要的一环。下面是一些实用的优化建议：

### 文件和网络优化

- **合并 CSS 文件** - 减少 HTTP 请求次数，多个小文件合并成一个大文件
- **提取公共样式** - 将多个页面共用的样式（如 `normalize.css`）独立出来，利用浏览器缓存
- **使用 CSS Sprite** - 将多个小图标合并成一张大图（精灵图/雪碧图），减少图片请求
- **压缩 CSS 代码** - 使用构建工具压缩 CSS，去除空格、注释等
- **避免使用 `@import`** - 会产生额外的 HTTP 请求并阻塞渲染（预处理器中的 `@import` 除外）

### 选择器优化

- **控制嵌套层级** - CSS 选择器嵌套不超过 3 层，避免过深的层级
- **合理使用选择器** - ID 选择器前不需要再加其他选择器（如 `div#header` 应写成 `#header`）
- **减少通配符使用** - 通配选择器 `*` 和属性选择器 `[name=nav]` 性能较差，会遍历所有元素
- **删除无效选择器** - 清理未使用的 CSS 规则

### 样式复用

- **提取公共样式** - 相似元素（如 `button`、`input`）复用相同的样式类
- **利用继承特性** - 如果父元素已定义可继承属性（如 `color`、`font-family`），子元素无需重复设置
- **删除重复样式** - 避免在多处定义相同的样式规则

### 渲染性能

- **减少重排（Reflow）** - 避免频繁修改元素的几何属性（宽高、位置等），批量修改 DOM
- **用类名替代行内样式** - 避免用 JS 逐条修改样式，应先定义 CSS 类，然后修改 `className`
- **优化动画性能** - 少用复杂的 CSS 动画，优先使用 `transform` 和 `opacity`（这两个属性不会触发重排）
