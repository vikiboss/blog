---
title: 'NCUHOME 研发组前端培训之 DOM 操作 & AJAX'
date: 2020-10-30
topic: '前端'
excerpt: '面向新生的前端基础培训文档，涵盖现代化的 DOM 操作和 AJAX 技术。'
tags:
  - 'JavaScript'
  - 'DOM'
  - 'AJAX'
  - '前端'
  - '教程'
---

> 主讲人：19 级前端 Viki
> 时间：2020 年 10 月 30 日

这是为 NCUHOME 研发组新生准备的前端培训文档，主要讲解 DOM 操作和 AJAX 请求的基础知识。内容参考了 MDN 文档、《JavaScript 高级程序设计（第四版）》以及相关技术文章。

## 预习资料

- [DOM 概述 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction)
- [JSON 格式 - MDN](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Objects/JSON)
- [AJAX 基础 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/Guide/AJAX/Getting_Started)
- [XMLHttpRequest - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest)

> 学有余力可以进一步学习：[Fetch API - MDN](https://wiki.developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) / [Axios - GitHub](https://github.com/axios/axios#axios-api)

## 从浏览器讲起

### 主流浏览器

![主流浏览器](https://i.loli.net/2020/10/24/erY2Oj4Z3TuIKBn.png)

### 浏览器的高层结构

![浏览器的高层结构](https://i.loli.net/2020/10/24/6JRTvKeBXtIVlf1.png)

### 浏览器解析过程

![浏览器解析过程](https://i.loli.net/2020/10/24/NC3J5efFZK6zL4A.png)

## DOM

### 什么是 DOM

JavaScript 包含以下三个组成部分：

- **ECMAScript**：由 ECMA-262 定义，是 JavaScript 语言的核心功能
- **文档对象模型（DOM）**：提供了与网页内容交互的方法和接口
- **浏览器对象模型（BOM）**：提供了与浏览器交互的方法和接口

![JavaScript 三部分](https://i.loli.net/2020/10/24/KWgnQoNPLfY47wD.png)

DOM（Document Object Model）即文档对象模型，它是 HTML 和 XML 文档的**应用编程接口**（API，Application Programming Interface）。

DOM 将文档表示为由多层节点构成的树状结构，通过它可以**对页面的各个部分进行添加、删除和修改等操作**。

### DOM 相关概念

#### 元素

元素指的是 document 文档中所有的 HTML 标签，如下图中的 `Element Node`。

#### 节点

- 节点包括**元素节点**、**文本节点**、**注释节点**等
- 最常用的是**元素节点**和**文本节点**

![DOM 树](https://i.loli.net/2020/10/24/aN8nQcjfqGEmBRh.png)

### 操作 DOM 节点

#### 获取 HTML 元素

获取元素有很多种方式，比如：通过 id、标签名、CSS 类等。

![获取 HTML 元素](https://i.loli.net/2020/10/25/LTDoxI4blaQgsiB.png)

```javascript
// 创建一个元素
var awesomeDiv = document.createElement('div')

// 获取元素的不同方法
var element = document.getElementById('box') // 通过 ID 获取
var elements = document.getElementsByClassName('red blue') // 通过类名获取
var elements = document.getElementsByName('card') // 通过 name 属性获取
var elements = document.getElementsByTagName('div') // 通过标签名获取
var element = document.querySelector('div > #card') // 通过 CSS 选择器获取单个元素
var elements = document.querySelectorAll('.btn') // 通过 CSS 选择器获取所有匹配元素
```

> `getElementsBy*` 系列方法返回的是 HTMLCollection，`querySelectorAll` 返回的是 NodeList。更多信息参考：[HTMLCollection - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCollection)

### 操作 HTML 元素

![操作 HTML 元素](https://i.loli.net/2020/10/25/TujseZtBrmz7Jqw.png)

#### 改变 HTML 元素样式

```javascript
// 首先获取要改变样式的元素
let awesomeDiv = document.getElementById('app')

// 操作 CSS 类
awesomeDiv.classList // 查看元素的所有类
awesomeDiv.classList.add('round') // 添加类名
awesomeDiv.classList.remove('blue') // 移除类名
awesomeDiv.classList.toggle('active') // 切换类名
awesomeDiv.className // 直接获取/设置 class 属性

// 直接修改样式
awesomeDiv.style.backgroundColor = '#ffd9ce'
awesomeDiv.style.border = '1px solid #3af'
```

> JavaScript 的标识符不允许使用 `-`，所以在 JavaScript 中操作 CSS 样式时，需要使用小驼峰命名。例如：CSS 中的 `font-size` 对应 JavaScript 中的 `fontSize`。

#### 添加、改变 HTML 元素

```javascript
// 操作元素的文本和 HTML 内容
document.body.innerText = '这是 body 的纯文本内容'
document.body.innerHTML = '<h1>这是 body 的 <b>HTML 内容</b></h1>'

// 读取元素的外部 HTML（包括元素本身）
console.log(document.body.outerHTML)

// 替换整个元素（包括元素本身）
document.body.children[0].outerHTML = '<h2>NCUHOME</h2>'
```

> **注意**：直接操作 `innerHTML` 可能存在 XSS 安全风险，使用时需要确保内容来源可信。

#### 给 HTML 元素添加事件监听

```javascript
function showMsg() {
  alert('Hello, NCUHomer!')
}

// 方式 1：直接赋值（会覆盖之前的监听器）
document.getElementById('app').onclick = showMsg

// 方式 2：使用 addEventListener（推荐，可以添加多个监听器）
document.getElementById('btn').addEventListener('click', showMsg)

// 移除事件监听
document.getElementById('btn').removeEventListener('click', showMsg)
```

## AJAX

### 什么是 AJAX

AJAX 是 Asynchronous JavaScript And XML（异步 JavaScript 和 XML）的缩写。简单来说，就是使用 `XMLHttpRequest` 对象与服务器通信。使用 AJAX 可以**在不重新刷新页面的情况下与服务器通信、交换数据并更新页面内容**。

![AJAX](https://i.loli.net/2020/10/25/qwxPorAWZMXa6cV.png)

### 为什么需要 AJAX

#### 没有 AJAX 的时代

除了 `<img>` 标签加载图片等少数场景外，所有数据请求（获取新信息、访问新页面等）都需要**重新加载整个页面**，用户体验较差。

#### 有 AJAX 的时代

通过 JavaScript 使用 `XMLHttpRequest` 对象向服务器发起请求并获取数据，**不需要刷新页面就可以异步更新页面内容**，极大提升了用户体验和交互效率。典型的应用案例：Gmail 和 Google Maps。

### JSON 格式

JSON（JavaScript Object Notation）是目前最常用的**数据交换格式**。虽然它基于 JavaScript 语法，但它是独立于语言的，几乎所有编程语言都支持 JSON。

#### 示例

```json
{
  "name": "Bob",
  "age": 19,
  "friends": ["Amy", "Lucy"]
}
```

#### 处理 JSON 数据

JavaScript 提供了内置的方法来处理 JSON 数据：

```javascript
// JSON 字符串转 JavaScript 对象
let str = '{"name":"ncuhomer"}'
let obj = JSON.parse(str)
console.log(obj.name) // 输出: ncuhomer

// JavaScript 对象转 JSON 字符串
let str2 = JSON.stringify(obj)
console.log(str2) // 输出: {"name": "ncuhomer"}
```

### 原生 XMLHttpRequest 的基本使用

#### HTTP 请求方法

- **GET**：获取资源
- **POST**：提交数据，通常用于新增或修改服务器资源

> 其他常见方法还有：`PUT`（更新资源）、`DELETE`（删除资源）、`HEAD`（获取响应头）、`OPTIONS`（查询支持的方法）等

![XMLHttpRequest 的基本使用](https://i.loli.net/2020/10/25/EHpbyO2Q5nq6Y8j.png)

#### 使用步骤

**1. 创建 XMLHttpRequest 实例对象**

```javascript
var xhr = new XMLHttpRequest()
```

**2. 配置请求参数**

```javascript
// 参数：请求方法、请求地址
xhr.open('GET', 'https://api.example.com/data')
```

**3. 监听请求状态变化**

```javascript
xhr.onreadystatechange = function () {
  // readyState === 4 表示请求完成
  // status === 200 表示请求成功
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responseText) // 打印响应内容
  }
}
```

**4. 发送请求**

```javascript
xhr.send() // GET 请求直接发送
// xhr.send(data) // POST 请求需要传入数据
```

#### 完整示例

```javascript
var xhr = new XMLHttpRequest()
xhr.open('GET', 'https://v1.hitokoto.cn/?encode=json')
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    let data = JSON.parse(xhr.responseText)
    console.log(data)
  }
}
xhr.send()
```

> 更多信息参考：[使用 XMLHttpRequest - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest)

### Fetch 与 Axios

**Fetch** 是现代浏览器提供的原生 API，提供了更简洁的方式来发起 HTTP 请求。它基于 Promise，使用起来比原生 `XMLHttpRequest` 更加优雅。目前已被除 IE 外的所有主流浏览器支持。

**Axios** 是一个基于 Promise 的第三方 HTTP 库，来自开源社区。它在浏览器端的底层实现是 `XMLHttpRequest`，在 Node.js 端使用的是原生 `http` 模块。Axios 提供了更丰富的功能（如请求/响应拦截器、自动转换 JSON 数据等），在实际开发中使用非常广泛。

### 关于 ES6

![JavaScript 三部分](https://i.loli.net/2020/10/24/KWgnQoNPLfY47wD.png)

#### 什么是 ES

ES 指的是 ECMAScript，是 JavaScript 语言的核心规范。

ES6（又称 ECMAScript 2015）是 ES5 的下一个版本，于 2015 年发布。ES6 引入了大量新特性，极大地丰富了 JavaScript 的语法生态，让 JavaScript 的使用更加便捷和现代化。

#### ES5 的局限性

- 使用 `var` 定义变量存在变量提升问题，且允许重复声明
- 变量作用域仅支持函数作用域，缺少块级作用域
- 字符串处理能力有限
- 异步编程相对繁琐，只能通过回调函数、事件监听或手动实现 Promise
- 缺少语法糖，代码表达不够简洁

> **语法糖**：指计算机语言中添加的某种语法，这种语法对语言的功能没有影响，但能让代码更易读、更方便编写，从而减少出错机会。

#### ES6 的主要特性

![ES6](https://i.loli.net/2020/10/25/vJ7ScsbECOi1R5d.png)

- **原生支持 Promise**：简化了异步编程的复杂度
- **新增 let 和 const 关键字**：支持块级作用域，不存在变量提升，不允许重复声明，让代码更加严谨
- **箭头函数**：让 `this` 绑定到定义时所在的作用域（而非运行时），同时语法更加简洁
- **class 关键字**：提供了更直观的面向对象编程语法
- **实用的语法糖**：
  - 模板字符串（`` `Hello ${name}` ``）
  - 解构赋值（`const { a, b } = obj`）
  - 展开运算符（`...`）
  - 等等

## 课后学习资料

### 学习 JavaScript

- [现代 JavaScript 教程](https://zh.javascript.info/)
- 《JavaScript 高级程序设计（第四版）》（红宝书）

> 电子版可以在研发 QQ 群文件中找到

### 推荐学习

- [使用 Fetch - MDN](https://wiki.developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
- [Axios - GitHub](https://github.com/axios/axios)
- [Promise - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### 推荐阅读

- [浏览器的工作原理：新式网络浏览器幕后揭秘](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/)
- [JavaScript 语言的历史 - 阮一峰](https://javascript.ruanyifeng.com/introduction/history.html)

## 本周任务

### 学习任务

本周主要学习 HTTP、DOM 操作和 AJAX，同时了解 ES6 的新特性。

#### 必学内容

- [XMLHttpRequest](https://zh.javascript.info/xmlhttprequest)
- [HTTP 基础 - 菜鸟教程](https://www.runoob.com/http/http-tutorial.html)
- [Fetch](https://zh.javascript.info/fetch)
- [ES6 基础教程](https://www.runoob.com/w3cnote/es6-tutorial.html)
- [现代 JavaScript 教程](https://zh.javascript.info/)

#### 建议深入了解

- [var、let、const 的区别](https://zh.javascript.info/variables)
- [箭头函数基础](https://zh.javascript.info/arrow-functions-basics) / [深入理解箭头函数](https://zh.javascript.info/arrow-functions)
- [Promise](https://zh.javascript.info/promise-basics)
- [Axios](https://github.com/axios/axios)
- [async/await](https://zh.javascript.info/async-await)

#### 推荐阅读

- [浏览器的工作原理：新式网络浏览器幕后揭秘](https://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/)
- [JavaScript 语言的历史 - 阮一峰](https://javascript.ruanyifeng.com/introduction/history.html)

### 本周作业

#### 作业内容

使用原生 `XMLHttpRequest` 编写一个简单的网页，要求实现以下功能：

1. 页面包含两个按钮和一行文字
2. 点击第一个按钮后，通过 `XMLHttpRequest` 向 `https://v1.hitokoto.cn/?encode=text` 发起 `GET` 请求，并使用 DOM 操作将返回的内容显示在页面上
3. 点击第二个按钮后，改变文字的样式

在完成基本功能的前提下，可以自由发挥（如：调整布局、美化页面、添加更多信息等）。

#### 效果参考

![最终效果参考](https://i.loli.net/2020/10/24/hvmPr8eSEa4Di6V.gif)

#### 提交方式

将源代码通过 Git 推送到 `Homework-Y20M11W1` 仓库的新分支上，并提交 Pull Request。

#### 截止时间

**2020 年 11 月 4 日晚 22:00**
