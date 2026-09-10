---
title: '[译] 2026 年 JavaScript 与前端生态综述'
date: 2026-05-12
topic: '前端'
excerpt: '盘点前端生态中值得关注的内容，涵盖 ES 新特性、框架、运行时、构建工具、TypeScript 等。'
top_image: 'https://image.viki.moe/blog/907f2a.png'
tags:
  - 'JavaScript'
  - '前端'
  - '翻译'
  - 'ECMAScript'
  - 'TypeScript'
---

> 原文：What To Know in JavaScript (2026 Edition)
>
> 时间：2026 年 4 月 2 日
>
> 作者：Chris Coyier
>
> 链接：https://frontendmasters.com/blog/what-to-know-in-javascript-2026-edition

---

我们会介绍 JavaScript 语言的新东西，但作为它的从业者，我们并不只关乎语言本身，还会延伸到运行时、框架、库和工具链。那我们直接开始吧，反正你大概率已经往下翻了。

## 语言中的新功能

JavaScript 每年发布一个新版本，要我说，这种做法真不错！

### ECMAScript 2025

最新版是 **ECMAScript 2025**，于 2025 年 6 月发布，[该版本规范全文可在这里查看](https://tc39.es/ecma262/2025/)。

#### 迭代器辅助方法（Iterator Helpers）

现在迭代器上可以直接访问 `.map()`、`.filter()`、`.take()`、`.drop()` 等方法，并且采用惰性求值。说实话，对我这种前端开发来说，这感觉有点小众。我们本来就能对数组进行映射操作，这又有什么大不了的？但我确实理解性能方面的价值，这就是其中一个点。

```javascript
const result = array
  .map(x => x * 2)      // 在内存中创建一个新数组
  .filter(x => x > 10)  // 又一个新数组
  .slice(0, 3);         // 再来一个
```

所以说这样「慢」而且「占用内存」，特别是当数组非常大、你做的操作很「重」的时候。流行的新写法是这样：

```javascript
const result = Iterator.from(array)
  .map(x => x * 2)
  .filter(x => x > 10)
  .take(3)
  .toArray(); // 不会创建新数组，计算在拿到 3 个之后就停止
```

另外还有一个不错的好处，`Iterator.from()` 对所有可迭代对象都有效。不只是数组，集合、映射、生成器等都可以，这意味着它们都能使用同样一套好用的函数。

#### 集合方法（Set Methods）

集合在 JavaScript 里挺不错，它就像数组，但每个元素保证是唯一的。这不算新东西，但如果有 **两个** 集合，现在有了方法能返回一些有趣的信息，比如哪些重叠、哪些不重叠等等。

```javascript
const youKnow  = new Set(["JS", "Python", "CSS", "SQL"]);
const jobNeeds  = new Set(["JS", "TypeScript", "Python"]);

// 职位需要且你已经掌握的技能
youKnow.intersection(jobNeeds); // → Set {"JS", "Python"}

// 全部技能合起来 —— 你的技能栈加上职位需求的
youKnow.union(jobNeeds); // → Set {"JS", "Python", "CSS", "SQL", "TypeScript"}

// 职位需要但你尚未掌握的技能（技能差距）
jobNeeds.difference(youKnow); // → Set {"TypeScript"}

// 你掌握但职位不关心的技能
youKnow.difference(jobNeeds); // → Set {"CSS", "SQL"}

// 只出现在其中一个集合的技 能
youKnow.symmetricDifference(jobNeeds); // → Set {"CSS", "SQL", "TypeScript"}

// 职位要求是否完全是你已有技能的子集？
jobNeeds.isSubsetOf(youKnow); // → false

// 你是否真的技能齐全甚至还有余？
youKnow.isSupersetOf(jobNeeds); // → false

// 你和职位要求是否完全没有交集？
youKnow.isDisjointFrom(jobNeeds); // → false
```

要我说，挺实用的。Claude Code 还用这段代码玩出了 [一个交互式的演示](https://codepen.io/editor/chriscoyier/pen/019c9733-c5ed-7594-9bd9-8ed47f3860d1?file=%2Findex.html&orientation=left&show=preview)。

#### 正则表达式更新（RegEx Updates）

先铺垫一下场景。你在做一个页面内的搜索功能，用户可以自己输入搜索词，你想用正则表达式来实现。这有点风险，因为用户输入的某些字符可能是正则里的「特殊」字符，比如 `$` 会匹配末尾什么的。所以如果用户搜索 `$9`，你直接把它扔进正则里，就会出错。需要「转义」哪些字符来修复这个问题，取决于具体的正则实现。

于是！据说历经 15 年的努力，现在有了 `RegExp.escape()`。

```javascript
const query = userInput; // 例如 "$5.00 (off!)"

// ❌ 之前 —— 遇到正则特殊字符就完蛋
const badRe  = new RegExp(query, "g");

// ✅ ES2025 —— 一个方法，问题搞定
const goodRe = new RegExp(RegExp.escape(query), "g");
```

同样，[Claude Code 几乎完美地搞出了一个相当棒的演示](https://codepen.io/editor/chriscoyier/pen/019cbeea-b5e2-7af0-acbe-96dab95e0ee8)。

另外，正则表达式中「修饰符」的用法也有更新。我觉得 `i` 修饰符比较常用，表示不区分大小写。所以你的正则可能以 `/i` 结尾，表示整个表达式都不区分大小写。但如果你只想让正则的 **一部分** 不区分大小写呢？现在可以把那部分用括号包起来，并在开头加上修饰符。

```javascript
// 老办法 —— 不能混用区分大小写
/[a-z]+@[A-Z]+/i  // 'i' 修饰符作用于整个表达式

// ES2025 —— 分组内联修饰符
/(?i:[a-z.]+)@(?-i:[A-Z]+)\.(?i:com|org)/
//^^^^ 不区分大小写部分
//             ^^^^^ 区分大小写部分
//                           ^^^ 不区分大小写部分
```

#### Promise 更新

大家最喜欢的异步编程流程模型（Promise）有了点更新，来了个 `Promise.try()`，能帮助简化错误处理。一个函数可能在同步或异步两种方式下抛出错误，之前你得分开处理，但现在可以一起搞定：

```javascript
// 一个可能是异步，也可能同步抛出错误的函数
function loadUser(id) {
  if (!id) throw new Error("No ID");  // 同步抛出错误
  return fetch(`/api/users/${id}`);   // 异步
}

// ❌ 之前 —— 两条独立的错误处理路径
let p;
try {
  p = loadUser(id);                   // 在这里捕获同步抛出的错误
} catch (e) { handleError(e); }
p?.catch(e => handleError(e));        // 再在这里捕获异步 reject

// ✅ ES2025 —— 一行代码，一个 .catch() 搞定
Promise.try(() => loadUser(id))
  .then(user  => render(user))
  .catch(err  => showError(err));     // 捕获两种错误
```

我再给你指路到一个 [Claude Code 做的演示](https://codepen.io/editor/chriscoyier/pen/019cc8dc-9bde-7597-9b57-d91d6ef0a6c2)，它在展示这个概念上做得意外地好。

#### 导入属性（Import Attributes）

[导入属性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) 是我个人非常喜欢的一个特性。真的！一方面，我喜欢直接把 JSON 数据作为 JSON 数据导入，而不是非得先 fetch 再解析什么的：

```javascript
import data from "./file.json" with { type: 'json' }
```

这里的 `with` 部分加上后面这个对象，就是所谓的「导入属性」，它还有一些别的妙用，我们待会儿会说到。

JSON 导入在我看来就是简洁好看，省下一两行代码，但公平地讲，它也有一些 Jake Archibald 在 [《导入 JSON vs 获取 JSON》](https://jakearchibald.com/2025/importing-vs-fetching-json/) 中指出的显著缺点。其中一个大问题：如果导入失败，「它会把整个模块依赖图都搞崩」，这，呃，非常糟糕。你可以改用动态的 `import()` 来捕获失败。

```javascript
try {
  const { default: data } = await import(url, {
    with: { type: 'json' },
  });
} catch (error) {
  // 降级逻辑
}
```

但比起直接用 `fetch` 获取 JSON 得到的数据，还是差了点意思，所以仍然有些鸡肋。Jake 总结道，导入的数据「将在模块依赖图中存活一整个页面生命周期」，而不是像 `fetch` 后的数据那样可以被垃圾回收。总之：谨慎使用。

不过，导入属性能导入的不只是 JSON。我说导入属性是我个人最喜欢的特性时，主要是指我很兴奋能用这种方式导入 CSS。

```javascript
import componentStyles from "./component.css" with { type: "css" };
```

我在 [《使用 Web Components 和 CSS Module Scripts 构建一个清爽的 Vanilla 应用架构》](https://frontendmasters.com/blog/architecture-through-component-colocation/) 里深入探讨过这一点。我就是很喜欢这种能把 CSS 放在独立的 `.css` 文件里，且这些文件可以和 JavaScript 组件放在同一个文件夹下的做法。

```javascript
import sheet from './styles.css' with { type: 'css' };

class MyComponent extends HTMLElement {
  constructor() {
    super(); 
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sheet];
  }
  // ...
}
```

---

这当然不是 ES2025 的全部内容，还有很多专门介绍这些的文章。我觉得 Matthew Tyson 为 InfoWorld 写的 [《ECMAScript 2025：JavaScript 的最佳新特性》](https://www.infoworld.com/article/4021944/ecmascript-2025-the-best-new-features-in-javascript.html) 挺有帮助。里面提到 `Float16Array` 之类的东西，稍微超出我的知识范围，不过大体上是在你知道有用的时候，用精度换内存占用。

### ECMAScript 2026（预计 2026 年中）

现在是 2026 年初，但我们可以预计像往年一样，ECMAScript 的年度发布会在年中到来。下面这些已经进入 Stage 4，很可能会最终落地。

#### Temporal API

这无疑是近段时间 JavaScript 中最令人兴奋、最有用的新东西。一句话总结就是：「JavaScript 里的日期和时间现在好用了，无需第三方库。」长久以来，像 [Moment](https://momentjs.com/) 这样庞大但优秀的库填补了这个空缺，让开发者在性能和开发体验之间左右为难 😬。

在我写这篇文章时，Safari 是最后一个尚未 [支持](https://caniuse.com/temporal) Temporal API 的浏览器，但相关工作已经在 [开展](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/)，现已进入 TP（他们称之为「技术预览版」），所以离正式支持不远了。

现在有一件事变得很简单：获取特定时区的当前时间。无需任何库。

```javascript
const now = Temporal.Now.zonedDateTimeISO("America/New_York");

// 编程格式的日期
console.log(now.toString());

// 或者更可读的格式……
console.log(now.toLocaleString());
```

我觉得挺有意思的是，[TC39 会议在议程里写了段代码](https://github.com/tc39/agendas/blob/main/2026/03.md)，让你在 DevTools 控制台里运行，就能看到下次会议在你当前时区的时间：

```javascript
Temporal.ZonedDateTime.from('2026-03-10T10:00[America/New_York]')
  .withTimeZone(Temporal.Now.timeZoneId()) // 你的时区
  .toLocaleString();
```

这实在太酷了。

Temporal 能做一百万件事，但再举几个以前非常糟心的例子。

比如我们给一月的最后一天「加一个月」，以前会得到很离谱的结果：

```javascript
const date = new Date(2026, 0, 31); // 1 月 31 日
date.setMonth(date.getMonth() + 1); // 加一个月
console.log(date.toDateString()); // 3 月 3 日 ❌ 😬
```

但用上了可爱的 Temporal API，就没问题了：

```javascript
const jan31 = Temporal.PlainDate.from("2026-01-31");
const feb = jan31.add({ months: 1 });
console.log(feb.toString()); // 2026-02-28 ✅
```

另外，现在进行比较操作，结果也是正确的了。

```javascript
const a = Temporal.Duration.from({ hours: 25 });
const b = Temporal.Duration.from({ days: 1 });

const cmp = Temporal.Duration.compare(a, b, { relativeTo: Temporal.Now.plainDateISO() });
console.log(cmp); // 1  (25 小时大于 1 天) ✅
```

#### 显式资源管理（Explicit Resource Management）

现在有一个新的 `using` 关键字，用在异步函数和 `await` 中，可以确保资源清理。运行时保证在变量离开作用域时调用 `[Symbol.dispose]()`（或 `[Symbol.asyncDispose]()`）。

```javascript
class FileHandle {
  constructor(path) {
    this.path = path;
    console.log(`已打开 ${path}`);
  }

  async write(data) {
    // ... 写入数据
  }

  async [Symbol.asyncDispose]() {
    await someFlushOperation();
    console.log(`已刷新并关闭 ${this.path}`);
  }
}

async function saveData() {
  await using file = new FileHandle("output.txt");
  await file.write("hello world");
  // 文件会在这里自动刷新和关闭，即使有错误抛出也一样
}
```

这里的 `using` 关键字对单个资源来说很好，但现在还有一个 `DisposableStack` 用于需要确保清理的多个资源。

```javascript
async function runJob() {
  await using stack = new AsyncDisposableStack();

  const db = stack.use(await openDatabase());
  const file = stack.use(new FileHandle("output.txt"));
  const tmpDir = stack.defer(async () => removeTempDir("/tmp/job"));

  // 使用 db、file 和 tmpDir 做一些工作
  await file.write(await db.query("SELECT * FROM jobs"));

  // 三个资源都会在这里按逆序清理，即使有异常抛出也一样
}
```

#### `Array.fromAsync` / 迭代器串联（Iterator Sequencing）

`Array.fromAsync` 最初在 2024 年发布，但似乎存在一些规范问题，所以显然它是在 ES2026 才正式进入规范。它会 **等待异步迭代器产生的每一个 `yield` 值**，把它们收集成一个普通数组。没有它，你就得手动循环推入。

```javascript
async function* fetchNumbers() {
  yield 1;
  await new Promise(r => setTimeout(r, 100)); // 模拟异步延迟
  yield 2;
  await new Promise(r => setTimeout(r, 100));
  yield 3;
}

const numbers = await Array.fromAsync(fetchNumbers());
console.log(numbers); // [1, 2, 3]
```

它最有用的情况可能是：你 await 一个函数调用，而这个函数循环调用多个异步函数并产出它们各自的结果，比如分页场景之类。除了用 `yield`，你也可以传入一个 Promise 数组，等它们全部兑现后一次性返回。

说到分页，`Iterator.concat` 是个新东西，可以让你惰性地计算迭代中的每一项。所以，不用提前把所有内容展开到一个数组里再迭代，它依然可以迭代，但如果你提前退出循环，就可以省下填充那个大数组本该占用的内存。

```javascript
const page1 = [{ id: 1 }, { id: 2 }][Symbol.iterator]();
const page2 = [{ id: 3 }, { id: 4 }][Symbol.iterator]();
const page3 = [{ id: 5 }, { id: 6 }][Symbol.iterator]();

for (const item of Iterator.concat(page1, page2, page3)) {
  process(item); // 惰性地流式处理所有分页
}
```

#### `Error.isError()`

重点在于，现在你可以可靠地知道一个值是否是一个真正的 `Error` 对象，而不仅仅是一个看起来像错误的对象。对于像中心化的错误上报服务，接收可能来自 Web Worker 或 iframe 等不同「领域」的错误，这很有用，因为不同领域会导致判断出错。

#### `Math.sumPrecise`

你肯定见过 `console.log(0.1 + 0.2);` 输出那个超诡异的 `0.30000000000000004`。说来话长。那试试在 Firefox 里运行 `console.log(Math.sumPrecise([0.1, 0.2]));`（目前 Firefox 已支持），你会看到结果…… 完全一样。

但显然，[它还是有用的](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise)，在一些场景下 🤷‍♀️

#### Base64 / 十六进制编码

现在有了简单、直接的方法调用来做这些事，感觉还挺酷。

```javascript
const val = "Frontend Masters!";
const textEnc = new TextEncoder();
const bytes = textEnc.encode(val);
console.log(bytes.toBase64());
// 'RnJvbnRlbmQgTWFzdGVycyE='
console.log(bytes.toHex());
// '46726f6e74656e64204d61737465727321'
```

再一次，让 Claude Code 用 [一种很巧妙的方式演示一下](https://codepen.io/editor/chriscoyier/pen/019d5093-782b-7ab5-a507-f689e9e00173)。

## 框架领域的新动态

### React 生态

[React 19 在 2024 年 12 月发布](https://react.dev/blog/2024/12/05/react-19)，已经有一段时间了。目前版本是 19.2，据我所知，关于 React 20 的内容公开信息不多。

但 React 19 是一次相当大的更新，带来了他们所称的 [「RSC」（React 服务器组件）](https://react.dev/reference/rsc/server-components)、[React 编译器](https://react.dev/learn/react-compiler)以及 [服务器操作](https://18.react.dev/reference/rsc/server-actions)。简单概括如下：

- **RSC**：如果你能部署一个 Node.js 服务器，**或许，只是或许**，有些原本会打包进客户端 JavaScript 包袱里的组件可以省去，这部分工作改在服务器上完成，只传回需要的数据。
- **服务器操作**：同样在你有可用 Node.js 服务器的前提下，这能让你调用专门在服务器上存在的函数。表单处理是典型例子。
- **编译器**：有些性能优化传统上得靠开发者自己琢磨。你是 `useMemo` 高手吗？反正我不是。把你的 React 代码先用这个编译器过一遍，它就能自动帮你做这些优化。稍微增加一点构建复杂度，换来一点性能收益。

自然还有一大堆小更新，但粗略来说，这些是你要知道存在的大东西。[React Native 更新到了 0.83](https://reactnative.dev/blog/2025/12/10/react-native-0.83)，我对它了解甚少，抱歉，但我注意到他们（算是）宣布了 1.0 版本，在经历了十年的开发历程后，所有参与其中的人肯定都感觉不错。我找不到这个链接，我想这个消息是在 React Universe 大会上口头公布的一个里程碑。

那些刚出炉的服务器端 React 技术呢？嗯，它们去年接连爆出了 [非常严重的安全漏洞](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)，把相当多的人吓得不轻，这也是情有可原的。

### Vue 生态

Vue 3.5 保持稳定，而 [Vue 3.6 已经进入 alpha 阶段](https://github.com/vuejs/core/releases/tag/v3.6.0-alpha.1)，带来了一项新的可选功能 —— [Vapor 模式](https://github.com/vuejs/core/releases/tag/v3.6.0-alpha.1#about-vapor-mode)，旨在带来巨大的性能提升（「性能可与 Solid 和 Svelte 5 媲美」）。

我们在 2024 年发布了一篇不错的 [Vue 生态全貌概览](https://frontendmasters.com/blog/the-vue-ecosystem-in-2024/)。但作为一个彻底的 Vue 圈外人，要我理清 2025/2026 的局面有点困难。显然，Evan You 是这边的核心人物，但他现在运营着 [VoidZero](https://voidzero.dev/)（「JavaScript 工具链公司」），该公司现在产出了 [Vite+](https://viteplus.dev/)，这可是**一整条龙**的重点项目，包括 Vite 本身、代码格式化、代码检查、测试等等。这些没有一项是专为 Vue 设计的，我不禁要想，在这多线作战的情况下，想专注于 Vue 本身恐怕很难 🤷‍♀️。

可以说，最主要的 Vue 元框架是 Nuxt，[它迭代到了 4.0](https://nuxt.com/blog/v4)。Nuxt 本身的「管家」是 NuxtLabs，该公司 [被 Vercel 收购了](https://vercel.com/blog/nuxtlabs-joins-vercel)。所以 Vercel 不算「拥有」Nuxt，但…… 算吧？一方面，我为这些元框架在理论上有了可持续的家园感到欣慰；另一方面，VoidZero 囊括了 JavaScript 工具链除自家语言元框架外的几乎每一步，这让我感觉有点古怪。状态管理方面，Pinia 似乎是 Vue 的主流选择，它 [进入了 v3 版本](https://pinia.vuejs.org/cookbook/migration-v2-v3.html)，并终止了对 Vue 2 的支持。

### Svelte 生态

Svelte 正 [基于 v5 稳步向前](https://svelte.dev/blog/svelte-5-is-alive)。那是 Svelte 世界的一次重大更新，带来了所谓的「符文 API（Runes API）」，彻底改变了响应式的运作方式，使其变得更为「细粒度」，这意味着更高效、更快速。老实说，我对 Svelte 或 [SvelteKit](https://svelte.dev/docs/kit/introduction) 了解不多，只知道它们现在也隶属于 Vercel，并且深受其使用者的钟爱。

## **JavaScript 运行时**

最大的运行时显然是浏览器内置的那些。但就你可以自己选择、自行运行代码的运行时而言，Node.js 仍然是主导者，同时有两家有趣的竞争对手。[我们探讨过 Deno 或 Bun 何时能成为比 Node.js 更好的解决方案](https://frontendmasters.com/blog/when-deno-or-bun-is-a-better-solution-than-node-js/)。最近它们更多是趋同而非分化，三者都原生支持 TypeScript，并对 Node.js 规范提供更多的支持。

### Node.js

可能最近 Node.js 最大的新闻是，它可以 [原生运行 TypeScript 文件](https://nodejs.org/en/learn/typescript/run-natively)了。也就是说：

```css
node my-script.ts
```

从 Node.js 22.18.0 版本起这已可用，不再需要 `--experimental-strip-types` 标志。注意它依然是 **剥离** 类型，意味着如果 TypeScript 代码存在真正的问题，它不会帮你发出警告。

Node.js 领域最大的新闻往往是些简单但关键的、基础的、重要的事情，比如安全性、性能的提升，以及向浏览器 JavaScript API 靠拢。

就个人而言，我对 Node.js 的进展相当满意。我曾参与过一些项目，把它们切换到了 Node.js 内置的测试运行器，减少依赖的感觉很不错。我也很赞赏 Node.js 在 [权限模型](https://nodejs.org/api/permissions.html#permissions) 上的努力，这让处理不可信代码的场景变得更实用了些。

### Bun

[Bun 的重要发布是 1.3 版本](https://bun.com/blog/bun-v1.3)，围绕运行开发服务器带来了大量开发者体验特性。只需要将 `bun` 指向 HTML 文件，就能跑起一个功能齐全的开发服务器，这相当令人满足：

```bash
bun './**/*.html'
```

这同样完成了所有的处理和打包工作，使 Bun 在这个场景下某种程度上成为了 Vite 的替代品。

或许对 Bun 最大的新闻是，[Anthropic（例如 Claude 的缔造者）在去年晚些时候收购了 Bun](https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)。我认为普遍的观感是这对 Bun 是件好事，给它提供了一个稳定且资金充足的归宿。

一般来说，人们选择 Bun 是因为它的速度。从 npm 安装依赖极快，并且全面运行时通常表现更快。[但代价是稳定性上要承受一些风险](https://js-segfault-compare.sigmasd.workers.dev/)。

### Deno

Deno 处于 [v2 版本](https://deno.com/blog/v2.0) 有一阵子了。据我所知，它完全兼容 Node.js，并且是三个运行时中最稳定的一个。现在它也通过包导入路径中的 `npm:` 前缀，实现了完全的 npm 兼容。

我觉得大家选择 Deno，通常是因为它的稳定性和安全优先的架构。[他们明确表示：](https://docs.deno.com/runtime/fundamentals/security/)

> Deno 默认就是安全的。除非你明确启用，否则在 Deno 下运行的程序无法访问敏感 API，例如文件系统访问、网络连接或环境变量访问。你必须通过命令行标志或运行时权限提示来明确授予这些资源的访问权限。这与 Node.js 有重要区别，在 Node.js 中，依赖项会自动拥有对整个系统 I/O 的完全访问权限，这可能会给你的项目引入隐藏的漏洞。

这是很好的设计。

## 构建工具

### Vite

[Vite](https://vite.dev/) 已经成为 JavaScript 生态系统的主导构建工具。我想，它是在对的时间做了对的事！虽然 Vite 诞生于 Vue 的原创团队，但它是一款几乎适用于所有前端项目的构建工具。我绝对是他们做事方式的粉丝：本地开发时，仅更新你工作中发生改变的小部分代码，无需完整的打包过程，同时仍能按需完成生产级别的打包。

[Vite 最近升级到了 v8 版本](https://vite.dev/blog/announcing-vite8)。这是一个重大变化，它不再依赖第三方打包工具 [Rollup](https://rollupjs.org/)，而是换成了它们自研的打包器 [Rolldown](https://rolldown.rs/)。这与 Vite 近期致力于成为一个更「统一的工具链」的方向一致。他们可以在自己的产品线中共享工具（比如解析器），让整个体系更可预测。他们称这整个工具链为 [Vite+](https://viteplus.dev/)，它包含了 Vite 的好用开发服务器、代码格式化、代码检查、类型检查、测试、任务运行、单一代码库支持以及包发布。真不少了！

他们甚至在更进一步，做一个名为 [Void](https://void.cloud/) 的「部署平台」，该平台使用 Cloudflare 的产品来提供托管、数据存储、云函数等一切服务。

> 数据库、KV 存储、对象存储、AI 推理、身份认证、消息队列和定时任务。全部内建。按需引入你所需要的东西，跳过不需要的。

现在几乎所有框架都在用 Vite：[Astro](https://astro.build/)、[SolidStart](https://start.solidjs.com/)、[SvelteKit](https://svelte.dev/docs/kit/introduction)、[Nuxt](https://nuxt.com/) 等。唯一值得注意的例外是 Next.js，它用的是 webpack 并正向 Turbopack 迁移（见下一节）。但我们甚至看到 Cloudflare 把 Next.js [通过 AI 迁移到了 Vite 上](https://github.com/cloudflare/vinext)，这个举动曾引起不少争议。

### Turbopack

[Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) 是 Vercel 的打包器，现在已经成为 Next.js v16 的 [默认打包器](https://nextjs.org/docs/app/guides/upgrading/version-16#turbopack-by-default)。Turbopack 是一个基于 Rust 的项目，它的热更新速度理论上比之前 Next.js 版本中使用的 webpack 快 5 到 10 倍。我认为目前 Turbopack 是 Next.js 专用的。

### webpack

[webpack](https://webpack.js.org/) 仍在被大量使用，并且也有一份 [2026 年的开发计划](https://webpack.js.org/blog/2026-02-04-roadmap-2026/)，其中包括了许多减少对各种加载器需求的设想和其他简化。这是个受欢迎的更新，因为大家对 webpack 的普遍感受是「太复杂了」。

## TypeScript

[TypeScript 刚刚升级到了 v6 版本](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)。他们表示 2026 年中会发布 v7，那将是一次巨大的更新，编译器会换用到他们基于 Go 语言编写的新编译器。v6 的主要目的是做一些准备工作，以便人们能顺利适应那个变化。我觉得 Bytes 简报有一个 [不错的快速总结](https://bytes.dev/archives/473)：

> 严格模式现在默认为`true`，`module` 默认设为 `esnext`，`target` 会浮动到与当前年份匹配的 ES 规范（目前是 `es2025`），而 `types` 现在默认为一个空数组，而不是把 `node_modules/@types` 里的所有东西都吸进来。光是最后这一项就会搞崩很多项目，但也应该能把速度提升 20% 到 50%。

可能值得为 v7 做好准备，因为你几乎肯定会希望在 VS Code 和 Playwright 等使用场景中看到大约 10 倍的速度提升。

值得注意的是，TypeScript 已经成为了 [GitHub 上排名第一的语言](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)，年增长率达 66%。

### 类型会直接进入 JavaScript 吗？

[几年前有一些风声](https://devblogs.microsoft.com/typescript/a-proposal-for-type-syntax-in-javascript/) 说要把类型直接加进 JavaScript 中。这样或许能享受到 TypeScript 的部分好处而无需编译器。但这方面似乎进展不大，也不太可能真正取代 TypeScript 所能做的一切。

### AI

可能在这儿顺便提一下 AI 最合适，鉴于 TypeScript 在「开发者实际使用」和「可用于开源大模型训练」两方面的极端流行，如今的 AI 写代码，尤其是写 TypeScript 代码，做得非常出色。他们提到 92% 的开发者在某种程度上用 AI 写代码，增长速度惊人，无疑是当下开发领域最大的故事。

## 测试

所有主流的 JavaScript 测试框架都还健在，承担着大量的测试工作。Jest、Jasmine、Mocha 等等。但有些变化正在发生，特别是随着 Vite 变得极其流行，它的测试框架 [Vitest](https://vitest.dev/) 也起飞了。它兼容 Jest，所以把测试用例迁移过来通常挺容易，而且它快得多（我觉得也好看些）。Vitest 还有「浏览器模式」，意味着它能在真实浏览器中运行测试，这对于测试你的组件相当关键。这通常与 [Playwright](https://playwright.dev/) 配合，后者自身似乎也在人气上迎来暴涨，能够完成端到端测试，并且相比 [Puppeteer](https://pptr.dev/) 或 [Cypress](https://www.cypress.io/)，似乎更受欢迎了。（至少在我看来是这样）。

## 元框架

### Next.js

[Next.js 现在到了 v16](https://nextjs.org/blog/next-16)，这是首个默认使用 Turbopack 的版本。就我个人而言，我喜欢这项推进，但我自己项目里把它关了，因为发现迁移起来很困难。不过，其日志记录和错误提示的改进是一个明显的进步。这个版本的 Next.js 自动使用了 React 编译器和 React 服务器组件，理论上能全方位获得性能增益，但实际结果 [似乎](https://www.developerway.com/posts/bundle-size-investigation) [更](https://javascript.plainenglish.io/are-react-server-components-improving-your-apps-b4afdd6d5196) [复杂](https://medium.com/@dan0dev/react-server-components-the-good-the-bad-the-ugly-e08e63b8e676) 且 [褒贬不一](https://dev.to/rbobr/the-hidden-performance-costs-of-react-server-components-248f)。

如果你频繁使用 AI 来辅助开发你的 Next.js 网站，值得注意他们 [现在有一个 MCP 服务器了](https://nextjs.org/docs/app/guides/mcp)。这基本上意味着，一旦连上它，你的 AI 在研究你的网站时会变得聪明得多。

它也是基于 React 19，这意味着带来了 `<ViewTransition>` 支持，[之前在这里做过探讨](https://frontendmasters.com/blog/reacts-viewtransition-element/)。

### Remix / React Router

曾几何时（几年前），[Remix](https://remix.run/) 被 Shopify 收购了。它升级到了 v2 版本，后来又宣布 Remix 原本要发的 v3 版本其实就干脆变成 [React Router](https://reactrouter.com/) v7 了。现在 Remix v3 虽然还会存在，但 [正在积极开发中](https://remix.run/blog/wake-up-remix)。最重要的一点是，它将不再依赖 React：

> 取而代之，我们正在构建自己的组件模型，这种感觉比我们以往所见过的任何东西都更贴近 Web 本身。

他们办过一个叫 [Remix Jam](https://remix.run/jam/2025) 的活动，深入探讨过这些内容，你要特别感兴趣可以去看一看。

### TanStack

Remix 动荡的余波可能让 [TanStack 宇宙](https://tanstack.com/) 获益了，这是一组工具的集合，其中包括了一个非常受欢迎的 [路由器](https://tanstack.com/router/latest)。和之前的 Remix 一样，这个路由器也成长为了 [一个框架](https://tanstack.com/start/latest)。

我们从 Adam Rackis 那里发布了 [大量深入 TanStack 世界的内容](https://frontendmasters.com/blog/tag/tanstack/)。

### Astro

[Astro](https://astro.build/) 多年来一直表现强劲且毫无减缓。就在今年，它 [被 Cloudflare 收购了](https://blog.cloudflare.com/astro-joins-cloudflare/)，这总体上感觉是件好事，因为优秀的前端框架众所周知很难据此建立起强大的商业模式，答案似乎是与正经的托管服务商结盟。它已经被用来 [构建一个奇奇怪怪的 WordPress 克隆体](https://blog.cloudflare.com/emdash-wordpress/)。

如果你要构建一个默认静态，但仍使用现代 JavaScript 框架的组件化架构，并且便于按需加入更动态行为的站点，要我说，Astro 就是黄金标准，也是一个相当棒的选择。

[Astro 的最新版本是 6.0](https://astro.build/blog/astro-6/)，带来了许多成熟的功能，比如自定义开发时使用的运行时、内容安全策略，以及一个实验性的更快的编译器。紧随其后[又发了 6.1 版本](https://astro.build/blog/astro-610/) ，带来了诸多细小贴心的配置优化等等，证明了他们有多致力于成为一个好用的框架。

## npm

[npm](https://www.npmjs.com/) 领域似乎没什么大事发生。距离微软 / GitHub 收购它已经过去六年了，看起来运行良好。倒是 GitHub 自身在 [保证正常运行时间上有点挣扎](https://damrnelson.github.io/github-historical-uptime/)。

而 npm 这边不太妙的是供应链事件，比如 [s1ngularity](https://nx.dev/blog/s1ngularity-postmortem)，它窃取了人们的凭证/令牌/配置文件并公然贴到 GitHub 上 😳。然后是 [debug/chalk](https://www.wiz.io/blog/widespread-npm-supply-chain-attack-breaking-down-impact-scope-across-debug-chalk) 事件，恶意的包更新被推送出去，可以把加密货币交易重定向到某个坏蛋的钱包。再然后是 Shai-Hulud 蠕虫（抱歉，是 **多条** 蠕虫），某种自复制窃取凭证的恶意软件，其 2.0 版本还会覆盖/删除用户主目录下的每一个文件。那个事件波及了 796 个 npm 包，累计下载量超过 2000 万次，所以…… 哇哦。从安全角度看，npm 的这一年不算好。

如果你有正经的生产应用在使用 npm，或许可以了解一下 [Socket](https://socket.dev/) 这样工具来寻求保护。

## 我该学什么？

永恒的回答是，学习这些事物是如何运作的基础技能，无论工具和框架等发生怎样的变化，都会让你受益。而且，要我说（我敢说），AI 在编码上帮我们越多，我们就越需要像你这样的人——真正了解自己在做什么，无论代码是怎么生成的，都能做好规划、引导、塑造、测试、架构，并为代码注入良好的品味。

---

## 译者注

大部分内容由 AI 辅助翻译完成，译者进行了润色和校对。

这篇文章本质上是一份 JavaScript 生态年度观察，并不追求像规范文档那样面面俱到，而更像是从一线前端开发者视角出发，帮你快速建立 2026 年的全局感。

文中对部分技术的判断明显带有作者个人偏好，比如对 `Import Attributes`、Node.js 内置能力、Astro、Vite 的喜爱，以及对某些服务端 React 方案复杂度与安全性的警惕。翻译时我尽量保留了这种「有观点的综述」口吻，而没有把它抹平成百科条目。

另外，这篇文章写于 2026 年 4 月，其中有些内容本身就带有「年中展望」的性质，尤其是 ES2026 相关部分。因此更适合把它当作阶段性快照来读，而不是最终定论。
