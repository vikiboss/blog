---
title: '[译] 从库到标准：9 次 Web 平台的演进轨迹'
date: 2026-05-19
topic: '前端'
excerpt: '前端库对 Web 平台的几次关键影响。'
isOriginal: false
author: 'Jad Joubran'
tags:
  - 'Web Platform'
  - 'JavaScript'
  - 'npm'
  - '前端'
  - '翻译'
---

> 原文：9 Times the Web Platform Was Influenced by Libraries
>
> 时间：2026 年 5 月 4 日
>
> 作者：Jad Joubran
>
> 链接：https://jadjoubran.io/blog/web-platform-influenced-by-libraries

---

Web 平台很多最优秀的 API 并不是它自己发明出来的，而是后来才追赶上的。

真正发明这些 API 的，是那些在生产环境里被广泛使用的库。它们在成千上万名开发者、成千上万个代码库中接受检验，而这种反馈是你无法靠模拟得到的。它们收到 bug 报告，不断迭代，最终那些经受住考验的模式，被 Web 平台本身吸收了进去。

如果你是 JavaScript 老手，这篇文章大概会勾起不少回忆。如果你接触 Web 的时间还不算长，也欢迎你来补上这段历史。下面就来看看，那些你今天每天都在用的 API，最初是怎么来的。

## 1. `querySelector` 和 `querySelectorAll`

现在用 CSS 选择器从 DOM 里定位元素已经是再自然不过的事了，但它一开始并不是浏览器的内置能力。

在这之前，你得自己把结果一点点拼出来：`getElementById`、`getElementsByClassName`、`getElementsByTagName`，然后再往 `.children` 里继续走，再自己过滤。只要需求稍微复杂一点，不再只是单个类名或标签名，很快就会演变成一段小型 DOM 遍历逻辑。

Dojo 里的 `dojo.query` 最早把这个思路带了出来。后来，jQuery 的 `$()`（底层由 *Sizzle* 引擎驱动）把它变成了整整一代 Web 开发者的默认心智模型。再后来，浏览器终于提供了自己的原生实现：

```js
const button = document.querySelector(".buy-now")
const allButtons = document.querySelectorAll(".buy-now")

console.log(button.textContent)

allButtons.forEach((btn) => {
  console.log(btn.textContent)
})
```

`querySelector` 返回第一个匹配项（或者 `null`），`querySelectorAll` 返回包含所有匹配项的 `NodeList`。

**注意：** Chrome 和 Firefox 的 DevTools 会在控制台里提供 `$` 和 `$$` 作为这两个 API 的快捷方式。它们很适合临时调试，但也要清楚它们的边界：

- 它们只在 DevTools 控制台的顶层作用域可用，不能在页面本身的 JavaScript 代码里用。
- 它们不能在回调函数里使用。
- 如果页面自己定义了 `$`（比如页面用了 jQuery），那会优先使用页面自己的版本。

所以，它们很适合做快速实验，但不适合作为你真正依赖的代码。

## 2. 声明式 UI：`popovertarget` 和 `command`

这两个属性很有意思，因为它们让你可以**用 HTML 替代 JavaScript**。

它们解决的是一个非常具体的问题：以声明式的方式，把一个按钮和某个目标元素连起来。点击按钮，目标元素就显示或隐藏。不需要 `addEventListener`，也不需要手动调用 `.show()` / `.hide()`。

十年前，这种「连线」通常长这样：

```js
const button = document.querySelector(".open-modal")
const modal = document.querySelector("#my-modal")

button.addEventListener("click", () => {
  modal.classList.add("is-open")
})
```

Bootstrap 发现这个模式到处都在重复，于是把这段连线逻辑替换成了属性：

```html
<button data-toggle="modal" data-target="#my-modal">Open</button>
```

Bootstrap 的 jQuery 插件会读取这些 `data-*` 属性，并帮你完成显示/隐藏逻辑。也就是说，至少在「连线」这件事上，你不用自己写 JavaScript。

后来，平台把这个思路原样吸收了进来，只不过不再需要库：

```html
<button popovertarget="my-popover">Open</button>

<div id="my-popover" popover>
  <p>Hello from a popover.</p>
  <button popovertarget="my-popover" popovertargetaction="hide">Close</button>
</div>
```

`command` 则把同样的模式扩展到了其他内置元素上（比如 `<dialog>`），通过显式命名动作来完成控制：

```html
<button commandfor="my-dialog" command="show-modal">Open dialog</button>

<dialog id="my-dialog">
  <p>Hello from a dialog.</p>
  <button commandfor="my-dialog" command="close">Close</button>
</dialog>
```

