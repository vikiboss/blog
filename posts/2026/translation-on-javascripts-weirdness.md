---
title: '[译] 论 JavaScript 的怪异之处'
date: 2026-09-18
topic: '前端'
excerpt: 'JavaScript 真的太怪了！'
isOriginal: false
author: 'Konstantin Wohlwend'
tags:
  - 'JavaScript'
  - 'eval'
  - '前端'
  - '翻译'
---

> 原文：On JavaScript's Weirdness
>
> 时间：2025 年 4 月 1 日
>
> 作者：Konstantin Wohlwend
>
> 链接：https://www.hexclave.com/blog/on-javascripts-weirdness

---

*JavaScript 烂透了，因为 `'0' == 0`！*

—— 几乎每个人都这么说

确实，JavaScript 的那部分很烂，但如今每个 JS 项目都配有 linter，会对这类代码大喊大叫。

不过，我想聊聊 JavaScript 中一些更奇怪、更隐蔽的怪癖 —— 那些比这更阴险的 —— 你在 r/ProgrammerHumor 或 JS 教程里找不到的东西。

所有这些都可能发生在任何 JavaScript/ECMAScript 环境中（浏览器、Node.js 等），无论是否启用 `use strict`。（如果你在做没有严格模式的遗留项目，你应该赶紧跑。）

## 1. eval 比你想象的更糟

如果认为下面这两个函数是一样的，那就太傻了：

```js
function a(s) {
  eval("console.log(s)");
}
a("hello");  // 打印 "hello"

function b(s) {
  const evalButRenamed = eval;
  evalButRenamed("console.log(s)");
}
b("hello");  // Uncaught ReferenceError: s is not defined
```

区别在于，前者可以访问当前作用域中的变量，而重命名后的版本只能访问全局作用域。

