---
title: '记一次由 TypeScript 配置引发的运行时逻辑异常'
date: 2025-11-26
topic: '前端'
excerpt: '同一份 TypeScript 代码，在不同环境下运行结果竟然完全不同？'
tags:
  - 'TypeScript'
  - 'tsconfig.json'
  - 'useDefineForClassFields'
  - '运行时异常'
  - '配置项'
  - '问题排查'
---

## 问题现象

最近在项目中遇到了一个诡异的问题：同一份 TypeScript 代码，在不同的编译和运行时环境下都能正常编译通过，没有任何警告或报错。但代码执行时，逻辑却完全不一致！

先看一个简单的例子：

```typescript
class Foo {
  field?: number

  check() {
    return 'field' in this
  }
}

const foo = new Foo()

if (foo.check()) {
  console.log('field exists on foo')
} else {
  throw new Error('field does not exist on foo')
}
```

看到这段代码，你可能会觉得结果很明确：要么抛错（因为 `field` 没赋值，不应该存在于实例上），要么正常执行（因为 `field` 是类字段声明，应该存在于实例上）。

但现实是：**两种结果都有可能发生**！具体执行哪个分支，完全取决于 TypeScript 的编译配置和 JavaScript 运行时的行为。

## 问题根源：两套标准的冲突

这要从 TypeScript 和 ECMAScript 的发展历史说起。

TypeScript 在 [TC39](https://tc39.es/) 批准 [类字段提案](https://github.com/tc39/proposal-class-fields) 之前的许多年，就已经率先实现了类字段特性。结果后来 [ECMAScript](https://tc39.es/ecma262/) 正式标准出来了，运行时行为和 TypeScript 的早期实现居然不一样（虽然语法相同）。

这就导致了一个尴尬的局面：同一份代码，TypeScript 有两种不同的编译方式。

旧实现是这样的：类字段会被初始化为实例属性，未赋值的字段不会出现在实例对象上。而新标准则规定：类字段使用 [`Object.defineProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 定义，**未赋值的字段会被初始化为 `undefined`**。

这个差异直接影响了 [`in` 操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/in) 和其他属性检查方法的行为。看个例子就明白了：

```typescript
'key' in {} // false
'key' in { key: undefined } // true
Reflect.has({}, 'key') // false
Reflect.has({ key: undefined }, 'key') // true
;({}).hasOwnProperty('key') // false
;({ key: undefined }).hasOwnProperty('key') // true
```

注：[`hasOwnProperty`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty) 只检查自有属性，而 `Reflect.has` 和 `in` 操作符会检查整个原型链。

## 关键配置：useDefineForClassFields

好在 [TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) 引入了一个配置项来控制这个行为：[`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields)。

这个配置的默认行为是这样的：当 [`target`](https://www.typescriptlang.org/tsconfig/#target) 设为 `ES2022` 或更高版本（包括 `ESNext`）时，会自动启用；其他情况下默认禁用。

启用后，TypeScript 会按照最新的 ECMAScript 规范来处理类字段：类字段使用 `Object.defineProperty` 进行初始化，未赋值的字段也会被初始化为 `undefined`（即使没有显式赋值）。

这就带来一个问题：如果你的代码用 `in` 操作符或 [`Reflect.has`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/has) 来检查类字段的存在性，启用这个配置后，行为可能和你预期的不一样。

## 实际环境中的表现

下面列举几个常见环境的表现，方便你对照自己的项目。

### Node.js

[Node.js](https://nodejs.org/) 原生支持 ES2022+，默认遵循现代 ECMAScript 规范。结果是输出 `field exists on foo`。

### 官方 TSC 编译器

[TypeScript Compiler (tsc)](https://www.typescriptlang.org/docs/handbook/compiler-options.html) 的表现取决于 `target` 配置：当 `target` ≥ ES2022 时，自动启用 `useDefineForClassFields`，输出 `field exists on foo`；否则抛出错误 `field does not exist on foo`。

### tsx / esno

[tsx](https://tsx.is/)（TypeScript Execute）是一个用于直接运行 TypeScript 的 Node.js 增强工具，[esno](https://github.com/antfu/esno) 是它的别名工具。

底层使用 [esbuild](https://esbuild.github.io/) 进行编译，默认采用现代 ECMAScript 规范。在 [GitHub 源码](https://github.com/privatenumber/tsx/blob/710a42473ebfdff362818bed4fd1f5c7a27837e2/src/utils/transform/get-esbuild-options.ts#L6) 中可以看到配置：

```typescript
export const baseConfig = Object.freeze({
  target: `node${process.versions.node}`,
  // ...other options
})
```

表现结果是：默认情况下（Node.js 版本较新 + 无 `tsconfig.json`），输出 `field exists on foo`；如果在 `tsconfig.json` 中显式设置 `useDefineForClassFields: false`，则抛出错误 `field does not exist on foo`。

你可以通过修改 `tsconfig.json` 的 `useDefineForClassFields` 配置来验证行为差异：

```bash
TSX_TSCONFIG_PATH=./tsconfig.json npx -y tsx index.ts
```

```typescript
// ./index.ts
class Foo {
  field?: number

  check() {
    return 'field' in this
  }
}

const foo = new Foo()

if (foo.check()) {
  console.log('field exists on foo')
} else {
  throw new Error('field does not exist on foo')
}
```

```json
// ./tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": false
  }
}
```

## 如何避坑

为了避免这个配置引发的运行时逻辑异常，建议采取以下措施。

### 1. 统一使用现代规范

确保 `useDefineForClassFields` 配置始终开启，有两种方式：

一种是设置 `target`：

```json
{
  "compilerOptions": {
    "target": "ES2022" // 或更高版本，会自动启用
  }
}
```

另一种是手动开启：

```json
{
  "compilerOptions": {
    "useDefineForClassFields": true
  }
}
```

这样可以确保所有环境下的行为一致，符合最新的 ECMAScript 标准。

### 2. 改用更明确的检查方式

避免使用依赖字段存在性的检查方法，直接检查值本身更可靠：

```typescript
// ❌ 不推荐：
'field' in this // 不同配置下结果不同
Reflect.has(this, 'field') // 不同配置下结果不同

// ✅ 推荐：
this.field !== undefined // 直接检查值
typeof this.field !== 'undefined' // 类型检查
```

## 总结

说到底，这个问题就是 TypeScript 跑得太快了，在标准还没定下来的时候就实现了类字段，结果后来标准定的行为和它不一样。

简单来说就是：未赋值的类字段，在旧实现里不会出现在实例上，但在现代规范里会被初始化为 `undefined`。这就导致用 `in` 操作符检查的时候，不同配置下结果可能完全相反。

所以最好的做法是：把 `target` 设成 `ES2022` 或更高（这样 `useDefineForClassFields` 会自动开启），然后别用 `in` 或 `Reflect.has` 来检查类字段了，直接用 `!== undefined` 判断值就行。这样不管在哪个环境跑，逻辑都是一致的。

## 参考资料

- [TypeScript useDefineForClassFields 配置文档](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields)
- [TC39 类字段提案](https://github.com/tc39/proposal-class-fields)
- [ECMAScript 规范](https://tc39.es/ecma262/)
- [MDN - in 操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/in)
- [MDN - Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [MDN - Reflect.has](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/has)
