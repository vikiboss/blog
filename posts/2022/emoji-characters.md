---
title: '由 emoji 字符分割问题引发的对 emoji 的重新认识'
date: 2022-12-02
topic: '技术'
excerpt: '从 emoji 字符分割异常，延伸到了很多技术实现细节，学到很多。'
tags:
  - 'JavaScript'
  - 'Emoji'
  - 'Unicode'
  - 'String'
  - 'Intl'
---

> 文章内容较多，如果只是寻找解决方案，请直接划到文末。

谈到 `emoji` 想必我们都不陌生，它是一种广泛使用在网页和聊天中的表情符号，如 😂、😄 等。

虽然 emoji 是合法的字符串内容，但由于其反直觉的长度和类型的多样性，在分割的时候很可能会产生出乎意料的结果。比如下面这个例子：

```js
'😃⛔'.split('') // ['\uD83D', '\uDE03', '⛔']
```

なに？怎么两个符号分割变成了三个？还乱码了？

别慌，让我们先来看看它们的长度。

```js
'⛔'.length // 1
'😃'.length // 2
'👦🏾'.length // 4
'🏳️‍🌈'.length // 6
'👨‍👨‍👧‍👧'.length // 11
```

完了，这不看还不知道，这越看越离谱。究竟是咋回事？为什么 emoji 分割后有的会乱码而有的不会？为什么 emoji 的长度不是 1？

让我们带着这些疑问，继续往下看。

## 重新认识 emoji

绘文字（日语：絵文字 / えもじ），也就是本文所说的 emoji，是日本在无线通信中所使用的视觉情感符号。在中国，emoji 通常叫做「小黄脸」，或者直称 emoji。自苹果公司发布的 iOS 5 输入法中加入了 emoji 后，这种表情符号开始席卷全球，emoji 已被大多数现代计算机系统所兼容的 Unicode 编码采纳，普遍应用于各种手机短信和社交网络中。

2010 年 10 月发布的 Unicode 6.0 版首次收录了表情符号编码，通过 Unicode 区块来划分不同的 emoji。

### 肤色修饰符

除了这些常规的 emoji 表情之外，Unicode 8.0 中还加入了 5 个修饰符：🏻 🏼 🏽 🏾 🏿，加在部分人物 emoji 表情的后面，用来调节人形表情的肤色，这些叫做**表情符号菲茨帕特里克修饰符**，对应了菲茨帕特里克度量对人类肤色的分类。

比如：👦 👦🏻 👦🏼 👦🏽 👦🏾 👦🏿 和 👧 👧🏻 👧🏼 👧🏽 👧🏾 👧🏿

### 组合 emoji

此外，还有通过组合方式产生的 emoji，比如使用 U+200D **零宽连字**（ZWJ）将两个表情符号连起来，使其看起来像是一个表情符号（如：👨‍👩‍👧）。这在系统支持的情况下会显示为一个男人、一个女人和一个女孩组成的家庭表情符号，而不支持的系统则会依序显示这三个表情符号（👨👩👧）。此外还有性别组合 emoji，比如某个女性 emoji 表情，加上零宽连字和 ♂ 就成为了男性版本。

