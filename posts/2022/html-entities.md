---
title: '浅谈 HTML 中的字符实体（如 `&nbsp;`、`&lt;` 等）'
date: 2022-12-25
topic: '前端'
excerpt: '简单的了解和介绍，日常见的还是不少，不至于不知道是个啥玩意儿'
tags:
  - 'HTML'
  - '编码'
  - 'Web 标准'
  - '前端'
  - '安全'
---

在入门学习 HTML 和 CSS 编写简单网页的时候，由于标签内容中的**多个空格会被自动合并为一个空格**，我们可能会使用 `&nbsp;` 来实现多个空格的效果。

除此之外，为了实现某些布局而你对 CSS 的 `margin` 和 `padding` 等属性又不熟悉的时候，也可能歪打正着了解到 `&nbsp;` 这个东西。

确实，它可以解决多个空格被自动合并的问题，~~也可以用来调整页面布局~~，但最好还是使用 CSS 来处理布局问题，别依赖于 `&nbsp;`。

那么问题来了，刚提到的 `&nbsp;` 以及我们经常看到的 `&lt;`、`&gt;` 等，到底是什么？

## 字符实体引用（Named Character References）

在 SGML、HTML 与 XML 文档中，很多字符都是保留字符，例如 `<` 和 `>`，对于标记语言来说具有特殊意义。如果某些 Unicode 字符在文档的当前编码方式（如 ISO-8859-1）中不能直接表示，或因为使用了 HTML 语法符号的子集导致解析成语法而无法显示原来的字符时，可以通过**字符值引用**或者**字符实体引用**两种转义序列来表示这些不能直接编码的字符。而我们上文提到的 `&nbsp;` 就属于**字符实体引用**。

> HTML 标准中关于实体名称的说明：[Named character references](https://html.spec.whatwg.org/multipage/named-characters.html#named-character-references)，标准中还提供了一份稳定的 [JSON 格式的数据](https://html.spec.whatwg.org/entities.json)，供开发者下载使用。

同一个符号可以用**字符实体**和**字符值**两种方式引用。比如刚才的空格字符，就可以使用对应的**字符值引用** `&#32;` 来表示。**实体名称**的优势在于便于记忆，但不能保证所有的浏览器都能顺利识别它，而**字符值**则没有这种担忧，但它实在不方便记忆。

HTML 4 DTD 定义了 252 个命名实体。细心的你可能会发现，这里的**字符值**其实就是对应着符号的 Unicode 编码，它可以用十进制（如 `&#32;`），也可以用十六进制（如 `&#x20;`）表示。

> 查看所有字符实体，也可前往 [字符实体引用列表 - 维基百科](https://zh.wikipedia.org/zh-cn/XML%E4%B8%8EHTML%E5%AD%97%E7%AC%A6%E5%AE%9E%E4%BD%93%E5%BC%95%E7%94%A8%E5%88%97%E8%A1%A8)。

## 如何转换

如果你想知道一个符号的字符实体或字符值如何表示，你可以通过 [这个网站](https://mothereff.in/html-entities) 进行快速转换，它支持设置转换结果为字符实体和字符值。

## 在实际开发中该如何处理

你可以使用社区的 [html-entities](https://github.com/mdevils/html-entities) npm 模块进行处理。

下面是 ESM 的简单使用示例：

```js
import { encode, decodeEntity } from 'html-entities'

encode('< > " \' & © ∆')
// -> '&lt; &gt; &quot; &apos; &amp; © ∆'

encode('< ©', { mode: 'nonAsciiPrintable' })
// -> '&lt; &copy;'

encode('< ©', { mode: 'nonAsciiPrintable', level: 'xml' })
// -> '&lt; &#169;'

decodeEntity('&lt;')
// -> '<'

decodeEntity('&copy;', { level: 'html5' })
// -> '©'

decodeEntity('&copy;', { level: 'xml' })
// -> '&copy;'
```

希望本篇对你有所帮助或启发。

## 参考

- [HTML 实体符号编码解析 - mingkr](https://blog.csdn.net/mingkr/article/details/38391061)，原文在 [这里](http://mingkr.com/html-entity)（已失效）
- [XML 与 HTML 字符实体引用列表 - Wikipedia](https://zh.wikipedia.org/zh-cn/XML%E4%B8%8EHTML%E5%AD%97%E7%AC%A6%E5%AE%9E%E4%BD%93%E5%BC%95%E7%94%A8%E5%88%97%E8%A1%A8)
