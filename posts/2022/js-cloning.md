---
title: '简单实现一下 JavaScript 中的深拷贝与浅拷贝'
date: 2022-03-06
topic: '前端'
top_image: 'https://s2.loli.net/2022/03/06/ed7FfCKA1ipN24r.png'
excerpt: '解析 JavaScript 的深拷贝与浅拷贝的本质区别，手写深拷贝函数。'
tags:
  - 'JavaScript'
  - '深拷贝'
  - '内存'
  - '面试'
  - '代码'
---

## JavaScript 的数据类型与内存模型

我们知道，在 JavaScript 语言中，有**基本数据类型**和**引用数据类型**之分。

**基本数据类型**的变量名和值都储存在**栈内存**中。每次声明一个基本数据类型的变量时，都会在栈内存里重新开辟一块空间进行存储，彼此之间互不影响。

**引用数据类型**就不一样了。引用类型的变量名储存在**栈内存**中，但它的值储存的是**堆内存**的**地址**，真正的数据被放在了堆内存当中。换句话说，栈内存只是存放了变量名与堆内存地址的映射关系。

这种内存分配方式看着挺合理，但在实际使用中会出现一些"意外"的情况：

```js
const obj = { a: 123, b: 456 }
const obj2 = obj
obj.a = 789
console.log(obj2.a)
```

猜猜打印出的是什么？

在没了解相关知识之前，你可能下意识地以为是 `123`，但其实真正的答案是 `789`。没错，就是 `789`！不信可以自己按 F12 到控制台试试。

为什么会这样呢？为什么不是 `123`？

## 浅拷贝与深拷贝

原因在于，当我们通过赋值运算符 `=` 对引用数据类型进行赋值时，由于 JavaScript 语言的特性，实际赋值的是 `obj` 这个变量的**地址**（即 `{ a: 123, b: 456}` 这个对象在堆内存中的地址）。

可以这样理解：当你使用 `=` 时，其实只是拷贝了这个对象的一个"引用"。`obj` 与 `obj2` 共用同一个堆内存地址，它们指向同一块堆内存。这种只拷贝引用地址、实际仍指向同一块内存的方式，我们称之为**赋值**。

为了解决这个问题，我们需要对对象进行真正的**拷贝**。根据拷贝的程度不同，分为**浅拷贝**和**深拷贝**两种方式：

**浅拷贝**：创建一个新对象，如果属性是基本类型，拷贝的就是基本类型的值；如果属性是引用类型，拷贝的就是内存地址。换句话说，对于深层（超过一层）的引用类型，仍然只拷贝了内存地址。

**深拷贝**：能够使源对象与拷贝对象**完全独立**，任何一个对象的改动都**不会影响**另一个对象的拷贝方式。

### 浅拷贝的常见场景

以下情况属于浅拷贝（未彻底拷贝，新旧对象会相互影响）：

1. 对引用数据类型直接使用赋值运算符 `=`
2. 使用数组的 `slice()`、`concat()` 等方法处理二维及以上数组
3. 使用 `Object.assign()` 拷贝对象，且对象属性值包含引用类型
4. 使用扩展运算符 `...` 拷贝两层及以上的引用类型数据（对象或数组）

### 深拷贝的实现方式

以下情况属于深拷贝（彻底拷贝，新旧对象完全独立）：

1. 手动创建新对象，并使用递归对每一层进行拷贝
2. 使用 `JSON.parse(JSON.stringify(obj))`（不推荐）
3. 使用 jQuery、Lodash 等库提供的深拷贝函数

#### 为什么不推荐使用 JSON 方法？

使用 `JSON.parse(JSON.stringify(obj))` 虽然简单，但有很多局限性：

1. 值为 `undefined`、函数、`Symbol` 的属性会被忽略
2. 值为 `NaN`、`Infinity`、`-Infinity` 会被转为 `null`
3. `Error`、`RegExp`、`Set`、`Map` 等内置对象会被转为空对象 `{}`
4. `Date` 对象会被强制转换为字符串
5. 无法正确处理循环引用

## 手写实现深拷贝函数

为了解决引用类型赋值的问题，我们需要实现一个 `deepClone` 函数，达到以下效果：

```js
const obj = { a: 123, b: 456 }
const obj2 = deepClone(obj)
obj.a = 789
console.log(obj2.a) // 期望输出 123，而不是 789
```

### 第一版实现

下面是一个基础版本的深拷贝实现：

```js
function deepClone(obj, useJSON = false) {
  // 过滤基本数据类型
  if (typeof obj !== 'object' || obj === null) return obj
  // JSON 方式的深拷贝实现
  if (useJSON) return JSON.parse(JSON.stringify(obj))

  let _obj = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    // 原型链上的属性不拷贝
    if (!obj.hasOwnProperty(key)) continue
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // 如果属性值为引用类型，递归调用 deepClone 进行深拷贝处理
      _obj[key] = deepClone(obj[key])
    } else {
      // 基本数据类型直接赋值
      _obj[key] = obj[key]
    }
  }
  return _obj
}
```

让我们测试一下：

```js
const obj = { a: 123, b: { c: 456 } }
const obj2 = deepClone(obj)
obj.b.c = 789
console.log(obj2.b.c) // 输出 456，测试通过！
```

