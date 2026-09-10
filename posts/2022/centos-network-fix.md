---
title: 'VMware 17 安装 CentOS 7 无法连接网络'
date: 2022-11-30
topic: '笔记'
excerpt: '解决 VMware 17 安装 CentOS 7 后无法联网的常见问题。详细介绍如何通过修改 ifcfg 网卡配置文件启用 ONBOOT 选项，并重启网络服务以恢复连接。'
archived: true
tags:
  - 'Linux'
  - 'CentOS'
  - '虚拟机'
  - '网络'
  - '解决方案'
---

之前电脑的一次 Win11 大版本更新把系统搞坏了，重装之后就没怎么用过 VMware。最近发现 VMware 出了 17 新版本，兼容 Win11，就下载安装了一个，顺便下了个 CentOS 7 的镜像。结果安装完发现连不上网络。

## 问题原因

CentOS 7 默认不会在启动时自动连接网络。在安装系统时，需要在图形界面中手动勾选「自动连接网络」选项。应该是我当时忘了勾选这个选项了 =.=

## 解决方案

如果安装的时候忘了勾选怎么办？我知道你很急，但你先别急。

### 步骤 1：修改网络配置文件

使用 `vi` 编辑器打开网络配置文件：

```bash
vi /etc/sysconfig/network-scripts/ifcfg-ens33
```

找到 `ONBOOT` 配置项，将其值改为 `yes`：

```bash
ONBOOT=yes
```

然后保存并退出（按 `Esc`，输入 `:wq`，回车）。

> **注意**：网络接口名称可能不同，常见的有 `ifcfg-ens33`、`ifcfg-eth0` 等，可以通过 `ls /etc/sysconfig/network-scripts/` 命令查看具体的文件名。

### 步骤 2：让配置生效

修改完配置文件后，需要重启网络服务使其生效。你可以选择以下两种方式之一：

**方式 1：重启网络服务（推荐）**

```bash
service network restart
```

或者使用 systemctl 命令：

```bash
systemctl restart network
```

**方式 2：重启系统**

```bash
reboot
```

重启完成后，CentOS 就可以正常联网啦！可以通过 `ping baidu.com` 命令测试网络连接是否正常。
