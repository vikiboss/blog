---
title: "Node.js 报错 Cannot find module 'fs/promises'"
date: 2022-02-15
topic: '笔记'
excerpt: '说白了就是版本的问题，可见统一版本对代码持续运行是多么重要'
tags:
  - 'Node.js'
  - '错误处理'
  - '文件系统'
  - '版本控制'
  - '后端'
---

## 问题产生原因

如果你遇到了这个报错，很有可能是 Node.js 版本太低导致的。

在 Node.js 的不同版本中，`fs/promises` 模块的引用方式有所不同：

**Node.js 13 及以下版本**支持的引用方式：

```js
const fs = require('fs').promises
// 或者
const { promises: fs } = require('fs')
```

**Node.js 14 及以上版本**新增支持的引用方式：

```js
const fs = require('fs/promises')
```

简单来说，`fs/promises` 作为独立模块引入是从 Node.js 14.0.0 版本开始的新特性。如果你的 Node.js 版本低于 14，就会报这个错误。

## 如何检查 Node.js 版本

在终端运行以下命令查看当前 Node.js 版本：

```bash
node -v
```

如果输出类似 `v12.x.x` 或 `v13.x.x`，那就说明版本确实太低了。

## 解决方案

### 方案一：升级 Node.js 版本（推荐）

将 Node.js 升级到 14 或更高版本，就可以直接使用 `require('fs/promises')` 了。

**升级方法：**

- **Windows/macOS：** 访问 [Node.js 官网](https://nodejs.org/)下载最新的 LTS 版本
- **使用 nvm（推荐）：** 如果你安装了 nvm，可以直接运行：
  ```bash
  nvm install --lts
  nvm use --lts
  ```

**注意：** Windows 7 及以下系统不支持 Node.js 14 及更高版本，如果你还在用老系统的话，请参考方案二。

### 方案二：修改引用方式

如果暂时无法升级 Node.js 版本，可以将代码中所有 `fs/promises` 的引用方式改为兼容老版本的写法：

```js
// 将这行
const fs = require('fs/promises')

// 改为这两种写法之一
const fs = require('fs').promises
// 或者
const { promises: fs } = require('fs')
```

这样修改后，代码就能在 Node.js 13 及以下版本正常运行了。

## 实际使用示例

两种引用方式在使用上完全一致，只是引入方式不同：

```js
// 使用 fs/promises（Node.js 14+）
const fs = require('fs/promises')

async function readFile() {
  const content = await fs.readFile('example.txt', 'utf-8')
  console.log(content)
}

// 使用 fs.promises（兼容老版本）
const fs = require('fs').promises

async function readFile() {
  const content = await fs.readFile('example.txt', 'utf-8')
  console.log(content)
}
```

两种方式的功能完全相同，选择哪种取决于你的 Node.js 版本。

## 小贴士

如果你在维护一个需要兼容多个 Node.js 版本的项目，建议：

1. 在 `package.json` 中明确指定 Node.js 版本要求：

   ```json
   {
     "engines": {
       "node": ">=14.0.0"
     }
   }
   ```

2. 或者使用兼容老版本的写法 `require('fs').promises`，这样可以支持更广泛的 Node.js 版本。
