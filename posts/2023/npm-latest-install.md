---
title: '频繁发布 npm 包时如何确保始终安装最新版本'
date: 2023-03-26
topic: '前端'
excerpt: '前端依赖更新小妙招'
tags:
  - 'npm'
  - 'Node.js'
  - 'package.json'
  - 'DevOps'
  - '包管理'
---

## 问题背景

在一些极端情况下可能需要频繁发布 npm 包，而 npm 默认的缓存时间是 5 分钟。也就是说，在五分钟之内只会请求一次 npm 包的元数据，如果在更新后五分钟之内再次发包，默认情况下是不会检测到新版本的。

这个时候，如果你搭配 `ncu`（npm-check-updates 包）更新了 `package.json` 里的包到最新版本的话，由于 npm 的缓存，执行 `npm i` 会显示找不到目标 npm 包的指定版本从而更新失败。

## 解决方案

有两种方式可以解决这个问题：

### 1. 使用 `--prefer-online` 标志

在执行 `npm install` 或 `npm update` 时添加 `--prefer-online` 标志，设置优先从远程 registry 获取：

```bash
npm install --prefer-online xxx
```

### 2. 配置 `.npmrc` 文件

如果希望在项目范围内都使用这个设置，可以在项目根目录下的 `.npmrc` 文件中添加以下配置：

```ini
prefer-online=true
```

这样就不需要每次都手动添加 `--prefer-online` 标志了。

## 相关选项

- `--prefer-offline`：优先使用缓存，减少网络请求
- `--cache-max=0`：这个选项其实是 `--prefer-online` 的别名

## 参考资料

更多有关 npm config 的信息请参考 [npm 官方文档](https://docs.npmjs.com/cli/v9/using-npm/config#prefer-online)。
