---
title: 'setTimeout 初探'
date: 2020-04-02
topic: '前端'
top_image: 'https://i.loli.net/2020/11/21/QLTeHUhrAOBCzER.jpg'
excerpt: '解析 setTimeout 在循环中的经典面试题。探讨 var、let 声明及 IIFE 对作用域的影响。'
tags:
  - 'JavaScript'
  - '作用域'
  - '面试'
  - '闭包'
  - '事件循环'
---

## 问题

写出下列三个循环的输出值，并解释原因：

```js
// 循环 1：使用 var 声明
for (var i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  })
}

// 循环 2：使用 IIFE 包装
for (var i = 0; i < 10; i++) {
  ;(function (i) {
    setTimeout(() => {
      console.log(i)
    })
  })(i)
}

// 循环 3：使用 let 声明
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i)
  })
}
```

## 输出结果

### 浏览器控制台环境

1. 输出 `39` 和十个 `10`
2. 输出 `undefined` 和 `0` 到 `9`
3. 输出 `13` 和 `0` 到 `9`

### Node.js 环境

1. 输出十个 `10`
2. 输出 `0` 到 `9`
3. 输出 `0` 到 `9`

## 原理解析

### 循环 1：var 声明的变量提升问题

使用 `var` 声明的变量 `i` 是函数作用域或全局作用域的，循环结束后 `i` 的值为 `10`。

当 `setTimeout` 的回调函数执行时（在事件循环的宏任务阶段），循环早已结束，此时所有回调函数访问的都是同一个 `i` 变量，其值为 `10`，因此输出十个 `10`。

### 循环 2：IIFE 创建独立作用域

IIFE（立即执行函数表达式）为每次循环创建了独立的函数作用域，将当前的 `i` 值作为参数传入并保存。

每个 `setTimeout` 的回调函数都访问自己作用域内的 `i` 值，因此能够正确输出 `0` 到 `9`。这是 ES6 之前解决闭包问题的经典方案。

### 循环 3：let 的块级作用域特性

使用 `let` 声明的变量具有块级作用域。在 `for` 循环中，`let` 会为每次迭代创建一个新的变量绑定，每个 `setTimeout` 的回调函数都能访问到当次循环的 `i` 值。

这是 ES6 提供的更优雅的解决方案，不需要借助 IIFE。

### 浏览器与 Node.js 的输出差异

浏览器控制台会额外输出表达式的返回值（类似 `eval()` 的行为）：

- 循环 1 返回 `39`（最后一次 `setTimeout` 的返回值，即定时器 ID）
- 循环 2 返回 `undefined`（IIFE 没有返回值）
- 循环 3 返回 `13`（最后一次 `setTimeout` 的返回值）

Node.js 环境不会输出表达式返回值，只输出 `console.log` 的内容。

## 总结

- `var` 声明变量存在作用域问题，容易在异步场景下产生意外行为
- 使用 IIFE 可以创建独立作用域解决闭包问题
- `let/const` 的块级作用域是现代 JavaScript 推荐的方案
