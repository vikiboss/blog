---
title: 'Scoop —— 实用的 Windows "包管理"软件'
date: 2020-09-20
topic: '技术'
top_image: 'https://i.loli.net/2020/11/21/BZunq4vrKAHIj7P.png'
excerpt: 'Windows 平台优秀的命令行包管理工具 Scoop 使用指南。告别繁琐的软件安装流程，通过简单的命令实现软件的搜索、安装、更新与版本管理。'
archived: true
tags:
  - 'Windows'
  - 'Scoop'
  - 'CLI'
  - '命令行'
  - '包管理'
---

## 前言

我们都知道 Linux 有包管理的概念，即：可以在命令行下通过一系列指令来统一管理程序，常见的使用场景包括：搜索、安装、更新、卸载等。macOS 也有类似的包管理器，如 Homebrew。借助包管理器，我们可以达到统一管理常用软件的目的。

### Windows 平台的痛点

Windows 目前的软件生态想必大家都很清楚，各种常用软件，比如 Git、Chrome、VS Code、7-Zip、网易云音乐等，安装方式五花八门，位置杂乱无章。安装、更新、卸载流程繁琐耗时且效率低下，安装路径各异污染目录，且得不到统一的管理。

## 它来了 —— Scoop

Scoop 的出现，就是为了解决上述问题的。简单来说，它将各种软件安装目录有序地堆放在一起，用户数据以及配置文件单独存放，更新时仅更新程序本身，极大地提高了 Windows 平台上管理软件的效率。

## 如何安装 Scoop

### 前置要求

请确保已经安装了：

- PowerShell 5 或更高版本（包括 PowerShell Core）
- .NET Framework 4.5 或更高版本

> 现在大部分机器都装了 Windows 10，系统基本符合要求，可以直接进行下面的操作。

### 安装步骤

在 PowerShell 终端中运行下列命令：

```powershell
# 运行这条命令
Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')

# 或者这条更短的命令
iwr -useb get.scoop.sh | iex
```

安装完成后，在终端中输入 `scoop` 命令查看是否安装成功。

### 可能遇到的问题

如果遇到权限错误，需要修改 PowerShell 执行策略，运行下列命令：

```powershell
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
```

## Scoop 使用指南

### 添加软件源（Bucket）

Bucket 可以简单理解为软件清单。只有当前添加的 Bucket 里有的软件才可以下载。通过下面的命令添加常用的 Bucket 来扩大可安装的软件类别和数量。

```bash
# 官方维护的扩展源（推荐）
scoop bucket add extras

# 社区维护的源
scoop bucket add dorado https://github.com/chawyehsu/dorado
scoop bucket add sushi https://github.com/kidonng/sushi
```

### 搜索软件

这条命令会在已经添加的 Bucket 里搜索合适的软件并打印出来：

```bash
scoop search neteasemusic  # 搜索网易云音乐
```

### 安装软件

```bash
scoop install <软件名>
```

以下列出了常用程序的安装命令：

> **注意**：必须先安装 7zip，后续安装包的解压都依靠它。

```bash
# 推荐安装的常用程序（需先添加 extras 源）
scoop install 7zip git googlechrome vscode nodejs yarn postman everything sharex quicklook telegram

# 个人使用的软件清单（需先添加 extras、dorado 和 nonportable 源）
scoop install 7zip git googlechrome vscode yarn v2rayn sharex nodejs quicklook dismplusplus postman telegram oh-my-posh pscolor posh-git mactype-np neteasemusic everything mysql adb sudo nginx
```

### 卸载软件

```bash
scoop uninstall <软件名>
```

### 更新软件

```bash
# 更新指定软件
scoop update <软件名>

# 更新所有软件（推荐）
scoop update *
```

### 清理缓存

清理下载的安装包等临时文件：

```bash
scoop cache rm *
```

### 清理旧版本

更新程序后，旧版本的程序默认会保留，可以手动清理：

```bash
scoop cleanup *
```

### 切换版本

当需要同时使用软件的多个版本时，可以使用 `reset` 命令在不同版本之间切换。以 Node.js 为例：

首先安装所需的版本：

```bash
scoop install nodejs12
scoop install nodejs
```

此时默认使用的是最新版本。通过 `reset` 命令可以切换到指定版本：

```bash
# 切换为 Node.js 12 版本
scoop reset nodejs12

# 切换回最新版本
scoop reset nodejs
```

### 锁定软件版本

有时候我们不希望某个软件自动更新，可以使用 `hold` 命令锁定版本：

```bash
# 锁定 Postman 版本，阻止更新
scoop hold postman

# 解除版本锁定
scoop unhold postman
```

执行 `scoop update *` 时，被锁定的软件会跳过更新。

## 总结

Scoop 为 Windows 用户带来了类似 Linux 和 macOS 的包管理体验，让软件管理变得简单高效。通过统一的命令行界面，我们可以轻松完成软件的搜索、安装、更新和卸载，大大提升开发效率。
