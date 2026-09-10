---
title: 'CSS 元素居中与常用布局方式'
date: 2022-02-22
top_image: 'https://s2.loli.net/2022/02/22/2CnjXk5wm4tSKIL.png'
topic: '笔记'
excerpt: '全面解析 CSS 元素居中的 5 种实现方案（Flex、Grid、定位等）。'
tags:
  - 'CSS'
  - 'Flexbox'
  - 'Grid'
  - '布局'
  - '前端'
---

## CSS 元素居中

下面是一个使用 Flex 布局实现元素居中的示例，灰色容器中的白色方块通过 CSS 实现了水平和垂直居中：

<style>
  .demo-container {
    width: 100%;
    max-width: 400px;
    height: 300px;
    margin: 24px auto;
    background-color: rgba(128, 128, 128, 0.1);
    border: 1px solid rgba(128, 128, 128, 0.2);
    border-radius: 4px;
    /* 使用 Flex 布局实现子元素水平和垂直居中 */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .demo-box {
    width: 120px;
    height: 120px;
    background-color: rgba(128, 128, 128, 0.05);
    border: 1px solid rgba(128, 128, 128, 0.3);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
</style>

<div class="demo-container">
  <div class="demo-box">居中元素</div>
</div>

对应的关键代码如下：

```css
.demo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

```html
<div class="demo-container">
  <div class="demo-box">居中元素</div>
</div>
```

实现 CSS 元素**水平、垂直**居中的方式有很多，下面介绍几种常用方法：

- 使用 `Flex` 搭配居中属性实现
- 使用 `Grid` 搭配居中属性实现
- 使用 `position` + `margin` 实现
- 使用 `position` + `transform` 实现
- 使用 `table-cell` + `margin` 实现

### 一、Flex 实现元素居中

使用 Flex 布局是最简单直观的方式，只需要设置父元素为 `flex` 并配合居中属性即可。

```html
<style>
  #box {
    width: 300px;
    height: 300px;
    background-color: #fe9;
    /* 设置父元素为 flex 布局 */
    display: flex;
    /* 垂直居中 */
    align-items: center;
    /* 水平居中 */
    justify-content: center;
  }
  #app {
    width: 100px;
    height: 100px;
    background-color: #3af;
  }
</style>

<div id="box">
  <div id="app"></div>
</div>
```

### 二、Grid 实现元素居中

Grid 布局提供了更简洁的居中方式，使用 `place-items` 属性即可同时实现水平和垂直居中。

```css
.container {
  display: grid;
  /* place-items 是 align-items 和 justify-items 的简写 */
  place-items: center;
}
```

### 三、position + margin 实现元素居中

这种方式需要配合绝对定位使用，有两种实现方法。

**方式一：使用负 margin**

这种方式需要知道子元素的具体尺寸。

```html
<style>
  #box {
    width: 300px;
    height: 300px;
    background-color: #fe9;
    position: relative;
  }
  #app {
    width: 100px;
    height: 100px;
    background-color: #3af;
    position: absolute;
    /* 先将元素左上角定位到父元素中心 */
    top: 50%;
    left: 50%;
    /* 再通过负 margin 将元素自身中心移动到父元素中心 */
    margin: -50px 0 0 -50px;
  }
</style>

<div id="box">
  <div id="app"></div>
</div>
```

**方式二：使用 margin auto**

这种方式更加优雅，不需要手动计算负 margin 值。

```html
<style>
  #box {
    width: 300px;
    height: 300px;
    background-color: #fe9;
    position: relative;
  }
  #app {
    width: 100px;
    height: 100px;
    background-color: #3af;
    position: absolute;
    /* 将子元素的四个定位属性全部设为 0 */
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    /* 设置 margin 为 auto 自动居中 */
    margin: auto;
  }
</style>

<div id="box">
  <div id="app"></div>
</div>
```

### 四、position + transform 实现元素居中

这种方式与方式三的方法一类似，但使用 `transform` 代替 `margin`，优点是**即使不知道子元素的具体尺寸也能生效**。

```html
<style>
  #box {
    width: 300px;
    height: 300px;
    background-color: #fe9;
    position: relative;
  }
  #app {
    width: 100px;
    height: 100px;
    background-color: #3af;
    position: absolute;
    /* 先将元素左上角定位到父元素中心 */
    top: 50%;
    left: 50%;
    /* 使用 transform 将元素自身中心移动到父元素中心 */
    /* translate 的百分比是相对于元素自身尺寸的 */
    transform: translate(-50%, -50%);
  }
