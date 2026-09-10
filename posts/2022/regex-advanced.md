---
title: 'JavaScript 正则的高级用法'
date: 2022-12-26
topic: '笔记'
excerpt: '一份 JavaScript 正则笔记。'
tags:
  - 'JavaScript'
  - '正则'
  - '前端'
  - '教程'
  - '高级'
---

正则表达式是前端开发中处理字符串的利器，但很多高级特性常常被忽略。本文整理了一些 JavaScript 正则表达式的进阶用法，配合实例帮助你更好地理解和应用。

## 1. 惰性匹配

默认情况下，正则表达式是**贪婪匹配**的，会尽可能多地匹配字符。在量词后加 `?` 可以开启**惰性匹配**，尽可能少地匹配字符。

### 常见量词的惰性形式

- `+?`：匹配 1 次或多次（惰性）
- `*?`：匹配 0 次或多次（惰性）
- `??`：匹配 0 次或 1 次（惰性）
- `{n,m}?`：匹配 n 到 m 次（惰性）

### 实例对比

```js
// + 和 +? 的区别
'Hiii'.replace(/Hi+?/, 'x') // xii（只匹配 Hi）
'Hiii'.replace(/Hi+/, 'x') // x（匹配 Hiii）

// .* 和 .*? 的区别
'Hellollo'.replace(/H.*?llo/, 'x') // xllo（匹配 Hello）
'Hellollo'.replace(/H.*llo/, 'x') // x（匹配 Hellollo）

// {n,m} 和 {n,m}? 的区别
'yoooooo'.replace(/yo{2,6}?/, 'x') // xoooo（匹配 yoo）
'yoooooo'.replace(/yo{2,6}/, 'x') // x（匹配 yoooooo）
```

**记忆技巧**：贪婪匹配像"贪吃蛇"，能吃多少吃多少；惰性匹配像"佛系青年"，够用就行。

## 2. 单词边界

`\b` 表示单词边界，用于匹配单词的开始或结束位置。单词边界是指：

- 字母、数字、下划线 与 其他字符之间
- 字符串开头或结尾 与 字母、数字、下划线之间

### 实例

```js
// 匹配第一个单词
'How are you?'.replace(/\b.+?\b/, 'x') // x are you?

// 精确匹配单词（避免部分匹配）
'hello world'.replace(/\bhello\b/, 'hi') // hi world
'hello world'.replace(/hello/, 'hi') // hi world（效果相同）

// 单词边界的实用场景：避免误匹配
'category'.replace(/cat/, 'dog') // dogegory（错误）
'category'.replace(/\bcat\b/, 'dog') // category（正确，没有匹配）
```

## 3. 捕获组与反向引用

### 捕获组语法

- **普通捕获组**：`(xxx)`
- **反向引用**：`\n`（n 为组号，从 1 开始）

### 实例

```js
// 捕获并引用
'How are you?'.replace(/(how)/i, '$1 old') // How old are you?

// 多个捕获组
'1#2#3'.replace(/^(\d)#(\d)#(\d)$/, '$1 $2 $3') // 1 2 3

// 反向引用：检测重复模式
'111#111#111'.replace(/^(\d+)#\1#\1$/, '$1') // 111
'123#111#111'.replace(/^(\d+)#\1#\1$/, '$1') // 123#111#111（不匹配）
```

**使用场景**：验证密码强度、提取重复内容、格式化字符串等。

## 4. 命名捕获组

ES2018 引入了命名捕获组，让正则表达式更具可读性。

### 语法

- **命名捕获组**：`(?<name>xxx)`
- **反向引用**：`\k<name>`
- **替换引用**：`$<name>`

### 实例

```js
// 基础用法
'111#111'.replace(/^(?<num>\d+)#\k<num>$/, '$<num>') // 111

// 命名捕获组的可读性优势
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
const match = '2022-12-26'.match(dateRegex)
console.log(match.groups.year) // 2022
console.log(match.groups.month) // 12
console.log(match.groups.day) // 26

// 交换日期格式
'2022-12-26'.replace(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/, '$<day>/$<month>/$<year>') // 26/12/2022
```

## 5. 位置断言（零宽断言）

位置断言用于匹配某个位置，而不消耗字符。分为四种：

### 断言类型

| 类型         | 语法      | 说明          |
| ------------ | --------- | ------------- |
| 正向先行断言 | `(?=xx)`  | 后面必须是 xx |
| 反向先行断言 | `(?!xx)`  | 后面不能是 xx |
| 正向后行断言 | `(?<=xx)` | 前面必须是 xx |
| 反向后行断言 | `(?<!xx)` | 前面不能是 xx |

### 实例

