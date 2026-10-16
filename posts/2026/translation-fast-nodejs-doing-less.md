---
title: '[译] 让 Node.js 写的 API 变快，靠的主要是做得更少'
date: 2026-10-16
topic: '技术'
excerpt: '通过追问代码到底在干什么，让一个不起眼的 Node.js 功能变快。'
isOriginal: false
author: 'Ishtmeet Singh'
tags:
  - 'Node.js'
  - '性能优化'
  - '缓存'
  - '后端'
  - '翻译'
---

> 原文：Fast Node.js is mostly about doing less
>
> 时间：2026 年 9 月 29 日
>
> 作者：Ishtmeet Singh
>
> 链接：https://www.thenodebook.com/blog/fast-nodejs-doing-less

---

> 通过追问代码到底在干什么，让一个不起眼的 Node.js 功能变快。

你可能往 Slack 或 Discord 频道里贴过一个链接，下面会冒出一张小卡片，上面有页面标题、描述和一张图。人们管这叫 Unfurl，或者更常见地，叫链接预览（Link Preview）。写这篇博客的原因是我在自己的一个（商业）项目里做了这个功能，结果它成了我做过最有意思的东西之一。

看起来不值一提，但它真的很有趣，因为第一版大概十分钟就能写完，可一旦有真实用户开始用，里面几乎每一行都会以一种很妙的方式被证明是错的。这篇文章里我会按当时那个项目里的方式一步步构建它。我先写出最初实现的那版，然后一遍遍回头改，每次只解决一个问题，并解释为什么。到最后我们会得到一个我愿意直接上线的版本，而它仍然装得进一个小文件里。

有两条规则。我不打算讲怎么用框架或库。我把整个功能压缩进了一个函数，HTTP 那部分只有几行，你可以直接丢进 Express、Fastify、Hono，或者你同事周末写出来、还坚称它「基本就是 Express，但更好」的那个框架里。我也不打算讲性能测量。那可能是以后另一篇文章。我所做的每处改动都来自代码和一个简单的问题：当很多人同时用的时候，这段代码到底在做什么？

你需要 Node.js >= 20，因为我用了内置的 `fetch{:.string}`，另外还需要 `cheerio{:.string}`，用来解析 HTML。

## 我们要构建什么

整个功能就是一个函数：

```js
const preview = await getLinkPreview('https://thenodebook.com/some-article');
// {
//   url: 'https://thenodebook.com/some-article',
//   title: 'Some Article',
//   description: 'A short summary of the article.',
//   image: 'https://thenodebook.com/cover.jpg',
//   siteName: 'NodeBook'
// }
```

这些数据从哪来？大多数网站会把它们放在页面 `<head>{:html}` 里的 `<meta>{:html}` 标签中，用的格式是 Facebook 多年前推出的 Open Graph（也就是「og」的含义）：

```html
<head>
  <title>Some Article | NodeBook</title>
  <meta property="og:title" content="Some Article">
  <meta property="og:description" content="A short summary of the article.">
  <meta property="og:image" content="/cover.jpg">
  <meta property="og:site_name" content="NodeBook">
</head>
```

所以任务就是：下载页面，找到这些标签，把它们的内容返回。如果页面没有 Open Graph 标签，我们就退回到普通的 `<title>{:html}` 和 `<meta name="description">{:html}`。

在我们的应用里，当你把链接粘进消息框时，客户端就会调用一个接口，这样你在点发送之前就能看到卡片。消息发出后，频道里所有人都能看到，而他们各自的客户端都会去请求同一个接口来画那张卡片。

## 版本 1：我几分钟就写完的

我总是从永远不会变的那部分开始，也就是从 HTML 里把数据抠出来。我写一次，后面整篇文章都不再碰它。我们做的所有改进，都是围绕这段代码进行的。

```js
// extract.js
export function extract($, pageUrl) {
  const meta = (key) =>
    $(`meta[property="${key}"]`).attr('content') ??
    $(`meta[name="${key}"]`).attr('content');

  return {
    url: pageUrl,
    title: meta('og:title') ?? ($('title').first().text().trim() || null),
    description: meta('og:description') ?? meta('description') ?? null,
    image: absolute(meta('og:image') ?? meta('twitter:image'), pageUrl),
    siteName: meta('og:site_name') ?? new URL(pageUrl).hostname,
  };
}

function absolute(href, base) {
  try {
    return href ? new URL(href, base).href : null;
  } catch {
    return null;
  }
}
```

