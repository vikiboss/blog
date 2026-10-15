---
title: 'Node.js 项目的 package.json 文件详解'
date: 2020-04-23
topic: '技术'
top_image: 'https://i.loli.net/2020/11/21/UHTc1bZPxszuQYa.png'
excerpt: '深入解析 Node.js 项目中的 package.json 文件。详细介绍常见字段的含义与作用、版本号管理规则等。'
archived: true
tags:
  - 'Node.js'
  - 'npm'
  - 'package.json'
  - 'JavaScript'
  - '配置'
---

此篇文章适合于对 Node.js 和 npm 有一定了解，但不清楚 `package.json` 文件具体作用及其含义的读者。

## package.json 文件是什么？

Node.js 项目遵循**模块化**架构，`package.json` 文件是用来**描述项目的相关信息**，便于 `npm`、`yarn` 等包管理工具对项目进行操作。简单来理解，就是每个项目都可以被叫做「包」，`package.json` 则是用来描述包信息的一个文件，一般存在于项目的根目录下。

## 直接上个实例

`package.json` 文件本身是 `JSON` 文件，当然也遵循 `JSON` 的语法。

```json
{
  "name": "demo",
  "version": "1.1.0",
  "author": "Viki",
  "description": "source code repo",
  "main": "main.js",
  "license": "MIT",
  "scripts": {
    "start": "react-native run-android"
  },
  "dependencies": {
    "react": "^16.13.1"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:vikiboss/blog.git"
  },
  "devDependencies": {
    "@babel/core": "~7.0.0"
  }
}
```

### 常见字段说明

- **`name`**：包名，必须，字母小写，无空格，下划线、横线可选
- **`version`**：版本号，必须
- **`author`**：作者信息
- **`description`**：包描述
- **`main`**：入口文件
- **`license`**：遵循的协议
- **`scripts`**：自定义脚本
- **`dependencies`**：生产依赖（项目正式上线时所依赖的包）
- **`repository`**：项目仓库信息
- **`devDependencies`**：开发依赖（开发和测试环境中依赖的包）

以上是常见的描述信息，还可以根据需要添加其他自定义的描述信息。

## 它有什么用？

它**配置和描述了该如何与项目进行交互、运行**。包管理器（`npm`、`yarn` 等）也可以通过它来**识别项目并分析出如何处理项目的依赖关系**。当你执行 `npm install` 或者 `yarn` 来安装依赖的时候，就是通过这个文件来识别。此外，如果你的项目需要发布到 `npm` 的 registry 上供别人使用，也需要通过这个文件来**提供项目的信息**。

### package-lock.json 的作用

在 npm 5.x 及以上版本中，还会生成一个 `package-lock.json` 文件，它用来**锁定依赖包的确切版本**。

`package.json` 文件中的版本号（如 `^1.2.2`）只能锁定大版本，每次 `npm install` 拉取的是该范围内的最新版本。为了确保项目依赖的稳定性，`package-lock.json` 会记录每个依赖包的**确切版本号**，这样可以保证团队成员和生产环境安装的依赖版本完全一致。

## 自定义字段

`package.json` 文件中的字段不是固定的。如果你要发布包到 npm，那就只有 `name` 和 `version` 是必须的，其他可选，且**可以根据需要自定义添加**。

如果不需要发布，则任何字段都是可选的，且建议将 `private` 字段设置为 `true` 并移除 `main` 入口，这样可以防止代码意外发布。

```json
{
  "private": true
}
```

> 例如：博客项目可能还需要 `"title": "Viki's Blog"` 类似的字段。

**其他常见字段参考**：`keywords`、`contributors`、`homepage`、`preferGlobal`、`style`、`bin`、`bugs`、`config`、`browser`、`engines`、`man`、`peerDependencies`

## 脚本（scripts）字段

这个字段约定了什么时候用 `npm start`、`npm run dev` 应该执行什么，或者说它告诉了程序员 `npm start` 运行的是什么命令。使用的时候可根据需要在此自定义。

例如：若一个项目的 `package.json` 如下：

```json
{
  "name": "demo",
  "version": "1.0.0",
  "scripts": {
    "start": "cd app && react-native run-android"
  }
}
```

则在项目路径下运行 `npm run start` 或者 `yarn start` 时，等效于先执行 `cd app` 进入 `app` 目录，然后执行 `react-native run-android`。

## 版本描述方式

常见的版本描述方式有以下几种：

| 版本格式 | 说明                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `1.2.2`  | 具体的版本，遵循「**大版本.次要版本.小版本**」的格式规定，安装时只安装指定版本                                                                                      |
| `~1.2.2` | 表示安装 `1.2.x` 的最新版本（不低于 `1.2.2`），但是不安装 `1.3.x`，也就是说安装时不改变大版本号和次要版本号                                                         |
| `^1.2.2` | 表示安装 `1.x.x` 的最新版本（不低于 `1.2.2`），但是不安装 `2.x.x`，也就是说安装时不改变大版本号。注意：如果大版本号为 `0`，则 `^` 的行为与 `~` 相同（处于开发阶段） |
| `latest` | 安装最新版本                                                                                                                                                        |

## 如何生成？

### 手动创建

新建一个文本文件并修改文件名和后缀名为 `package.json`。

### 自动生成

通过 `npm init` 命令生成，前提是已经配置好了 `npm` 的环境。执行命令后，按照提示填写项目信息即可。

```bash
# 交互式创建
npm init

# 快速创建（使用默认值）
npm init -y
```