为什么？事实证明， [ECMAScript 对函数调用的定义](https://tc39.es/ecma262/#sec-function-calls-runtime-semantics-evaluation) 有一个硬编码的特殊情况，当被调用的函数名为 `eval` 时，会运行一个略有不同的算法：

![eval 规范](https://www.hexclave.com/img/posts/05/eval-spec.png)

我无法充分强调，在 *每一次函数调用* 的规范中都有这种 hack 是多么疯狂！虽然不用说，任何一个稍微靠谱点的 JS 引擎都会优化它，所以虽然没有直接的性能损失，但它确实让构建工具和引擎变得更加复杂。（举个例子，这意味着 `(0, eval)(...)` 与 `eval(...)` 不同，所以压缩器在删除看似无用的代码时必须考虑到这一点。可怕！）

---

## 2. JS 循环假装它们的变量是按值捕获的

是的，这个标题毫无道理，但你会马上明白我的意思。让我们从一个例子开始：

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
// 打印 "0 1 2" — 符合预期

let i = 0;
for (i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
// 打印 "3 3 3" — 什么？
```

为什么变量在哪里定义会有影响？反正都是同一个变量，对吧？

在任何编程语言中，当你用 lambda 或箭头函数捕获值时，有两种传递变量的方式：按值（复制）或按引用（传递指针）。有些语言，比如 C++，让你选择：

```cpp
// 下面是 C++ 代码：

// 按值捕获
int byValue = 0;
auto func1 = [byValue] { std::cout << byValue << std::endl; };
byValue = 1;
func1();
// 打印 0，因为变量的值被复制了

// 按引用捕获
int byReference = 0;
auto func2 = [&byReference] { std::cout << byReference << std::endl; };
byReference = 1;
func2();
// 打印 1，因为变量是按引用捕获的
```

话虽如此，大多数高级语言（JS、Java、C#……）都是按引用捕获变量：

```js
let byReference = 0;
const func = () => console.log(byReference);
byReference = 1;
func();
// 打印 1
```

通常情况下，这正是你想要的，但在循环中尤其不可取。在循环中，你通常需要在回调函数中对迭代器变量做一些事情：

```cs
// 下面是 C# 代码：
for (int i = 0; i < 3; i++) {
  setTimeout(() => {
    Console.WriteLine(i);
  }, 1000 * i);
}
// 打印 "3 3 3" — 可能不是你想要的
```

作为「修复」，ECMAScript 标准对 for 循环变量进行了 hack，使它们具有不同的行为，但仅当它们是在循环头部定义时：

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000 * i);
}
// 打印 "0 1 2"

// 但如果我们将循环变量提取出来，它就不起作用了：
let i = 0;
for (i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000 * i);
}
// 打印 "3 3 3"
```

我在 Twitter 上 [发了这个](https://x.com/n2d4wastaken/status/1869122648661442859)，很多人告诉我，如果你理解 ECMAScript 标准中 for 循环和闭包在作用域方面的定义，这「说得通」。确实如此，尽管这很怪异，因为它真的不符合大多数人的直觉。更准确地说，如果你想在 JavaScript 中展开一个 for 循环，符合规范的展开方式应该是这样的：

```js
// 直观的 for 循环展开方式（在 JS 中是错误的）
let i = 0;
while (i < 3) {
  // ... for 循环体 ...
  i++;
}

// 符合规范的 for 循环展开方式
let _iteratorVariable = 0;
while (_iteratorVariable < 3) {
  let i = _iteratorVariable;
  // ... for 循环体 ...
  i++;
  _iteratorVariable = i;
}
```

话虽如此，几乎没人谈论这件事，这证明了这些「hack」有时是多么有用。（TypeScript 的类型系统有大量类似这样的「有用」hack，我认为这是它尽管复杂却如此受欢迎的部分原因 —— 哪天我应该写一篇关于这个的文章。）

---

## 3. 那个假值对象

常识是 JavaScript 中有 8 个假值：`false`、`+0`、`-0`、`NaN`、`""`、`null`、`undefined` 和 `0n`。

哦，我撒谎了。实际上还有第九个，而且它是一个对象：

```js
console.log(document.all); // 打印 HTMLAllCollection [<html>, <head>, ...]
console.log(Boolean(document.all)); // 打印 false
```

我差点没把这个包括在文章里，因为它只影响浏览器。但事实证明，它实际上是在 [ECMAScript 标准](https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot) 中规定的，而不是在 DOM 标准中（你通常会在那里看到浏览器特定的东西），所以我把它留下了：

![document.all 规范](https://www.hexclave.com/img/posts/05/document-all-spec.png)

为什么？因为在旧版本的 Internet Explorer 上，`document.getElementById` 不可用，取而代之的是一个名为 `document.all` 的属性，所以很多代码是这样写的：

```js
if (document.all) {  // IE 特定
  // 用 document.all 做一些事情
} else {  // 其他所有浏览器
  // 用 document.getElementById 做一些事情
}
```

为了与 IE 兼容，其他浏览器也继续实现了 `document.all`。然而，它比 `document.getElementById` 慢得多，所以那些浏览器决定 `document.all` 应该是假值，以便让上面的代码走快速路径。我们怎能不爱 IE 呢？

---

## 4. 字素与字符串迭代

比较众所周知的是，JavaScript 中的字符串是 UTF-16 编码的，这意味着存在低位和高位代理项。本质上，这意味着有些字符占用两个 UTF-16 代码单元：

```js
const japanese = "𠮷";
console.log(japanese.length);  // 打印 2
console.log(japanese.charCodeAt(0));  // 打印 55362
console.log(japanese.charCodeAt(1));  // 打印 57271
```

代理项总是成对出现，从不超过两个。所以，合理地讲，如果你有 `n` 个字符，那么 `String.prototype.length` 将总是在 `n` 和 `2n` 之间，取决于有多少代理项。

但那么这段代码的输出是什么？

```js
const family = "👨‍👩‍👧‍👦‍👨‍👩‍👧‍👦";  // 两个家庭 emoji
console.log(family.length);  // 打印 23
```

如果你很了解 Unicode，你会知道代理项并不能说明全部问题 —— 有些字符（特别是 emoji）由多个 Unicode 码点组成（每个码点可能是一个 UTF-16 代码单元，或者一个代理对）。

现在，如果我们想遍历它们呢？

```js
const family = "👨‍👩‍👧‍👦‍👨‍👩‍👧‍👦";
let count = 0;
for (const char of family) {
  count++;
}
console.log(count);  // 打印 15
```

不同的数字？显然这里有些不对劲。

好吧，不管了，新的 `Intl` API 就是为此而生的，它们解决了这个烂摊子。对吧？

```js
const family = "👨‍👩‍👧‍👦‍👨‍👩‍👧‍👦";
const chars = new Intl.Segmenter().segment(family);
console.log([...chars].length);  // 打印 1
```

还不是 2！

本质上，有四种合理的「字符串长度」概念，而 JavaScript 把它们全混在一起了：

1.  23，UTF-16 代码单元的数量（大多数字符串函数，如 `.length`、`.split` 等）
2.  15，Unicode 码点的数量（用 `for` 遍历字符串时）
3.  2，*显示字符* 的数量（可能因浏览器的 emoji 支持而异）
4.  1，*扩展字素簇* 的数量（`Intl.Segmenter`）

如果我们把上面的字符串粘贴到 Unicode 分析器中，就更容易理解了：

```
UTF-16:  0x55357  0x56424  0x08205  0x55357  0x56425  0x08205  0x55357  0x56423  0x08205  0x55357  0x56422  0x08205  0x55357  0x56424  0x08205  0x55357  0x56425  0x08205  0x55357  0x56423  0x08205  0x55357  0x56422
            └────────┘        │        └────────┘        │        └────────┘        │        └────────┘        │        └────────┘        │        └────────┘        │        └────────┘        │        └────────┘   
Unicode:       Man    zero-width-joiner  Woman   zero-width-joiner   Girl   zero-width-joiner    Boy           │           Man    zero-width-joiner  Woman   zero-width-joiner   Girl   zero-width-joiner    Boy      
                └─────────────────────────────────────────────────────────────────────────────────┘            │            └─────────────────────────────────────────────────────────────────────────────────┘       
Display:                                               Family                                           zero-width-joiner                                          Family                                             
                                                          └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                               
Intl:                                                                                              Extended grapheme cluster
```

本质上，每个 Unicode 码点恰好是一个或两个 UTF-16 代码单元。每个浏览器/字体都有自己的规则来合并它们成为显示字符，而扩展字素簇算法试图近似这一点，但并不完美。

如果你很好奇，Henri Sivonen [写了这篇优秀的博客文章](https://hsivonen.fi/string-length/) 讲述其他语言是怎么做的，但遗憾的是没有完美的解决方案，因为国际化本质上是一个难题。不过，我想你总是可以 [完全摆脱 Unicode](https://x.com/n2d4wastaken/status/1899277391048179965)。

---

## 5. 稀疏数组

你可以直接在数组中重复逗号来让某些元素变成 `undefined`：

```js
const sparse = [1, , , 4];
console.log(sparse[0], sparse[1], sparse[2], sparse[3]);  // 打印 1 undefined undefined 4
```

或者不是？

```js
const sparse = [1, , , 4];
sparse.forEach(e => console.log(e));  // 打印 1 4 — 不打印 undefined
```

让我们和一个普通数组比较：

```js
const dense = [undefined, undefined];
const sparse = [,,];

console.log(dense.length); // 打印 2
console.log(sparse.length); // 打印 2

console.log(dense); // 打印 [undefined, undefined]
console.log(sparse); // 打印 [empty × 2]

console.log(dense.map(x => 123)); // 打印 [123, 123]
console.log(sparse.map(x => 123)); // 打印 [empty × 2]
```

这被称为「稀疏数组」。理解发生了什么的最简单方法是使用 `Object.entries`：

```js
console.log(Object.entries([1, undefined, undefined, 4]));
// 打印 [
//   ['0', 1],
//   ['1', undefined],
//   ['2', undefined],
//   ['3', 4]
// ]

console.log(Object.entries([1, , , 4]));
// 打印 [
//   ['0', 1],
//   ['3', 4]
// ]
```

JavaScript 数组实际上只是对象，数组元素只是它的属性。如果某些属性缺失，这会完全搞乱很多内置数组方法。我们称之为稀疏数组。

话虽如此，你可能根本不应该使用稀疏数组。不幸的是，`Array` 构造函数默认创建稀疏数组，导致非常不自然的代码：

```js
const sparse = new Array(4);
console.log(sparse); // 打印 [empty × 4]

// 这个也不行：
const stillNotDense = new Array(4).map(x => 123);
console.log(stillNotDense); // 打印 [empty × 4]

// 但你需要这样做：
const dense = new Array(4).fill(undefined).map(x => 123);
console.log(dense); // 打印 [123, 123, 123, 123]

// 或者你可以这样写：
const alsoDense = Array.from({ length: 4 }, () => 123);
console.log(alsoDense); // 打印 [123, 123, 123, 123]
```

如果这还不能说服你，稀疏数组的性能也极其糟糕。永远不要在代码中使用它们，你就没事了。

---

## 6. 奇怪的 ASI 怪癖

这段代码会打印什么？（提示：不是 2 1 4 3。）

```js
function f1(a, b, c, d) {
  [a, b] = [b, a]
  [c, d] = [d, c]
  console.log(a, b, c, d)
}

f1(1, 2, 3, 4)
```

结果是 `4 3 3 4`。

我漏掉了分号，这是发生了什么的一个很好的提示。有一个相当复杂的算法叫做 *自动分号插入*（ASI），它试图用一堆启发式方法猜测分号应该放在哪里。

```js
[a, b] = [b, a]
[c, d] = [d, c]

// 被 ASI 解释为：

[a, b] = [b, a][c, d] = [d, c]
              ^  ^
              |  |
              | 逗号运算符
              |
              数组访问

// 等同于：

[a, b] = [4, 3]
[b, a][4] = [4, 3]
```

[ASI 的确切机制](https://tc39.es/ecma262/#sec-automatic-semicolon-insertion) 超出了本文的范围，但本质上，它检查是否有语法错误，如果有，并且紧挨着前面有一个换行符，它就插入一个分号。因此，如果没有语法错误，它通常不会插入分号。

从 ECMAScript 标准委员会的角度来看，这个规则相当严格。向语言添加新语法意味着旧的语法错误可能不再是语法错误，但由于 ASI 依赖于特定位置出现的语法错误，每个新语法都可能破坏旧代码。为此，语言中有一些所谓的 *受限产生式*，即使代码在其他情况下语法正确，只要换行符存在，它们也总是插入分号。

---

## 等等

以下是一些我没有足够篇幅写的奇怪行为：

- 任何与 `==` 和 `!=` 相关的东西
- 任何与类型强制转换相关的东西
- 任何与 `this` 相关的东西
- NaN 不等于任何东西
- +0 与 -0
- 任何与浮点精度相关的东西，或者 IEEE 754 涵盖的其他内容
- `typeof null` 是 `"object"`
- 任何使用非严格模式或 `var` 的东西
- 从构造函数返回原始值
- 原型污染
- `Array.sort` 将数字转换为字符串
- ...

---

## 译者注

主要内容由 AI 辅助翻译，译者进行了后期润色和校对。
