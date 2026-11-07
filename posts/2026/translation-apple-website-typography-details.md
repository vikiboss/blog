---
title: '[转] Apple 官网排版细节鉴赏'
date: 2026-11-07
topic: '前端'
excerpt: '从字体、换行、视觉居中到本地化，分析 Apple 官网的排版细节。'
isOriginal: false
author: 'SkyWT'
tags:
  - '翻译'
  - '前端'
  - '排版'
  - 'CSS'
  - 'Apple'
---

> 原文：Apple 官网排版细节鉴赏
>
> 时间：2026 年 10 月 5 日
>
> 作者：SkyWT
>
> 链接：https://skywt.cn/blog/apple-typography-details

---

每隔一段时间，我就会逛逛 Apple 官网。Apple 作为人机交互的规则制定者，它的网页实现有太多值得我们学习和借鉴的地方。本文中，我梳理了一部分排版细节（并且在看源码的过程中又发现了一些新的细节 😂），与你分享。

## 定制的 Web 字体

Apple 在 2015 年推出了 SF 系列西文字体（一般使用 SF Pro）和苹方系列中文字体。然而打开 Apple 简体中文官网，可以发现字体栈中第一个是一款名为「**SF Pro SC**」的字体。

```css
.typography-label:lang(zh-CN) {
  font-family: SF Pro SC,SF Pro Display,SF Pro Icons,PingFang SC,Helvetica Neue,Helvetica,Arial,sans-serif
}
```

SF Pro SC 是进入网页时会加载的一款 Web 字体。那就很奇怪了：既然是 Apple 的字体，居然没有内置于 iOS / macOS，也找不到这款字体的官方公开资料。

事实上，这个字体是 Apple 为简体中文 Web 官网定制的一款非公开字体。下载打开可以发现，其中只包含汉字和部分标点符号，字型和 PingFang SC 完全相同，但进行了一些微调。按照字体栈的设置，西文会回退到 SF Pro Display，因此网络正常的情况下，实际使用的字体通常是：汉字和全角标点使用 SF Pro SC，西文使用 SF Pro Display。

SF Pro SC 可以看成「专门为了和 SF Pro 混排而优化的简体中文字体」。下面是三种字体栈的显示效果对比：