这个实现能够处理普通对象的深拷贝，但对于包含 JavaScript 内置对象（如 `Date`、`Set`、`Map` 等）的对象，可能就有点力不从心了。来看下面的例子：

```js
const obj = {
  a: new Date(),
  b: { c: new Set([1]), d: new Map([['a', 1]]) },
  e: { f: new Error('msg'), g: new RegExp('^obj$') },
  h: (e) => console.log(e),
}

// 使用上述的 deepClone 函数
const obj2 = deepClone(obj)
obj.b.c = (e) => console.log(e)
console.log(obj2)

// 输出结果：
// {
//   a: {},
//   b: { c: {}, d: {} },
//   e: { f: {}, g: {} },
//   h: [Function: h],
// }
```

可以看到，`Set`、`Map`、`Error`、`RegExp`、`Date` 等内置对象都被当作普通对象处理了，拷贝出来的都是空对象 `{}`。这显然不是我们想要的结果！

### 第二版实现（最终版）

让我们改进这个函数，使它能够正确处理 JavaScript 内置对象：

```js
function deepClone(obj) {
  // 定义获取类型的函数，Object.prototype.toString 返回详细的类型描述
  function getType(value) {
    return Object.prototype.toString.call(value).slice(8, -1)
  }

  // 过滤基本数据类型和内置对象（Error、RegExp、Date 等）
  if (getType(obj) !== 'Object' && getType(obj) !== 'Array') return obj

  let _obj = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    // 原型链上的属性不拷贝
    if (!obj.hasOwnProperty(key)) continue
    if (getType(obj[key]) === 'Object' || getType(obj[key]) === 'Array') {
      // 如果属性值为数组或对象，递归调用 deepClone 进行深拷贝
      _obj[key] = deepClone(obj[key])
    } else {
      // 基本数据类型与内置对象直接赋值
      _obj[key] = obj[key]
    }
  }
  return _obj
}
```

再次测试：

```js
const obj = {
  a: new Date(),
  b: { c: new Set([1]), d: new Map([['a', 1]]) },
  e: { f: new Error('msg'), g: new RegExp('^obj$') },
  h: (e) => console.log(e),
}

const obj2 = deepClone(obj)
obj.b.c = (e) => console.log(e)
console.log(obj2)

// 输出结果：
// {
//   a: 2022-03-06T05:11:33.838Z,
//   b: { c: Set(1) { 1 }, d: Map(1) { 'a' => 1 } },
//   e: { f: Error: msg, g: /^obj$/ },
//   h: [Function: h]
// }
```

完美！第二版代码使用 `Object.prototype.toString` 来精确判断类型，并正确处理了 JavaScript 内置对象，使拷贝结果更加准确。

不过需要注意的是，这个实现仍然只能处理普通对象。对于更复杂的场景（如循环引用、`WeakMap`、`WeakSet` 等），建议使用成熟的社区方案，如 [Lodash](https://lodash.com/) 的 `_.cloneDeep()`。

## 现代化的解决方案

### 使用 structuredClone（推荐）

从 2022 年开始，现代浏览器和 Node.js（v17.0+）已经内置了 `structuredClone` API，这是目前**最推荐**的深拷贝方式：

```js
const obj = {
  a: new Date(),
  b: { c: new Set([1]), d: new Map([['a', 1]]) },
  e: new RegExp('^obj$'),
}

const obj2 = structuredClone(obj)
```

#### structuredClone 的优势

1. **原生支持**：无需安装任何第三方库
2. **类型支持广泛**：支持 `Date`、`Set`、`Map`、`RegExp`、`ArrayBuffer`、`Blob` 等大部分内置对象
3. **处理循环引用**：能够正确处理对象的循环引用
4. **性能优异**：作为原生 API，性能通常优于第三方实现

#### structuredClone 的局限性

1. 不支持函数（函数会被忽略或抛出错误）
2. 不支持 `Symbol`
3. 不支持 DOM 节点
4. 不会拷贝对象的原型链

#### 使用示例

```js
// 普通对象
const original = { name: 'Viki', age: 18, hobbies: ['coding', 'reading'] }
const cloned = structuredClone(original)

// 包含内置对象
const complex = {
  date: new Date(),
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nested: { deep: { value: 42 } },
}
const clonedComplex = structuredClone(complex)

// 循环引用
const circular = { name: 'obj' }
circular.self = circular
const clonedCircular = structuredClone(circular) // 不会报错
```

### 使用第三方库

如果需要兼容旧环境或处理 `structuredClone` 不支持的类型，可以选择以下方案：

#### 1. rfdc（推荐用于 Node.js）

[rfdc](https://github.com/davidmarkclements/rfdc) 是一个专门处理深拷贝的轻量级 npm 包，性能优异：

```js
const clone = require('rfdc')()
const obj2 = clone(obj)
```

#### 2. Lodash

[Lodash](https://lodash.com/) 的 `_.cloneDeep()` 功能全面，但体积较大：

```js
import { cloneDeep } from 'lodash-es'
const obj2 = cloneDeep(obj)
```

### 总结

- **现代项目**：优先使用 `structuredClone`
- **需要兼容旧环境**：使用 rfdc 或 Lodash
- **学习目的**：手写实现有助于理解深拷贝原理
- **特殊需求**（如拷贝函数）：根据具体场景选择合适的方案