```js
// 正向先行断言：密码必须包含数字
const hasNumber = /^(?=.*\d).+$/
hasNumber.test('abc123') // true
hasNumber.test('abcdef') // false

// 反向先行断言：提取不以数字结尾的单词
'hello123 world'.match(/\b\w+(?!\d)\b/g) // ['world']

// 正向后行断言：价格格式化（添加千分位）
'1234567'.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // 1,234,567

// 反向后行断言：匹配不在 $ 符号后的数字
'$100 and 200'.match(/(?<!\$)\d+/g) // ['00', '200']
```

**记忆技巧**：

- 先行（Lookahead）= 向前看 = 后面
- 后行（Lookbehind）= 向后看 = 前面
- 正向 = 必须匹配，反向 = 不能匹配

## 6. 修饰符

除了常用的 `g`（全局匹配）和 `i`（忽略大小写），还有以下修饰符：

### 常用修饰符

| 修饰符 | 全称      | 说明                                       |
| ------ | --------- | ------------------------------------------ |
| `m`    | multiline | 多行模式，`^` 和 `$` 匹配每行的开头和结尾  |
| `u`    | unicode   | Unicode 模式，正确处理大于 `\uFFFF` 的字符 |
| `y`    | sticky    | 粘连模式，从 `lastIndex` 位置开始匹配      |
| `s`    | dotAll    | `.` 可以匹配任意字符（包括换行符）         |

### 实例

```js
// m 修饰符：多行匹配
const multiline = `line1
line2
line3`
multiline.match(/^line\d$/g) // null（没有 m 修饰符）
multiline.match(/^line\d$/gm) // ['line1', 'line2', 'line3']

// u 修饰符：正确处理 Unicode
'𠮷'.match(/^.$/u) // ['𠮷']（正确匹配）
'𠮷'.match(/^.$/) // null（无法匹配）

// y 修饰符：粘连匹配
const regex = /\d+/y
regex.lastIndex = 2
'12 34 56'.match(regex) // null（从位置 2 开始不是数字）
```

## 7. replace 第二个参数的高级用法

`String.prototype.replace()` 的第二个参数不仅可以是字符串，还可以使用特殊符号或函数。

### 字符串中的特殊符号

| 符号            | 说明                        |
| --------------- | --------------------------- |
| `$n`            | 第 n 个捕获组（1 ≤ n ≤ 99） |
| `$&`            | 匹配到的子串                |
| <code>$`</code> | 匹配子串左边的文本          |
| `$'`            | 匹配子串右边的文本          |
| `$$`            | 美元符号字面量              |
| `$<name>`       | 命名捕获组的值              |

### 实例

```js
// $& - 匹配的内容
'hello'.replace(/ll/, '[$&]') // he[ll]o

// $` 和 $' - 左右两侧的内容
'hello'.replace(/ll/, '[$`]') // he[he]o
'hello'.replace(/ll/, "[$']") // he[o]o

// $$ - 美元符号
'100'.replace(/\d+/, '$$$&') // $100
```

### 函数作为第二个参数

函数参数顺序：

1. `match`：匹配的子串
2. `p1, p2, ...`：第 1 到第 n 个捕获组
3. `offset`：匹配子串在原字符串中的位置
4. `string`：原字符串
5. `groups`：命名捕获组对象

### 实例

```js
// 基础用法：转为大写
'hello world'.replace(/\b\w+\b/g, (match) => match.toUpperCase()) // HELLO WORLD

// 使用捕获组参数
'2022-12-26'.replace(/(\d{4})-(\d{2})-(\d{2})/, (match, year, month, day) => {
  return `${day}/${month}/${year}`
}) // 26/12/2022

// 使用完整参数
'hello'.replace(/l+/g, (match, offset, string) => {
  return `[${match} at ${offset} in "${string}"]`
}) // he[ll at 2 in "hello"]o

// 命名捕获组参数
'100USD'.replace(/(?<amount>\d+)(?<currency>[A-Z]+)/, (match, p1, p2, offset, string, groups) => {
  return `${groups.currency} ${groups.amount}`
}) // USD 100
```

## 总结

正则表达式的高级特性能大大提升字符串处理的效率和代码可读性：

- **惰性匹配**：控制匹配的贪婪程度
- **单词边界**：精确匹配完整单词
- **捕获组**：提取和复用匹配内容
- **命名捕获组**：提升正则可读性
- **位置断言**：无消耗地检查前后文
- **修饰符**：改变匹配行为
- **replace 函数**：灵活处理替换逻辑

掌握这些技巧，就能写出更简洁、高效的正则表达式代码。

## 参考

- [String.prototype.replace() - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)
- [对正则表达式，这么多年你还在害怕吗？ - 前端新世界](https://mp.weixin.qq.com/s?__biz=MzAwNjI1MzI3OQ==&mid=2649003502&idx=1&sn=7195108bf00c319436818f1727c23d22)
- [正则表达式完整使用指南 - 前端新世界](https://mp.weixin.qq.com/s?__biz=MzAwNjI1MzI3OQ==&mid=2649001386&idx=1&sn=07f820152869a53955298f8624caecf1)