**额外的好处是**，这些属性通常操作的目标元素 —— 比如带 `popover` 属性的元素以及 `<dialog>` —— 本身就自带行为：焦点管理、按 `Escape` 关闭，以及（对 popover 来说）点击外部自动关闭（`light-dismiss`）等，都是内置的。过去，这些行为几乎每个模态框实现都要手搓一遍，而且要把无障碍做好并不容易。

## 3. `classList`

在 `classList` 出现之前，操作类名要靠 `className` 这个以空格分隔的字符串。新增一个类名，意味着你要先拆分、再检查、再拼回去。删除一个类名，则要过滤后再重组。过程既繁琐，又很容易写错。

jQuery 的 `.addClass()`、`.removeClass()`、`.toggleClass()` 和 `.hasClass()` 就是对此的回应。它们普及到一定程度后，平台也提供了自己的版本：`classList` 属性。

```js
const button = document.querySelector(".buy-now")

button.classList.add("is-loading")
button.classList.remove("is-disabled")
button.classList.toggle("is-active")
button.classList.contains("is-loading") // boolean
button.classList.replace("is-loading", "is-success") // jQuery 里没有
```

这里有个很值得一提的小细节：传给它的是类名本身，**不要带前导 `.`**。很多人刚从 CSS 选择器切换到 `classList` 时，最常犯的就是这个错误。

## 4. 字符串和数组上的工具方法

有整整一类小而常用的辅助方法，几乎是直接从工具库里「搬」进标准库的：Underscore、Lodash、MooTools、Prototype.js。它们在各种代码库里已经普及到无处不在，标准化只是迟早的事。

下面列一些不完全清单：

- `String.prototype.startsWith`
- `String.prototype.endsWith`
- `String.prototype.includes`
- `String.prototype.repeat`
- `String.prototype.padStart`
- `String.prototype.padEnd`
- `Array.prototype.includes`
- `Array.prototype.flat`（来自 `_.flatten`）
- `Array.prototype.flatMap`

过去，每一个方法都意味着你要先 `npm install` 一个包（或者加一个 `<script>` 标签）。现在，它们直接就是语言的一部分。

