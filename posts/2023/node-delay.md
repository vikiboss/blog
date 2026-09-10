---
title: '来试试 Node.js 内置的「delay」函数'
date: 2023-10-26
topic: '前端'
excerpt: '技多不压身，学起来！'
tags:
  - 'Node.js'
  - 'JavaScript'
  - '异步'
  - 'Promise'
  - 'API'
---

## 前言

在实际开发中，经常遇到需要在异步操作里进行「延时」操作的情况，通常会编写类似以下的工具函数来处理：

```ts
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
```

这个方案很简洁，也完美贴合了我们的需求。但如果你的代码运行在纯 Node.js 环境下，其实有一个更好的替代方案。

## 使用 Node.js Timers Promises API

从 Node.js v15.0.0 开始，官方内置支持了 Timers Promises API，提供了基于 Promise 的 `setTimeout` 函数。它的用法和我们手写的延时函数基本一致，但功能更强大。

### 基础用法

```ts
import { setTimeout } from 'node:timers/promises'

const sayHi = async () => {
  console.log('Hi!')
}

const doSomethingAsync = async () => {
  console.log('yolo!')

  // 延时 1 秒
  await setTimeout(1000)

  await sayHi()

  // 延时 1 秒并返回指定值
  const res = await setTimeout(1000, 'result')

  console.log('res is:', res)
}

doSomethingAsync()
```

运行结果如下：

```bash
yolo!           # 立即输出
Hi!             # 1 秒后输出
res is: result  # 再过 1 秒后输出
```

### 相比手写 delay 的优势

1. **官方支持** - 作为 Node.js 内置 API，稳定性和兼容性更有保障
2. **返回值支持** - 可以在延时的同时返回一个值，简化某些场景的代码
3. **取消支持** - 通过 AbortSignal 可以取消延时操作（高级用法）
4. **语义更清晰** - 使用 `node:timers/promises` 前缀让代码意图更明确

### 注意事项

- 需要 Node.js v15.0.0 或更高版本
- 仅在 Node.js 环境可用，浏览器环境仍需使用手写的 delay 函数
- 如果你的项目同时运行在浏览器和 Node.js 环境，可以考虑使用条件导入

## 参考资料

- [Node.js 官方文档 - Timers Promises API](https://nodejs.org/api/timers.html#timerspromisessettimeoutdelay-value-options)