我这里用的不是 jQuery。`${:.string}` 是一个 cheerio 文档，它让我们能用 jQuery 风格的选择器去查解析后的 HTML。`meta{:.function}` 这个辅助函数同时检查 `property=` 和 `name=`，因为各家网站在用哪个上并不一致。`absolute{:.function}` 辅助函数的存在，是因为很多网站把 `og:image` 写成 `/cover.jpg{:.string}` 这样的相对路径，而对一个处在不同域名下的客户端来说，这是没用的。

现在来写功能本身：

```js
// different file, maybe preview.js?
import * as cheerio from 'cheerio';
import { extract } from './extract.js';

export async function getLinkPreview(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  return extract($, res.url);
}
```

然后是服务端接口：

```js
// server.js
import { createServer } from 'node:http';
import { getLinkPreview } from './preview.js';

createServer(async (req, res) => {
  const target = new URL(req.url, 'http://localhost').searchParams.get('url');
  try {
    // the function we wrote get's called here
    const preview = await getLinkPreview(target);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(preview));
  } catch {
    res.writeHead(400).end();
  }
}).listen(3000);
```

注意我传给 `extract{:.function}` 的是 `res.url{:ts}`，不是我们收到的那个 URL。`fetch{:ts}` 会跟随重定向，而 `res.url{:ts}` 是我们最终落到的地方。如果有人粘的是 `bit.ly{:.string}` 链接，相对图片路径应该基于真实页面解析，而不是基于短链。

好，现在它能跑了。粘个链接，拿到一张卡片。说实话，对一个只有十个用户的副业项目来说，我会直接上线然后走人。这里没有任何愚蠢的东西。它很短，读起来舒服，也容易改。那我们就来看看，当它遇到一个真实的频道时会发生什么。

## 版本 2：不要把同一件事做两遍

假设有个 300 人的频道或群组。有人发了一篇新闻文章的链接。接下来会发生这些事：

1. 发链接的人在打字时已经拉取过一次预览了。
2. 消息分发到 300 个客户端。
3. 这 300 个客户端各自调用 `/preview?url=...{:.string}`。
4. 我们的服务器把同一篇文章下载了 300 次，解析了 300 次，又把同样的 JSON 返回了 300 次。

而这只是一条消息。热门链接，比如一篇新闻或一次 GitHub 发布，会被发到很多频道里。我们为第二个请求所做的工作，和第一个请求完全相同，结果也完全相同。这就是我做性能优化时最先找的东西，也就是那些会反复产出同一个答案的工作。

明显的修法是加缓存。最简单的一版可能长这样：

```js
const cache = new Map();

export async function getLinkPreview(url) {
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  const html = await res.text();
  const preview = extract(cheerio.load(html), res.url);

  cache.set(url, preview);
  return preview;
}
```

这是个巨大的改进，同时也是一个慢动作的 bug。它有三个问题。

它**永远不会忘记任何东西**。`Map{:ts}` 会一直攥着你放进去的每一个键，直到进程死掉。任何人粘过的每条唯一链接都会留在内存里。一个繁忙的应用会看到大量唯一链接，所以这个 Map 会随着服务器运行的时长一直长下去。这最终只会变成一个内存泄漏，只不过是个挺整洁的泄漏。

第二，**什么都不会过期**。所以如果一篇文章的标题在发布一小时后被更正了，我们会一直显示那个错字，直到下次部署。

最后，**键很随意**。`https://TheNodeBook.com/post{:.string}`、`https://thenodebook.com/post{:.string}` 和 `https://thenodebook.com/post#comments{:.string}` 是同一个页面，但它们是三个不同的字符串，于是就成了三条缓存记录，最终会变成三次不同的抓取。

键是最容易修的。`URL{:ts}` 类已经替我们做了大部分工作，它会自动把主机名转成小写，而片段（Fragment）我们可以自己丢掉，因为 `#{:.string}` 后面的部分本来就不会发给服务器。

```js
function normalize(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Only http and https links are supported');
  }
  url.hash = '';
  return url.href;
}
```

顺便我们还白得了输入校验。`new URL(null){:ts}` 会抛错，`new URL('not a url'){:ts}` 会抛错，`javascript:{:.string}` 链接会被拒绝。我们的处理函数本来就会把抛出的错误变成 400。

现在说内存。我想要的是一个带两个限制的缓存：一个最大条目数，以及每个条目的最大存活时间。当它满了，就应该把最久没人要的那条踢出去。这就是 **LRU 缓存** 的核心，LRU 是「**L**east **R**ecently **U**sed」（最近最少使用）的缩写。