这里还有一段挺有意思的 Web 历史：`Array.prototype.flat` 最初提案的名字其实是 `flatten`，但 MooTools 曾经给 `Array.prototype.flatten` 打过 monkey patch，而且语义还不一样。如果原生也叫 `flatten`，那些仍在加载 MooTools 的网站就会直接出问题。于是，这个提案后来改名了，这件事如今被称作 [SmooshGate](https://developer.chrome.com/blog/smooshgate)。

## 5. `structuredClone`

过去，在 [JavaScript](https://learnjavascript.online/?utm_source=jadjoubran.io/blog) 里做对象深拷贝，通常意味着你要用 Lodash 的 `_.cloneDeep`，或者用那个著名的 `JSON.parse(JSON.stringify(obj))` 技巧 —— 但一旦对象里出现 `Date`、`Map` 或循环引用，这招立刻就失效了。

真正值得强调的转折在于：这个深拷贝算法其实**早就已经存在于平台内部**。每次你调用 `postMessage`，或者把对象写进 IndexedDB，浏览器都会悄悄用它来复制数据。只是以前，我们没有办法单独调用它。

`structuredClone` 本质上就是平台终于把自己内部用了很多年的能力，正式暴露出来：

```js
const original = {
  name: "Jad",
  createdAt: new Date("2026-01-01"),
  tags: new Map([["role", "instructor"]]),
  nested: { items: [1, 2, 3] },
}

const copy = structuredClone(original)

copy.nested.items.push(4)

console.log(original.nested.items) // [1, 2, 3] (unchanged)
console.log(copy.nested.items) // [1, 2, 3, 4]
console.log(copy.createdAt instanceof Date) // true
console.log(copy.tags instanceof Map) // true
```

`Date`、`Map`、`Set`、`RegExp` 以及各种 typed array，在克隆后都能保留原本的类型信息。完全不需要额外库。

## 6. `Promise`

早年，JavaScript 里要处理异步，往往得在好几套互相竞争的库里选一个：Dojo 的 `Deferred`、jQuery 的 `Deferred`、Q、Bluebird。后来，生态逐渐收敛到一个共同规范：`Promises/A+`，再后来，平台正式接纳了它。

Bluebird 值得单独提一句。它一度比早期原生 `Promise` 实现快得多，以至于很多代码库在浏览器和运行时已经原生支持 `Promise` 之后，仍然继续用了很多年。这种情况并不常见——库的表现反而长期优于平台本身 —— 但它也说明，社区在应用层（即库/框架这一层）里做的这些工作，质量是非常高的。

今天，`Promise` 和 `async` / `await` 已经成了这门语言处理异步的默认模型：

```js
async function loadUser(id) {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) {
    throw new Error("Failed to load user")
  }
  return response.json()
}

const user = await loadUser(42)
console.log(user.name)
```

## 7. ES Modules

把代码拆分到多个文件里，是再基础不过的需求，但 JavaScript 最初发布时并没有模块系统，于是社区自己把这个坑填上了。

Node.js 选择了 CommonJS（`require` / `module.exports`）。浏览器侧则通过 RequireJS 使用 AMD（`define([...], function () { ... })`）。两个应用层模块系统，加上多年的打包工具演进，最后平台才终于推出了自己的方案：

```js
// math.js
export function add(a, b) {
  return a + b
}

export const PI = 3.14159
```

```js
// app.js
import { add, PI } from "./math.js"

console.log(add(2, 3)) // 5
console.log(PI) // 3.14159
```

`import` / `export` 语法本身是全新的：它既不是 CommonJS 的写法，也不是 AMD 的写法。但「模块」这个**核心概念**，正是这些库和工具先证明了它的必要性，平台才最终跟进。

## 8. `Temporal`

JavaScript 的 `Date` 对象，三十年来几乎一直都问题重重：可变、月份从 `0` 开始、缺乏真正的时区支持。围绕它成长起来的库也因此层出不穷，其中最具代表性的就是 Moment.js，它几乎把 `Date` 的各种痛点都踩了个遍，也记录了个遍。

这里最关键的一点是：`Temporal` 提案的主要推动者之一，是 Moment.js 的维护者 Maggie Johnson-Pint（当时在 Microsoft 任职）。与此同时，来自 Bloomberg 和 Igalia 的工程师也主导了大量持续多年的规范设计与实现工作。

```js
const birthday = Temporal.PlainDate.from("2026-06-27")
const reminder = birthday.subtract({ days: 7 })

console.log(reminder.toString()) // 2026-06-20
console.log(birthday.toString()) // 2026-06-27 (unchanged)
```

如果你想更深入了解 `Temporal` 本身，可以看看我之前写的文章：[Working with Dates in JavaScript Using the Temporal API](https://jadjoubran.io/blog/javascript-temporal-api) 以及 [Temporal API Cheatsheet](https://learnjavascript.online/temporal.html)。

## 9. `Element.closest()`

过去，如果你想沿着 DOM 树向上查找最近的匹配祖先元素，要么自己手写一个 `while` 循环，要么用 jQuery 的 `.closest()`。现在，这个能力已经是原生内置的了。

它最典型的使用场景，就是事件委托：

```js
document.addEventListener("click", (event) => {
  const button = event.target.closest("button.action")
  if (!button) return // click wasn't on (or inside) a matching button

  const action = button.dataset.action
  console.log("action:", action)
})
```

你只需要在 `document` 这一层绑定一个监听器，`closest()` 就会帮你判断，真正被点击的到底是不是某个目标按钮 —— 哪怕用户点到的是按钮内部的图标，或者文字节点附近的位置。

## 接下来会是什么？

当然，不是所有平台特性都起源于某个库 —— 很多能力本来就是浏览器工程师和标准组织直接设计出来的。但应用层先试探、先迭代，再由平台把最终胜出的模式标准化，这条路径无疑是更健康的一种。它更像一个反馈回路，而不是一场竞争。

你可以想象一下：如果今天连 `document.querySelector` 都得先 `npm install` 一个库才能用，会是什么感觉？曾经的世界，确实就是那样。很多如今看起来「天生就该存在」的东西，其实最开始都只是某个人 `lib/` 文件夹里的一段代码。

平台吸收库里的模式，并不意味着库「输了」，恰恰相反，这说明它们**成功到了不再被需要**的地步。

所以，最后留一个有意思的问题：今天的哪些库，会变成明天的标准？哪些模式正在应用层里悄悄接受实战检验，并会在几年后进入平台？更何况，如今浏览器推进功能的速度比过去快得多 —— 有些特性甚至在发布当年就能进入 `Baseline Newly Available` —— 也许这个时间线会比我们想象得更短。

---

## 译者注

主要内容由 AI 辅助翻译，译者进行了后期润色和校对。
