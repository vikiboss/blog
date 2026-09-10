---
title: 'CSS 选择器小归纳'
date: 2022-02-16
topic: '笔记'
excerpt: '系统梳理基础选择器、伪类与伪元素、组合选择器（后代、子代、兄弟）的用法与区别。'
tags:
  - 'CSS'
  - '选择器'
  - '前端'
  - '教程'
  - '速查清单'
---

选择器是 CSS 规则的一部分，位于 CSS 声明块之前。它告诉浏览器应该将样式应用到哪些 HTML 元素上。简单来说，选择器就是用来「选中」页面元素的工具。

![选择器示例](https://s2.loli.net/2022/02/16/grAe6BM4mC2Tzdh.png)

## 基础选择器

### 类型（标签）、类和 ID 选择器

这是最基础也是最常用的三种选择器：

```css
/* 类型选择器：选中所有 a 标签 */
a {
  text-decoration: none;
}

/* 类选择器：选中所有 class="box" 的元素 */
.box {
  border: 1px solid #3af;
}

/* ID 选择器：选中 id="name" 的元素 */
#name {
  border-radius: 4px;
}
```

### 属性选择器

属性选择器可以根据元素的属性和属性值来选中元素：

```css
/* 选中所有带 title 属性的 a 标签 */
a[title] {
  color: #3af;
}

/* 选中地址以 vikiboss.top 结尾的链接，不区分大小写 */
a[href$='vikiboss.top' i] {
  color: red;
}
```

属性选择器还支持更多匹配方式：

- `[attr]`：存在 attr 属性
- `[attr="value"]`：属性值完全等于 value
- `[attr^="value"]`：属性值以 value 开头
- `[attr$="value"]`：属性值以 value 结尾
- `[attr*="value"]`：属性值包含 value
- `[attr~="value"]`：属性值是空格分隔的多个值，其中一个等于 value
- `[attr|="value"]`：属性值等于 value 或以 `value-` 开头

### 通配选择器

通配选择器 `*` 可以选中所有元素，常用于重置默认样式：

```css
/* 重置所有元素的内外边距 */
* {
  margin: 0;
  padding: 0;
}
```

## 伪类与伪元素

### 伪类选择器

伪类选择器用于选择元素的特殊状态，比如鼠标悬停、被选中、第一个子元素等：

```css
/* 鼠标悬停时改变颜色 */
a:hover {
  color: #3af;
}
```

#### 常见伪类列表

**链接相关：**

```css
/* 常用于 a 链接的几个伪类，使用顺序不能乱，记为 LVHA（love -> hate，由爱生恨） */
a:link      /* 未访问的链接 */
a:visited   /* 已访问的链接 */
a:hover     /* 鼠标悬停 */
a:active    /* 鼠标按下 */
```

**结构相关：**

```css
/* 选中兄弟元素中的第一个元素（:last-child 类似） */
div:first-child

/* 选中兄弟元素中第一个 div 类型的元素（:last-of-type 类似） */
div:first-of-type

/* 选中兄弟元素中唯一的元素 */
div:only-child

/* 选中兄弟元素中唯一的 div 类型元素 */
div:only-of-type

/* 选中兄弟元素中的第二个元素 */
div:nth-child(2)

/* 选中兄弟元素中第 1、3、5... 个元素（奇数可用 odd，偶数可用 even） */
div:nth-child(2n+1)
div:nth-child(odd)

/* :nth-of-type(an+b) 与 nth-child 类似，只不过限定了元素类型 */
/* :nth-last-child(an+b) 与 nth-child 类似，只不过从后往前计数 */
```

**逻辑与状态相关：**

```css
/* 选中不包含 .not 类的 div */
div:not(.not)

/* 选中带有 lang 属性且值为 python 的元素 */
span:lang(python)

/* 选中文档的根元素（通常是 <html>） */
:root

/* 选中没有子元素的元素 */
div:empty
```

**表单相关：**

```css
/* 选中获得焦点的元素 */
input:focus

/* 选中被选中的单选框或复选框 */
input:checked

/* 选中启用状态的表单元素 */
input:enabled

/* 选中禁用状态的表单元素 */
input:disabled

/* 选中值在有效范围内的表单元素 */
input:in-range

/* 选中值超出有效范围的表单元素 */
input:out-of-range

/* 选中值无效的表单元素 */
input:invalid

/* 选中值有效的表单元素 */
input:valid
```

> 更多伪类参考：[标准伪类索引 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes#%E6%A0%87%E5%87%86%E4%BC%AA%E7%B1%BB%E7%B4%A2%E5%BC%95)

### 伪元素选择器

伪元素选择器用于选中元素的特定部分，比如第一行、第一个字母等。它们不对应真实的 HTML 元素，而是虚拟创建的：

```css
/* 在 h2 元素前面插入内容 */
h2::before {
  content: '#';
  color: #3af;
}
```

#### 常见伪元素列表

```css
/* 在元素内容前插入内容，默认为行内元素 */
div::before

/* 在元素内容后插入内容，默认为行内元素 */
div::after

/* 选中块级元素的第一个字母（必须是第一行第一个，前面无其他内容） */
p::first-letter

/* 选中块级元素的第一行（取决于元素宽度、文字大小等） */
p::first-line

/* 选中被用户高亮（选中）的文本 */
::selection

/* 选中表单元素的占位符文本 */
input::placeholder
```

> 更多伪元素参考：[标准伪元素索引 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements#%E6%A0%87%E5%87%86%E4%BC%AA%E5%85%83%E7%B4%A0%E7%B4%A2%E5%BC%95)

## 组合选择器

### 后代选择器

后代选择器使用空格分隔，选中所有后代元素（包括直接子元素和间接后代）：

```css
/* 一级列表采用实心圆 */
li {
  list-style-type: disc;
}

/* 所有二级及更深层的列表换为空心圆 */
li li {
  list-style-type: circle;
}
```

### 子代选择器

子代选择器使用 `>` 符号，只选中直接子元素：

```html
<style>
  span {
    background-color: white;
  }
  /* 只选中 div 的直接子元素 span */
  div > span {
    background-color: orange;
  }
</style>

<div>
  <span>我是橙色背景 <span>我是白色背景</span></span>
  <span>我是橙色背景</span>
</div>
<span>我也是白色背景</span>
```

### 相邻兄弟选择器

相邻兄弟选择器使用 `+` 符号，选中紧跟在指定元素后面的兄弟元素：

```css
/* 选中紧跟在 img 后面的 p 元素 */
img + p {
  font-weight: bold;
}
```

### 通用兄弟选择器

通用兄弟选择器使用 `~` 符号，选中指定元素后面所有的兄弟元素：

```css
/* 选中 p 后面所有的 span 兄弟元素 */
p ~ span {
  color: red;
}
```