你可以从 npm 装一个，在真实项目里我显然会这么做，但看看一个能有多小是值得的，因为 JavaScript 的 `Map{:ts}` 有个特性让它几乎免费。**Map 会记住键的插入顺序**。当你遍历一个 Map 时，它总是从最早插入的走到最新插入的。所以只要我们每次读取一条记录时先删掉再放回，被使用的记录就回到了队尾，而 Map 里的第一个键永远是那个最久没被碰过的。

```js
class LRU {
  constructor(max) {
    this.max = max;
    this.map = new Map();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    // Move it to the back of the line.
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key, value, ttl) {
    this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + ttl });
    if (this.map.size > this.max) {
      // The first key is the least recently used one.
      this.map.delete(this.map.keys().next().value);
    }
  }
}
```

（大部分来说，但并非严格如此）就是全部了。不论缓存多大，每个操作的耗时都一样。没有链表要维护，也没有定时器在后台清扫。过期条目是被惰性清理的，要么有人来问、我们发现它过期了，要么它慢慢飘到最前面、被淘汰掉。我非常喜欢这类解法。我们没有增加机器，而是借用语言本身就保证的东西。

`this.map.keys().next().value{:ts}` 如果你没见过，可能看着有点怪。`keys(){:ts}` 返回一个迭代器，`next(){:ts}` 让我们拿到它的第一项，而不用构造一个数组。在一个有 5,000 条记录的 Map 上，`[...this.map.keys()][0]{:ts}` 会把 5,000 个键复制进一个新数组，只为读其中一个。

有了这些之后：

```js
const cache = new LRU(5000);
const ONE_HOUR = 60 * 60 * 1000;

export async function getLinkPreview(rawUrl) {
  const url = normalize(rawUrl);

  const cached = cache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  const html = await res.text();
  const preview = extract(cheerio.load(html), res.url);

  cache.set(url, preview, ONE_HOUR);
  return preview;
}
```

这最多能用多少内存？一条预览就是一堆短字符串，大概一千字节？五千条就是几 MB。这是个我能推理的数字，而且不管服务器跑多久它都不会增长。每当你加一个缓存时，你都应该能回答「它最多能占多少内存？」如果你答不上来，那你大概是在用更多步骤造一个内存泄漏。

回到我们那个 300 人的频道。第一个客户端抓到了文章，另外 299 个从内存里拿到了结果。

真的吗？

## 版本 3：缓存 Promise，而不是值