</style>

<div id="box">
  <div id="app"></div>
</div>
```

### 五、table-cell + margin 实现元素居中

这是一种比较传统的方式，利用了表格单元格的特性来实现居中。

```html
<style>
  #box {
    width: 300px;
    height: 300px;
    background-color: #fe9;
    /* 将父元素设置为表格单元格 */
    display: table-cell;
    /* 使用 vertical-align 实现垂直居中 */
    vertical-align: middle;
  }
  #app {
    width: 100px;
    height: 100px;
    background-color: #3af;
    /* 使用 margin auto 实现水平居中 */
    margin: 0 auto;
  }
</style>

<div id="box">
  <div id="app"></div>
</div>
```

### 居中方式的选择建议

根据不同的场景，推荐使用以下方式：

**1. 水平 + 垂直居中（推荐 Flex）**

对于同时需要水平和垂直居中的场景，Flex 是最佳选择。

```css
.container {
  display: flex;
  /* 垂直居中 */
  align-items: center;
  /* 水平居中 */
  justify-content: center;
}
```

> 提示：`flex` 默认主轴为水平方向（`row`），可通过 `flex-direction` 修改。

**2. 仅水平居中**

对于块级元素，使用 `margin: 0 auto` 即可。

```css
.element {
  margin: 0 auto;
}
```

**3. 仅垂直居中**

可以使用 `table-cell` 或者 `flex` 布局。

```css
/* 方式一：table-cell */
.container {
  display: table-cell;
  vertical-align: middle;
}

/* 方式二：flex（更推荐）*/
.container {
  display: flex;
  align-items: center;
}
```

**4. 文字垂直居中**

单行文字可以设置 `line-height` 等于容器高度。

```css
.text {
  height: 120px;
  line-height: 120px;
}
```

## CSS 浮动

浮动（`float`）是一种传统的布局方式，虽然现在更推荐使用 `Flex` 和 `Grid`，但在某些场景下浮动依然有用，比如实现文字环绕效果。

关于 CSS 浮动的详细说明可以参考 [float - MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/float)。

### 清除浮动

浮动元素会脱离文档流，可能导致父元素高度坍塌。解决方法有以下两种：

**方式一：使用伪元素清除浮动**

```css
.clearfix::after {
  content: '';
  display: block;
  /* clear: both 表示元素两侧都不允许有浮动元素 */
  clear: both;
}
```

**方式二：触发 BFC（块级格式化上下文）**

为父元素设置以下任一属性即可：

```css
.container {
  /* 以下任一属性都可以触发 BFC */
  overflow: hidden;
  display: flex;
  display: table;
  display: table-cell;
  /* ... */
}
```

## Flex 布局

Flex 是 Flexible Box 的缩写，意为**弹性布局**，是现代网页布局的首选方案。它可以轻松实现各种复杂的布局效果，并且具有良好的响应式特性。

Flex 布局由**容器**（flex container）和**项目**（flex item）组成，容器默认存在两根轴线：水平的主轴（main axis）和垂直的交叉轴（cross axis）。

推荐教程：

- [Flex 布局教程：语法篇 - 阮一峰](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
- [Flex 布局教程：实例篇 - 阮一峰](https://www.ruanyifeng.com/blog/2015/07/flex-examples.html)

## Grid 布局

Grid（网格布局）是 CSS 中**最强大**的布局系统，它可以将网页划分成一个个网格，然后任意组合这些网格来创建复杂的布局。

![Grid 布局示意图](https://s2.loli.net/2022/02/22/2CnjXk5wm4tSKIL.png)

### Grid 与 Flex 的区别

Grid 和 Flex 都可以控制容器内部元素的位置，但它们的适用场景不同：

- **Flex 布局**：一维布局，基于轴线（主轴和交叉轴）来排列元素，适合用于单行或单列的布局
- **Grid 布局**：二维布局，同时控制行和列，将容器划分成网格单元，适合用于复杂的整体页面布局

简单来说，Flex 更适合组件内部的布局，Grid 更适合页面整体的布局规划。

推荐教程：

- [CSS Grid 网格布局教程 - 阮一峰](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)
