---
title: '关于 CentOS 7 中 yum 命令失效问题的解决方案'
date: 2020-01-12
top_image: 'https://i.loli.net/2020/11/21/o7sYJZVIuqMRpT3.jpg'
topic: '笔记'
excerpt: '解决 CentOS 7 系统中 yum 命令失效的常见问题，提供启用网卡自启动及修改镜像源的完整解决方案。'
tags:
  - 'Linux'
  - 'CentOS'
  - 'Yum'
  - '网络'
  - '解决方案'
---

刚在虚拟机中安装完 CentOS 7 系统后，可能会遇到**无法使用 yum 命令**的问题。本文提供两种解决方案。

## 问题原因

最常见的原因是**网卡未启动**。CentOS 7 默认情况下网卡不会自动启动，导致无法连接网络，进而无法使用 yum 命令。

## 解决方案一：启用网卡自启动

### 操作步骤

**1. 进入网卡配置目录**

```bash
cd /etc/sysconfig/network-scripts
```

**2. 编辑网卡配置文件**

```bash
vi ifcfg-ens33
```

> 网卡名称可能是 `ifcfg-ens33`、`ifcfg-eth0` 等，根据实际情况选择。

**3. 修改配置**

按 `i` 键进入编辑模式，找到 `ONBOOT` 配置项，将其值修改为 `yes`：

```bash
ONBOOT=yes
```

然后按 `Esc` 键，输入 `:wq` 保存并退出。

**4. 重启网络服务**

```bash
service network restart
```

或者直接重启系统：

```bash
reboot
```

## 解决方案二：修改 yum 源配置

如果方案一无效，可能是 yum 源配置问题。

### 操作步骤

**1. 进入 yum 配置目录**

```bash
cd /etc/yum.repos.d
```

**2. 编辑源配置文件**

```bash
vi CentOS-Base.repo
```

**3. 修改配置**

- 将所有的 `mirrorlist` 配置项注释掉（在行首添加 `#`）
- 将所有的 `baseurl` 配置项取消注释（删除行首的 `#`）

**4. 保存并重启**

按 `Esc` 键，输入 `:wq` 保存退出，然后重启系统：

```bash
reboot
```

## 参考文章

- [博客园 - CentOS 7 yum 命令失效问题解决](https://www.cnblogs.com/crowsong/p/9371216.html)