![三种字体栈的显示效果对比](https://img.skywt.net/apple-typography-details/sf-pro-sc-font-stacks-compare.png)

可以看到，相较于 PingFang SC，这款 SF Pro SC 主要有两点调整：**中文字型更小**，**全角标点符号字符宽度更窄**。为什么要做这种调整呢？

### 中文字型更小

仔细观察上方截图的第二行 SF Pro Display 和 PingFang SC 的渲染效果，会感觉汉字视觉上比英文大一些。特别是「Mac」的左侧，「买」的高度明显高于 M 字母的高度。这是由于中文和西文字体对空间的使用方式并不相同，单独设计时并不会保证对齐，如果直接混排，视觉上西文就是会看起来更小。

因此 SF Pro SC 基于 PingFang SC 缩小了汉字字型，针对中英文混排进行视觉校正。

我的网站 skywt.cn 使用的**思源宋体**（Source Han Serif，别名 Noto Serif SC），其实也有类似的处理。这个字体包含的西文部分源于 Source Serif 系列，但西文字符被调整得更大，使得其与中文混排时视觉观感更一致。可以看下图的中英混排文案「换成 iPhone 怎么样」的对比，以 `64px` 作为基准：

- 第一行是全部使用 Source Han Serif，中英混排最为协调。
- 如果将英文部分换成 Source Serif 4，即第三行的样式，会发现英文看起来明显比中文小。注意此时 `font-size` 设置并没有任何改变，都是 `64px`。
- 如果要修正这个视觉偏差，需要调大其中的「iPhone」一词至大约 `77px`，即第二行的样式。此时「iPhone」一词看起来又会偏重。Source Serif 4 字体提供了无级的字重（Weight）和光学尺寸（Optical Size）调节，需要进行较为复杂的调节才能调整出和第一行 Source Han Serif 相近的效果。

![Source Serif 系列字体栈对比](https://img.skywt.net/apple-typography-details/source-han-serif-fonts-compare.png)

总结来说，为了让中英文混排更加协调，SF Pro SC 的做法是将汉字调小，Source Han Serif 则将西文调大。

### 全角标点符号字符宽度更窄

Apple 简体中文官网所有的标点符号，看起来都是半角宽度，但查看源码会发现网站并没有使用真正的半角标点符号，而是在字体层面调整全角标点宽度。**SF Pro SC 的全角标点符号宽度是字宽的 0.5～0.6 倍**。

我认为这个设计主要目的是：**保障包含标点的宣传语的阅读体验**。Apple 大量使用了含有标点的宣传语，比如上面的「在 Apple 购买 Mac，好处多多。」如果使用全宽的全角标点符号，由于标题字体较大，会导致「购买 Mac」和「好处多多」之间视觉空隙过大，产生不连贯感。为了视觉统一和字符标准，直接在字体层面对这一展现进行了调整。

更多关于 SF Pro SC 这款字体的探索，可以参考这篇文章： [SF Pro SC 是什么字体？](https://pudge1996.medium.com/what-is-sf-pro-sc-b903b828bb50)。

## 换行控制

### 避免孤行

所谓孤行，指的是某个段落末尾最后一个字正好成为新的一行，这样会让这个段落在视觉上看起来不平衡。在传统的杂志排版规范中都会提到避免孤行。Apple 网站的处理方式是：用设置了 `nowrap` 的 `span` 包裹段落最后一个词，避免其被拆开。

例如 [环境责任](https://www.apple.com.cn/environment/) 页面的这段文案：

> 我们已空前接近 Apple 2030 目标，这是我们基于科学制定的宏伟蓝图，立志在全球实现碳足迹净零排放。以 2015 年为基准，我们致力于将自己的温室气体排放量减少 75%，再优先采用以自然为本且符合严格国际标准的解决方案，来抵消剩余的碳排放。

HTML 如下，注意末尾的「碳排放。」进行了保护。这样就不会让最后一行只有「放。」成为孤行。

```html
<p ...>
  我们已空前接近 Apple 2030 目标，这是我们基于科学制定的宏伟蓝图，
  <br class="large">
  立志在全球实现碳足迹净零排放。以 2015 年为基准，
  <span class="underline">我们致力于将自己的温室气体排放量减少 75%</span>
  ，再优先采用以自然为本且符合严格国际标准的解决方案，来抵消剩余的
  <span class="nowrap">碳排放。</span>
</p>
```

### 保护会被换行打断的词语

来看看 [教育](https://www.apple.com.cn/education-initiative/) 页面的这段文案：

> 要创造一个更加公正平等的世界，教育至关重要。为此，我们携手众多合作伙伴，与 100 多个国家及地区的求学者建立联系，为教育工作者们提供支持，创造各种校外学习机会，并推动种族平等与公正。当教育的大门能开得更大，每个人就能有更多途径来发挥自身潜能。

这段话的 HTML 是下面这样的。除了末尾的「自身潜能。」是上面提到的避免孤行的规则，其他的「伙伴，」「教育」「创造」「每个人」「发挥」这几个词，你知道为什么要做 `nowrap` 保护吗？

```html
<p ...>
  要创造一个更加公正平等的世界
  <span class="s-p">，</span>
  <br class="small">
  教育至关重要。为此，我们携手众多合作
  <span class="nowrap">伙伴，</span>
  与 100 多个国家及地区的求学者建立联系，为
  <span class="nowrap">教育</span>
  工作者们提供支持
  <span class="l-p m-rp-s-p">，</span>
  <br class="large">
  <span class="nowrap">创造</span>
  各种校外学习机会，并推动种族平等与公正。当教育的大门能开得更大
  <span class="l-p m-rp-s-p">，</span>
  <br class="large">
  <span class="nowrap">每个人</span>
  就能有更多途径来
  <span class="nowrap">发挥</span>
  <span class="nowrap">自身潜能
    <span class="l-p">。</span>
  </span>
</p>
```

先提示一下：这段文字的文本对齐方式是 `center`，容器有三种固定宽度：`large` 为 `860px`、`medium` 为 `600px`、`small` 为 `330px`。原网页在这里，你可以试试探索，看看能否找到答案： [www.apple.com.cn/education-initiative/](https://www.apple.com.cn/education-initiative/)。

**揭晓答案**：如果我们复制这一段纯文字，在原来的 `p` 元素里新建一个纯文本节点（Text Node），对比三种容器宽度下的表现，就会发现：

- `large` 尺寸：「伙伴」「创造」两个词被换行拆开了。
- `medium` 尺寸：「教育」「发挥」被换行拆开了。
- `small` 尺寸：「伙伴」「建立」「每个人」被换行拆开了。（其中「伙伴」被保护后，「建立」就被安排到了不换行的位置，因此无需保护）

![官网版本与去除换行保护版本的对比](https://img.skywt.net/apple-typography-details/paragraph-wrap-compare.png)

所以在 Apple 制作这个网页的时候，考虑到了在任意一种容器宽度下，段落实际渲染后的排版效果，精确地保护了每行末尾被自动换行打断的词语！

### 响应式换行控制

在上面的 HTML 里，我们还看到类似 `<br class="small">` 这样显式插入的换行符，表示只有在 `small` 屏幕尺寸会在此处换行。在网站上的短标题文案，有很多地方都通过这种方式进行响应式换行控制。

例如 MacBook Pro 底部的「想升级，时机正正好。」标题：

```html
<h2 ...>
  想升级<span class="s-p">，</span>
  <br class="small">
  <span class="nowrap">时机正正好
    <span class="l-p">。</span>
  </span>
</h2>
```

因此，在中大尺寸屏幕就会是完整的一行，在小屏幕就会换行显示为两行：

> 想升级，\
> 时机正正好。

### 英文产品名中使用不换行空格

这是继承自 Apple.com（英语官网）的做法，所有类似 iPhone 18 Pro Max 这样带空格的产品名，源码中都出现为 `iPhone&nbsp;18&nbsp;Pro&nbsp;Max`，避免完整的产品名被自动换行打断。

```html
<p>
  iPhone&nbsp;Duo 来了，首款可折叠 iPhone 全新揭幕。上手一展开，就是迄今最薄 iPhone，
  <strong>历来最大 iPhone 显示屏直入眼帘，比 iPhone&nbsp;18&nbsp;Pro&nbsp;Max 足足大了 50%</strong>
  ；另一面的外屏，显示面积高达 iPhone&nbsp;18&nbsp;Pro 的 90% 以上。iOS 也全面重塑，联手带来各种新摆法、新角度，灵动体验花样百出。
  <span class="nowrap">一切</span>
  精彩，都纳入坚固精巧的机身中，轻松装进你口袋。这个 iPhone，不同于任何 iPhone。
</p>
```

## 标题居中视觉校正

中文的全角标点符号，主体居于左下角，其他部分都是空白。即使 Apple 的 SF Pro SC 字体的全角标点更窄，和汉字相比，标点视觉中心依然集中于下方或左下角。

对于末尾带标点符号的标题，居中显示时，这会导致视觉偏左，如下图。标题字号越大，这种偏差越明显，特别是上方有居中图标等参照物的情况下。

![未进行视觉校正的标题](https://img.skywt.net/apple-typography-details/title-center-unjustified.png)

这类标题需要右移大约 `0.5em` 才能视觉居中，如下图：

![进行了视觉校正的标题](https://img.skywt.net/apple-typography-details/title-center-justified.png)

我在 Apple 官网找到至少三种方式实现这种校正，基本思路是：让末尾标点不占用计算宽度，或者人为设置整个标题右移。

- **对行末标点用设置了 `position: absolute` 的 `span` 进行包裹**。比如 [Apple Pay](https://www.apple.com.cn/apple-pay/) 页面顶部的文案「支付，由 Apple 支招。」末尾的句号。值得注意的是，在 `small` 情况下「支付，」后会换行，因此这里的逗号用了 `<span class="s-p">，</span>` 包裹，只有在 `small` 尺寸会做校正。
- **将整个标题左侧增加额外 `0.5em` 的 `padding`**。 [隐私](https://www.apple.com.cn/privacy/) 页面的标题「力保隐私安全，这很 Apple。」可能由于这里做了一个文案由密码占位符保护、随着滚动慢慢揭示的效果，因此没法再定制行末标点的 `position` 属性，所以采用了这个方案。
- 在标点后加入 `margin-right` 为 `-0.6rem` 的不可见 `span`。 [iPhone Duo](https://www.apple.com.cn/iphone-duo/) 页面使用了这种方法，例如标题「新面孔加入 iPhone，全场折服。」两个标点后都添加了 `<span class="center-symbol"></span>`。

## 中文与西文字符间的空距

中文与西文字符间的空距是老生常谈的问题。一般来说，中英文混排时，需要在中文和英文之间加入空距。中文与阿拉伯数字混排也同理。

W3C《中文排版需求》6.3.3 [横排的中、西文混排配置](https://www.w3.org/TR/clreq/#mixed_text_composition_in_horizontal_writing_mode) 中指出：

> 原则上，汉字与西文字母、数字间使用**不多于四分之一个汉字宽的字距或空白**。但西文、数字出现在行首或行尾时，则无须加入空白。

大多数专业的排版软件，例如 Microsoft Word，都会自动加入这一空距。Apple 的操作系统内置的文字排版引擎，也会自动加空距（你可以在 Apple 备忘录试试）。然而一直以来 Web 平台并没有完全普及的加空距方式。直到近两年主流浏览器才普及 `text-autospace: normal`。

Apple 官网使用的方式是加空格。Apple 内部应该是将其作为文案规范，所有文案涉及中英混排的部分，都加入了额外空格。（但偶尔能发现某些临时推出的页面漏了一两个空格。由此可见是人工处理的 😂）

自从注意到这个空格问题后，我看一般的网页里中英文挤在一起会觉得非常难受。如果你也一样，可以试试在浏览器安装 [pangu.js](https://github.com/vinta/pangu.js)。

> 漢學家稱這個空白字元為「盤古之白」，因為它劈開了全形字和半形字之間的混沌。另有研究顯示，打字的時候不喜歡在中文和英文之間加空格的人，感情路都走得很辛苦，有七成的比例會在 34 歲的時候跟自己不愛的人結婚，而其餘三成的人最後只能把遺產留給自己的貓。畢竟愛情跟書寫都需要適時地留白。

## 文案本地化

文案的本地化本身并不是一个技术上的问题，但这里我特别想要提及一个例子，我感觉 Apple 在这方面做到了变态的地步。

今年 9 月新发布的 iPhone 18 Pro、Apple Watch 等产品，发售日正好在 9 月 18 日。为了规避政治敏感风险，**Apple 中国大陆官网所有日期都经过了特别处理**，将「**9 月 18 日发售**」改为「**本月 18 日发售**」。其他普通日期则没有处理。据传，发给经销商的宣发材料中也进行了相应处理。可以看这个 [9 月 16 日的网页存档](https://web.archive.org/web/20260916013459/https://www.apple.com.cn/)。

![iPhone 18 Pro 的发售日期文案](https://img.skywt.net/apple-typography-details/iphone-918-text.png)

## 总结：职业态度与品牌价值

世界上除了 Apple 还有几个品牌网站能做到这种程度的排版和本地化细节呢？**答案是 0 个**。Apple 独一无二的品牌价值，正是从这些细节中凝聚的。

从产品细节上，还能够看到产品背后的人的**职业态度**。我自己平常在使用某些平庸的产品时，经常觉得工作人员也太不认真了，太敷衍糊弄了，甚至太不敬业了。于我而言，我愿意付一定的溢价购买更贵的产品，往往并非由于产品本身有多高的差异化价值，而是因为：我希望买到「**怀着认真的职业态度的人**」做的产品。

.........