我们来精确追踪一下，当 300 个请求几乎在同一瞬间到达时，会发生什么。这正是了解 Node.js 如何运行你的代码能带来回报的地方。如果你一直在看 [NodeBook](https://thenodebook.com/)，下面这些你应该大部分都知道了。

Node.js 在单个线程上运行你的 JavaScript（也有 Worker 线程，但在这里不重要）。它从不同时运行你代码里的两段逻辑。当一个函数遇到对某个还没准备好的东西的 `await{:ts}` 时，它会暂停，Node.js 则跑去运行别的东西，可能是另一个请求的处理函数、一个定时器，或者任何在等待的任务。当你等待的东西准备好了，你的函数就从停下的地方继续。

现在带着这个视角看我们的函数：

```js
const cached = cache.get(url);      // (1) check the cache
if (cached) return cached;

const res = await fetch(url);       // (2) pause here for half a second
const html = await res.text();      // (3) and here
// ...
cache.set(url, preview, ONE_HOUR);  // (4) finally fill the cache
```

请求 1 执行步骤 (1)，缓存未命中。它在步骤 (2) 开始抓取，然后暂停。Node.js 接手另一个客户端的新请求，也就是请求 2。请求 2 执行步骤 (1)，缓存仍然是空的，因为请求 1 还要半秒才能到步骤 (4)。于是请求 2 开始自己的抓取，然后暂停。请求 3 也一样。以此类推。

你能猜到问题出在哪吗？你会怎么修？

几乎所有 300 个请求都落在那半秒的窗口里，因为它们都是被同一条消息出现在 300 块屏幕上触发的。所以它们几乎全部缓存未命中，把文章下载了 300 次。我们又回到了版本 1。缓存只帮得上在第一个请求**完成之后**才到的请求，而在聊天应用里，最初那一波爆发正是关键。

这有个名字，叫**缓存雪崩（Cache Stampede）**，也是缓存线上失效最常见的方式之一。它在测试里表现完美，因为测试时你是一次点一个链接的。

修法是**我在 Node.js 里最喜欢的想法之一**，你会被惊到的（说真的）。问题出在「我决定去抓」和「结果进了缓存」之间的那段空隙。在那段空隙里，别人看不到已经有人在做这件事了。那怎么办？我们把这段空隙堵上！**在我们决定去抓的那一刻、在任何一个 `await{:ts}` 之前，就往缓存里放点东西**。放进去的那样东西，就是这个 Promise。

```js
export function getLinkPreview(rawUrl) {
  const url = normalize(rawUrl);

  const cached = cache.get(url);
  if (cached) return cached;

  const promise = fetchPreview(url);
  cache.set(url, promise, ONE_HOUR);
  return promise;
}

async function fetchPreview(url) {
  const res = await fetch(url);
  const html = await res.text();
  return extract(cheerio.load(html), res.url);
}
```

我们再追踪一遍。请求 1 未命中，调用 `fetchPreview{:.function}`，它启动抓取并立刻返回一个 Pending 的 Promise。请求 1 把这个 Promise 缓存并返回它。过程里没有任何 `await{:ts}`，所以中途不会有别的东西能跑。接着请求 2 进来，查缓存，找到了这个 Promise。它返回同一个 Promise。它的处理函数执行 `await getLinkPreview(...){:ts}`，结果就在等请求 1 的那次抓取。另外 298 个也是。

一次下载。一次解析。300 个答案。关于这个改动，有几件事容易忽略。

**`getLinkPreview{:.function}` 不再是 `async{:ts}` 了**。老实说它也不需要是。它反正返回一个 Promise，处理函数照样 `await{:ts}` 它。我故意去掉了这个关键字，好让「这个函数里任何地方都不会暂停」这件事一目了然。如果以后有人在 `cache.get{:ts}` 和 `cache.set{:ts}` 之间加了一个 `await{:ts}`，雪崩就回来了。从 `get{:.function}` 到 `set{:.function}` 这一段必须一口气跑完，我大概会留一条注释说明这一点。

`await{:ts}` 一个已经 Resolve 的 Promise **完全没问题**。第 5,000 个请求在缓存里返回同一个 Resolve 了的 Promise，`await{:ts}` 它只是把值返回。用 Promise 代替普通值来存，没有任何代价。

现在所有人共享**同一个对象**。300 个处理函数拿到的是同一个预览对象，而不是它的副本。如果后面某处的代码改了它，比如说为了移动端把标题截短，那对所有人来说它在一小时内都变了。所以我把它冻结起来。模块运行在严格模式下，所以任何试图修改冻结对象的代码会立刻抛错，而不是悄悄把缓存弄坏。

接着还有一件其实有点难的事。**抓取失败时会怎样**？

用缓存的 Promise 时，失败也会被缓存。如果第一个请求进来时那个网站正好状态不好，这个被 Reject 的 Promise 会在缓存里待一小时，所有人就拿到一小时错误。不太妙，对吧？

明显的修法是当 Promise Reject 时把这条删掉。但想想这对一个真的挂掉的网站意味着什么。每个请求都发现缓存里什么都没有，重试，又失败。我们又回到了猛捶一台本来就在苦苦支撑的服务器，而我们每一个用户都在等一个失败。

我想要的是介于两者之间：记住失败，但只记很短一会儿。所以抓取失败时，我把这条记录换成一个短寿命的空预览：

```js
const OK_TTL = 60 * 60 * 1000; // 1 hour
const FAILURE_TTL = 60 * 1000; // 1 minute

export function getLinkPreview(rawUrl) {
  const url = normalize(rawUrl);

  const cached = cache.get(url);
  if (cached) return cached;

  // No await between get() and set(), or concurrent requests will all miss.
  const promise = fetchPreview(url)
    .then(Object.freeze)
    .catch(() => {
      cache.set(url, promise, FAILURE_TTL);
      return emptyPreview(url);
    });

  cache.set(url, promise, OK_TTL);
  return promise;
}

function emptyPreview(url) {
  return Object.freeze({
    url,
    title: null,
    description: null,
    image: null,
    siteName: new URL(url).hostname,
  });
}
```

那个 `catch{:ts}` 处理函数引用了 `promise{:ts}`，也就是它自己正在被赋值的那个变量。看起来这不应该能工作，但它确实能。处理函数要等到抓取失败之后才能运行，而那总是更晚的，到那时 `promise{:ts}` 已经有值了。我们把同一个 Promise 又存了一遍，它现在会 Resolve 成空预览，寿命是一分钟而不是一小时。

这里面还藏着一个产品决策。`getLinkPreview{:ts}` 再也不会 Reject 了。预览是消息上的一个小附加物，不是消息本身。如果拿不到，客户端就别画卡片。返回一个空预览，等于在说「我们试过了，没什么可展示的」，而客户端可以在不用走错误处理路径的情况下处理它。只有 URL 本身有问题时才会抛错，那种情况确实就是 400。

## 版本 4：不要没限期地等待

这个问题，我们在写版本 1 时可能从没想过：对于一个不应答的服务器，`fetch{:ts}` 会等多久？

在 Node.js 里，答案是等很久。内置的 `fetch{:ts}` 由一个叫 undici 的库驱动，它对一个请求没有整体的截止时间。它内部有几个超时，但对我们讨论重要的那几个是以分钟计的，不是以秒计。而那个盯着 Body 的超时，只测量 Chunk 与 Chunk **之间**的间隔，所以一个每隔几分钟才发一个字节的服务器，几乎能让一个请求永远活着。如果有人粘的链接指向一个接受了连接、然后就干坐着的服务器，我们的请求也就陪着它干坐。

在版本 1 里，那只是一个倒霉用户在盯着加载圈。到版本 3 之后就糟糕多了，我希望你为这件事想一会儿。**当你把一次请求共享给很多调用者时，你也就共享了它的问题**。所有请求那条链接的人，现在都在等同一个卡住的 Promise，所以整个频道都在等，全部 300 个人。而因为这个 Promise 永不 Settle，它也就永远不会失败，这意味着我们刚建好的一分钟失败缓存根本不会启动。那些客户端连接会一直开着，占着内存，持续好几分钟。

也从用户的角度想想。一个 30 秒后才出现的预览是没用的。到那时那人早就读完消息、回复完、走开了。所以该等的时间很短。我给它四秒：

```js
const TIMEOUT = 4000;

async function fetchPreview(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'user-agent': 'ChatPreviewBot/1.0', accept: 'text/html' },
  });
  const html = await res.text();
  return extract(cheerio.load(html), res.url);
}
```

`AbortSignal.timeout(ms){:ts}` 给你一个会在指定毫秒数后自己中止的信号。它是 Node.js 内置的，也没有定时器要我们清理。它还是覆盖**整个请求**的，包括读取 Body。最后这一点比看上去更重要。一个服务器可以立刻发出响应头，然后一次一个字节地往外发 Body Chunk。一个只覆盖「响应开始前的时间」的超时永远抓不到这种情况，我们就又回到永远等下去了。

当它触发时，`fetch{:ts}`（或者 `res.text(){:ts}`）会 Reject，我们在版本 3 写的 `catch{:ts}` 把它转成空预览，这次失败会被记住一分钟。我很喜欢这两者如何相辅相成：超时把「永远挂着」变成「快速失败」，而失败缓存把「快速失败」变成「只失败一次」。

顺手我也加了一个 `user-agent{:.string}`。有些网站对不说自己是谁的请求只返回一个空壳或错误页，还有少数网站只对看起来像爬虫的东西才带上 Open Graph 标签（而我们要的正是这个……）。这完全不是提速的改动，但它能让我们不至于干了所有的活儿，却只拿回一堆没用的东西。

## 版本 5：只读你需要的那部分

这是我第一次构建这个功能时，唯一一件教会我新东西的事。看这两行。它们从版本 1 起就一直在那儿，没被动过：

```js
const html = await res.text();
return extract(cheerio.load(html), res.url);
```

`res.text(){:ts}` 到底做了什么？它把整个响应体读进内存，作为一个大字符串交给你。是**整个** Body，不管那个 Body 是什么。

而人们往聊天里粘的是什么？文章，当然。但也可能是一个 2 GB Linux ISO 的链接。一个 400 MB 的视频。一个 PDF。一个 HTML 里内联了 3 MB JavaScript 的单页应用。某个人的服务器不小心暴露出来的日志文件。人们什么都粘。

对那个 ISO 来说，`res.text(){:ts}` 会很乐意地试着把两个 GB 读成一个字符串。版本 4 里的四秒超时有帮助，但在快连接上，四秒足够把几百兆字节拉进内存，而这还是一个根本没有 `<head>{:html}`、也永远不会有 `<head>{:html}` 的文件。同时来几个这样的，进程就会耗尽内存然后崩掉，把所有其他用户的请求一起带走。

解析这边还有另一个问题。假设页面是真的 HTML，只是很大，比如一篇长文章里渲染了上千条评论，5 MB 的标记。`cheerio.load(html){:ts}` 会把它全部解析成一棵对象树，而那个解析是纯粹同步的 JavaScript。还记得我们在版本 3 聊过的吗？Node.js 在单线程上运行你的代码。所以当 cheerio 在啃那 5 MB HTML 时，**进程里其他任何东西都跑不了**。不是其他预览请求，甚至不是那些本可以瞬间命中的缓存请求，也不是你的健康检查。这台服务器上的每个人都在等一个大页面解析完。

这就是我在 [NodeBook](https://thenodebook.com/) 里讲过很多次的事件循环阻塞问题。它不只是让**那一个**请求变慢。它让**每一个**请求变慢，包括那些跟它毫无关系的请求，而所有那些工作都是白做的。我们需要的一切都住在 `<head>{:html}` 里，而 `<head>{:html}` 通常只是页面开头的几千字节。我们为了让整个文档读出它的第一段，把整个文档都下载并解析了。

那我们就别这么干了，做个「100x」工程师吧（反讽）。有两处改动。

第一，在读取之前，先看**我们拿到的是什么**。`Content-Type{:.string}` 响应头比 Body 先到。如果不是 HTML，就没有 `<head>{:html}` 可找，也就没理由读任何东西。而如果它是图片，我们还白得一个更好的预览，因为图片本身就是自己的预览。

```js
const type = res.headers.get('content-type') ?? '';
if (!type.includes('text/html')) {
  await res.body?.cancel();
  return type.startsWith('image/')
    ? { ...emptyPreview(res.url), image: res.url }
    : emptyPreview(res.url);
}
```

那句 `res.body?.cancel(){:ts}` 很重要，而且是一个你必须知道的 Node.js 特有的点。当 `fetch{:ts}` 给你一个响应时，body 还没被下载。它是一条流，就坐在那儿等你去读。如果你就这么走开，Node.js 的 `fetch{:ts}` 不会立刻关掉连接。这个 Socket 会一直被占着，直到垃圾回收器最终轮到那个响应对象，而这可能要等一会儿。在负载下，这些用了一半的连接会堆起来。所以规则是：如果你不打算读 Body，就 Cancel 它。这等于告诉 Node.js 现在就把连接丢掉。

第二，对 HTML，**只读到 `</head>{:html}` 为止**。`res.body{:ts}` 是一条 Chunk 流，Chunk 一从网络上下来就交给我们。与其等所有 Chunk，我们可以一个一个读，找 Head 的结尾，一看到就停下。

```js
const MAX_HEAD_BYTES = 512 * 1024;

async function readHead(body, limit) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let html = '';
  let bytes = 0;

  try {
    while (bytes < limit) {
      const { done, value } = await reader.read();
      if (done) break;

      bytes += value.byteLength;
      const searchFrom = Math.max(0, html.length - 6);
      html += decoder.decode(value, { stream: true });

      const end = html.slice(searchFrom).search(/<\/head|<body/i);
      if (end !== -1) return html.slice(0, searchFrom + end);
    }
    return html;
  } finally {
    reader.cancel().catch(() => {});
  }
}
```

这二十行里发生的事比看上去多得多，所以慢慢过一遍。

`TextDecoder{:ts}` 把字节变成文本。`{ stream: true }{:ts}` 这个选项的存在，是因为 UTF-8 的工作方式。任何 ASCII 之外的字符（一个带音标的字母，或者一个 emoji）都占不止一个字节，而一个网络 Chunk 可能正好断在其中一个字符中间。没有 `stream: true{:ts}`，一个跨两个 Chunk 的字符就变成了乱码。有了它，解码器会把剩下的字节留着，等下一个 Chunk 到了再把那个字符补完。

接下来是搜索那部分。最直白的写法是每来一个 Chunk 就在整个字符串上跑一次 `html.search(/<\/head/i){:ts}`。这能工作，但它每次都把我们之前已经查过的内容重新扫一遍。Chunk 很多很小的时候，你会一遍又一遍地扫页面开头。我们只需要看**新**文本。但这里有个你也许已经想到的有趣之处：标签本身可能被拆在两个 Chunk 之间，也就是一个 Chunk 以 `</he{:html}` 结尾，下一个以 `ad>{:html}` 开头。如果我们只搜新文本，就会完全漏掉它。所以我们从新文本往前几个字符开始搜，刚好够抓到一个跨边界的标签。`</head{:html}` 是六个字符长，所以往前六个就够了。

这个正则也匹配 `<body{:html}`，因为很多真实页面根本不闭合 Head，而 Body 一开始，Head 无论如何都结束了。

`limit` 算是一种安全措施。有些网站往 `<head>{:html}` 里塞几百 KB 的内联脚本和样式。我宁可停下、解析手上已有的东西，也不要一直读下去。512 KB 已经很宽裕了，因为大多数页面把 meta 标签放在开头几千字节里。

而 `finally { reader.cancel() }{:ts}` 是同一个教训。一旦我们完事了，不管是找到了 Head 结尾、撞上了上限，还是出了错，我们都告诉 Node.js 剩下的不要了。对一个 5 MB 的页面，我们读了大概 20 KB 就挂断，而不是把剩下 4.98 MB 也下完。

现在 `fetchPreview{:.function}` 长这样：

```js
async function fetchPreview(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'user-agent': 'ChatPreviewBot/1.0', accept: 'text/html' },
  });

  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(`Got ${res.status} from ${url}`);
  }

  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) {
    await res.body?.cancel();
    return type.startsWith('image/')
      ? { ...emptyPreview(res.url), image: res.url }
      : emptyPreview(res.url);
  }

  const head = await readHead(res.body, MAX_HEAD_BYTES);
  return extract(cheerio.load(head), res.url);
}
```

我还加了一个 `res.ok{:ts}` 检查，配同样的 Cancel。一个 404 页面的标题是「Page not found」，没人想在卡片里看到这个。

现在看看解析器那边变了什么。我们还在用 cheerio，`extract{:.function}` 一点没变（我说过不会再碰它）。我们只是把页面的 Head 交给它，而不是整页。Cheerio 不在意一个中途断掉的文档。HTML 解析器天生就是为了应付残缺标记的，因为整个 Web 到处都是。那次曾经因为一份 5 MB 文档而冻住整个进程的解析，现在只跑在几千字节上。**我们没有让解析器跑得更快，我们只是给了它更少的事做**。

我觉得这是整篇文章里最有用的一个想法。当某个东西慢的时候，第一反应是找一条更快的方式去做同样的事，也许是更快的库，或者更聪明的算法。但更常见的是，更好的问题是：你究竟需不需要做这件事。我们不需要 Body。我们不需要那个 ISO。而 300 次抓取里，我们也不需要其中 299 次。

## 最终的样子

整个东西在一个文件里：

```js
// preview.js
import * as cheerio from 'cheerio';

const OK_TTL = 60 * 60 * 1000; // 1 hour
const FAILURE_TTL = 60 * 1000; // 1 minute
const TIMEOUT = 4000;
const MAX_HEAD_BYTES = 512 * 1024;

class LRU {
  constructor(max) {
    this.max = max;
    this.map = new Map();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expires < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key, value, ttl) {
    this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + ttl });
    if (this.map.size > this.max) {
      this.map.delete(this.map.keys().next().value);
    }
  }
}

const cache = new LRU(5000);

export function getLinkPreview(rawUrl) {
  const url = normalize(rawUrl);

  const cached = cache.get(url);
  if (cached) return cached;

  // No await between get() and set(), or concurrent requests will all miss.
  const promise = fetchPreview(url)
    .then(Object.freeze)
    .catch(() => {
      cache.set(url, promise, FAILURE_TTL);
      return emptyPreview(url);
    });

  cache.set(url, promise, OK_TTL);
  return promise;
}

async function fetchPreview(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'user-agent': 'ChatPreviewBot/1.0', accept: 'text/html' },
  });

  if (!res.ok) {
    await res.body?.cancel();
    throw new Error(`Got ${res.status} from ${url}`);
  }

  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/html')) {
    await res.body?.cancel();
    return type.startsWith('image/')
      ? { ...emptyPreview(res.url), image: res.url }
      : emptyPreview(res.url);
  }

  const head = await readHead(res.body, MAX_HEAD_BYTES);
  return extract(cheerio.load(head), res.url);
}

async function readHead(body, limit) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let html = '';
  let bytes = 0;

  try {
    while (bytes < limit) {
      const { done, value } = await reader.read();
      if (done) break;

      bytes += value.byteLength;
      const searchFrom = Math.max(0, html.length - 6);
      html += decoder.decode(value, { stream: true });

      const end = html.slice(searchFrom).search(/<\/head|<body/i);
      if (end !== -1) return html.slice(0, searchFrom + end);
    }
    return html;
  } finally {
    reader.cancel().catch(() => {});
  }
}

function extract($, pageUrl) {
  const meta = (key) =>
    $(`meta[property="${key}"]`).attr('content') ??
    $(`meta[name="${key}"]`).attr('content');

  return {
    url: pageUrl,
    title: meta('og:title') ?? ($('title').first().text().trim() || null),
    description: meta('og:description') ?? meta('description') ?? null,
    image: absolute(meta('og:image') ?? meta('twitter:image'), pageUrl),
    siteName: meta('og:site_name') ?? new URL(pageUrl).hostname,
  };
}

function absolute(href, base) {
  try {
    return href ? new URL(href, base).href : null;
  } catch {
    return null;
  }
}

function normalize(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Only http and https links are supported');
  }
  url.hash = '';
  return url.href;
}

function emptyPreview(url) {
  return Object.freeze({
    url,
    title: null,
    description: null,
    image: null,
    siteName: new URL(url).hostname,
  });
}
```

而服务端那个文件呢？它一点没变。

我们再最后回到那个 300 人的频道，重新追踪一遍现在这条链接到达时会发生什么：

1. 第一个请求规范化 URL，缓存未命中，立刻往那儿放一个 Promise。
2. 另外 299 个找到那个 Promise，在上面等。
3. 只出去一次抓取，带四秒上限。
4. 如果响应是 HTML，我们读到 `</head>{:html}` 为止，通常几千字节，然后挂断。
5. Cheerio 转瞬之间解析那几千字节，于是事件循环对其他所有人保持空闲。
6. 300 个请求拿到同一个冻结对象。
7. 接下来一小时，任何发这条链接或看到它的人，都直接从内存里拿到结果。
8. 如果中途哪里出了错，所有人拿到空预览，一分钟后再试。

那些过去会让人难受的情况呢：一个指向巨大文件的链接，现在只花我们一组响应头和一个被 Cancel 的连接。一个永不应答的服务器，花我们四秒，每分钟最多一次。缓存不会超过 5,000 条，不管进程跑多久。

我们从五行开始，最后到了大概 150 行。代码多了不少，没错。但我几乎能指着其中任何一行，告诉你它是为了哪一类真实世界的问题而存在的。这种增长，我完全接受。

## 我故意没处理的

知道什么时候停手，也是这份工作的一部分。以下是我考虑过、但至少目前决定不做的事。

**Stale-While-Revalidate（过期后后台刷新）。** 当一条记录一小时后过期，下一个来问的人得等一次全新的抓取。更好看的做法是立刻把旧预览给他，然后在后台刷新。这是个好主意，而且和 promise 缓存配合得非常好，但每条链接每小时一次慢预览，还不值得多加这段代码。

**共享缓存。** 我们的缓存活在单个 Node.js 进程的内存里。在负载均衡后面跑四个进程，你就有四份独立的缓存，所以一条热门链接最多会被抓四次。对很多应用来说这完全没问题。如果不行，下一步是 Redis（或者 valkey 之类的东西），而在每个进程内部，promise 这一招依然有它的位置，这样你就不会再去冲垮 Redis。

**把预览存到消息上。** 消息一旦发出，服务器可以抓一次预览、把它和消息一起存下来，这样那 300 个客户端根本不用问。这是个好设计，我大概最终会走到那儿。但输入框（也就是你还在打字时看到的那张卡片）仍然需要这个接口，而这篇文章里的一切同样适用于那个场景。

**流式解析器。** 现在我们是把 Head 收集成一个字符串再解析。像 `htmlparser2` 这样的流式 HTML 解析器可以边到边处理 Chunk，路过 meta 标签时就捡起来，根本不用构造字符串或树。那还会更快。但我们现在只解析几千字节，而且换解析器意味着重写 `extract{:.function}`。最大的收益是读得更少，而那个我们已经拿到了。

**限制对外请求数。** 如果同一秒里有一千条**不同**的链接被发出来，我们会同时启动一千次抓取。一个小小的并发上限能让它平缓下来。我还没见过哪个聊天应用频繁到需要在意，所以我会等到真的发生了再说。

还有一件事跟速度毫无关系，但你**绝不能跳过**。一个链接预览接口会从你的网络**内部**去抓取用户给出的任何 URL。迟早有人会粘上 `http://169.254.169.254/{:.string}`（云元数据地址，凭据常常就住在那里）或者 `http://localhost:6379/{:.string}`（你好，Redis），只为了看看你的服务器能碰到什么。在把它上线之前，解析主机名并拒绝私有和内部地址。还要记住 `fetch{:ts}` 会跟随重定向，所以只检查你收到的那个 URL 是不够的，一个看着人畜无害的链接可以直接重定向到内部地址。这种攻击叫 SSRF（服务端请求伪造，Server-Side Request Forgery），它本身是一整个话题，也是这个功能里我绝不会留到以后再说的一部分。

## 短版总结

如果这篇文章你只带走一样东西，带走那些问题，而不是代码。每一个版本都来自问一个关于代码到底在干什么的朴素问题：

- 我是不是把同一件事做了不止一遍？缓存它。
- 如果很多请求在第一个完成之前就到了怎么办？缓存 Promise。
- 请求一直不响应怎么办？给它一个截止时间。
- 我是不是在做不需要的工作，对别人意味着什么代价？少读，少解析。

这些都不需要框架、更快的库或者聪明的算法。只需要我想象 300 个人在同一瞬间打开同一条消息，然后慢慢读我自己的代码。

---

## 译者注

本文由 AI 辅助翻译，译者进行了后期润色和校对。