> 有关 Unicode 中 emoji 的规范标准参见 [这里](http://unicode.org/reports/tr51/)，定义了 Unicode 表情符号字符和序列的结构，并提供了支持该结构的数据。

正是由于以上提到的 emoji 的这些多样性，使得其在作为常规字符串进行分割处理时，分割结果不符合我们的直觉。

那我们有哪些办法来解决这个问题？

## 解决方案初探（文末有最终方案总结）

我们可以试试根据 Unicode 中 emoji 的定义，通过正则的方式对 Unicode 中分给 emoji 的区块进行匹配，然后进行分割，并过滤掉为空的或者未定义的区块。

```js
function emojiStringToArray(str) {
  const reg = /([\uD800-\uDBFF][\uDC00-\uDFFF])/
  return str.split(reg).filter(Boolean)
}
```

让我们来测测这个函数在实际使用中表现如何：

```js
emojiStringToArray('😴⛔🎠🚓🚇') // ['😴', '⛔', '🎠', '🚓', '🚇']
```

看起来常规 emoji 的效果还可以，但是对刚才提到的肤色 emoji 或者是组合 emoji 就有点力不从心了，比如下面的例子。

```js
emojiStringToArray('👨‍👨‍👧‍👧') // ['👨', '‍', '👨', '‍', '👧', '‍', '👧']
emojiStringToArray('👦🏾') // ['👦', '🏾'] 如果这里显示方框，其实是肤色 emoji，可能显示不出来
```

好家伙，这第一个 👨‍👨‍👧‍👧 直接给人家一家子拆散了，~~真有你的~~。

等会儿，刚才不是做了 `filter(Boolean)` 判空过滤处理吗，为什么上述结果数组里还有「空字符串」？

マサカ...（难道说）

我们拿这个输出的「空字符串」测试一下：

```js
'‍' === '' // false

if ('‍') {
  console.log('This is true!') // 成功打印 This is true!
}
```

好家伙，原来这并不是空字符串。

细心的你也许在上述 Unicode 里有关组合 emoji 的介绍中发现，这个「空字符串」其实就是刚才提到的 U+200D **零宽连字**（ZWJ），直观看来，它和空字符串没有什么两样，但这完全是不同的字符，这个字符专门用于连接特定的 emoji 组成**组合 emoji**。

我们还可以试试 ES6 的展开运算符（`spread operator`）。

```js
;[...'😴⛔🎠🚓🚇'] // ['😴', '⛔', '🎠', '🚓', '🚇']
[...'👨‍👨‍👧‍👧'] // ['👨', '‍', '👨', '‍', '👧', '‍', '👧']
[...'👦🏾'] // ['👦', '🏾']
```

还有 `Array.from()`，尝试后发现，其实也是这个情况。

```js
Array.from('😴⛔🎠🚓🚇') // ['😴', '⛔', '🎠', '🚓', '🚇']
Array.from('👨‍👨‍👧‍👧') // ['👨', '‍', '👨', '‍', '👧', '‍', '👧']
Array.from('👦🏾') // ['👦', '🏾']
```

这几种方法实质是一样的，本身也是没有问题的。问题出在，有些 emoji 并不是「单个存在」的，它可能会有一些附加的，比如肤色，或者组合 emoji。要想准确地判断 emoji，得把这两个特殊情况也考虑进去。

## 优化方案

使用 `Intl.Segmenter` 分割。

> 很多人可能连 `Intl` 都不太了解，甚至是第一次见到，~~我承认我基本没见过，也确实没怎么用过~~。这里引用 [MDN 关于 Intl 的解释](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl)：`Intl` 对象是 ECMAScript 国际化 API 的一个命名空间，它提供了精确的字符串对比、数字格式化和日期时间格式化。

`Intl.Segmenter` 对象支持语言敏感的文本分割，允许你将一个字符串分割成有意义的片段（字符、词、句）。

我们来试试 `Intl.Segmenter`：

```js
const splitEmoji = (string) => {
  const segment = new Intl.Segmenter().segment(string)
  return [...segment].map((e) => e.segment)
}

splitEmoji('😴😄😃⛔🎠🚓🚇') // ['😴', '😄', '😃', '⛔', '🎠', '🚓', '🚇']
```

不错不错，但是分割这些基本的 emoji，用刚才的方法一样能实现，我们再来看看复杂的肤色 emoji 和组合 emoji 的情况。

```js
splitEmoji('👨‍👨‍👧‍👧👦🏾') // ['👨‍👨‍👧‍👧', '👦🏾']
```

Nice! 这不就是我们想要的结果吗？这个方式完美地解决了我们的需求，真不错。

但是，这个东西都没怎么听说过，它的兼容性如何，可以被用到生产环境吗？通过到 [`Can I Use`](https://caniuse.com/?search=Intl.Segmenter) 上搜索和查阅可以发现，全球 89.7% 的浏览器（包括移动端和 PC 端）都是兼容的，那除了确实需要更大覆盖面的设备兼容之外，我们基本上都可以放心地使用 `Intl.Segmenter` 了。

## 开源社区的方案

其实，emoji 使用了这么长时间，开源社区肯定早就遇到过类似问题，这里引用社区里比较成熟的解决方案：[`graphemer`](https://github.com/flmnt/graphemer)。

安装依赖：

```bash
npm i graphemer
```

基本用法如下：

```js
// CommonJS
const Graphemer = require('graphemer').default
const splitter = new Graphemer()
const graphemes = splitter.splitGraphemes('😃⛔👨‍👨‍👧‍👧👦🏾')
console.log(graphemes) // ['😃', '⛔', '👨‍👨‍👧‍👧', '👦🏾']

// 或者 ESM
import Graphemer from 'graphemer'
const splitter = new Graphemer()
const graphemes = splitter.splitGraphemes('😃⛔👨‍👨‍👧‍👧👦🏾')
console.log(graphemes) // ['😃', '⛔', '👨‍👨‍👧‍👧', '👦🏾']
```

`graphemer` 的定位是 **Unicode character splitter**，也就是说，不仅仅是 emoji，其他有类似情况的 Unicode 码也能被正确地分割，是个非常棒的解决方案。

## 解决方案总结

1. 利用 [`Intl.Segmenter`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) 的特性进行分割（详情参考上文）
2. 使用开源社区比较成熟的方案：[`graphemer`](https://github.com/flmnt/graphemer)（推荐，详情参考上文）

## 相关科普

每年的 7 月 17 日是世界表情图标日（英语：`world emoji day`）。这是一个非官方的纪念日，为了庆祝 emoji 的广泛使用，最早从 2014 年开始举办。通常，在这一天会举办一些 emoji 活动，并发布一些新的 emoji。

澳大利亚昆士兰州车辆管理部门推出新规：2019 年 3 月 1 日起，允许车主在车牌上增加一个 emoji 表情。

「😂」（中文：喜极而泣的表情，英语：Face with Tears of Joy）被《牛津词典》评选为 2015 年度词汇。

## 相关网站

- [WikiEmoji](https://wikiemoji.org/zh)
- [EmojiPedia](https://emojipedia.org/zh/)

## 参考

- [Emoji - Wikipedia](https://zh.wikipedia.org/wiki/%E7%B9%AA%E6%96%87%E5%AD%97)
- [Stack Overflow](https://stackoverflow.com/questions/24531751)
- [emoji - 百度百科](https://baike.baidu.com/item/emoji/8154456)
- [Intl - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl)
