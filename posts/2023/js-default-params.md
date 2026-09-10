---
title: 'JavaScript 的函数参数竟然能相互访问到？'
date: 2023-11-04
topic: '前端'
excerpt: '这个地方还真注意不到...'
tags:
  - 'JavaScript'
  - 'ES6'
  - '函数'
  - '作用域'
  - '闭包'
---

是的，别骂了，我很菜，我在大惊小怪 😩。

## 基础用法：前面的参数可以被后面访问

最简单的情况，后面的默认参数可以访问前面的参数：

```ts
const buildFn = (
  name = 'Viki',
  sayHi = () => {
    console.log(name)
  },
) => {
  return sayHi
}

buildFn()() // 输出 Viki
buildFn('hi')() // 输出 hi
```

这个比较符合直觉，前面定义的 `name` 可以在后面的 `sayHi` 中使用。

## 对象参数的访问

即使是对象类型的参数，也可以在后续参数中访问和修改：

```ts
const buildFn2 = (
  obj = { name: 'Viki' },
  sayHi = () => {
    console.log(obj.name)
    obj = { name: 'VIKI' }
  },
  sayHi2 = () => {
    console.log(obj.name)
  },
) => {
  return { sayHi, sayHi2 }
}

buildFn2().sayHi() // 输出 Viki
buildFn2({ name: 'hi' }).sayHi2() // 输出 hi
```

这里 `obj` 参数可以在后面的 `sayHi` 和 `sayHi2` 中被访问到。

## 重点来了：后面的参数也能被前面访问

这个就很有意思了，即使 `name` 定义在 `sayHi` 后面，`sayHi` 依然能访问到它：

```ts
const buildFn3 = (
  sayHi = () => {
    console.log(name)
  },
  name = 'Viki',
) => {
  return sayHi
}

buildFn3()() // 输出 Viki，即使 name 在 sayHi 后面定义！
buildFn3(() => console.log(name), 'hi')() // 注意：外部传入的函数访问不到 name
```

**注意**：只有使用默认参数的函数才能访问到其他参数，外部传入的函数无法访问参数作用域。

## 参数顺序不影响闭包捕获

再看一个更复杂的例子，参数重新赋值不会影响已经捕获它的其他参数：

```ts
const buildFn4 = (
  sayHi = () => {
    console.log(obj.name)
    obj = { name: 'VIKI' } // 重新赋值 obj
  },
  sayHi2 = () => {
    console.log(obj.name)
  },
  obj = { name: 'Viki' }, // obj 定义在最后
) => {
  return { sayHi, sayHi2 }
}

buildFn4().sayHi() // 输出 Viki
buildFn4().sayHi2() // 输出 Viki（不受 sayHi 中重新赋值的影响）
```

每个默认参数函数都独立捕获了 `obj` 的引用，在 `sayHi` 中重新赋值 `obj` 不会影响 `sayHi2` 中的 `obj`。

## 总结

JavaScript 函数的默认参数有个有意思的特性：

1. **参数可以相互访问**：无论是前面的参数还是后面的参数
2. **不受顺序影响**：后面定义的参数也能被前面的默认参数函数访问到
3. **独立的闭包**：每个默认参数函数都独立捕获参数引用
4. **外部函数无法访问**：只有默认参数函数能访问参数作用域，外部传入的函数不行

可以在控制台自己跑跑看，加深印象 🙃。
