---
title: '解决 git/ssh 报错：too many authentication failures'
date: 2024-10-14
topic: '技术'
excerpt: '边踩坑，边记录。'
tags:
  - SSH
  - Git
  - Linux
  - 运维
  - 故障排查
---

## 问题原因

在使用 Git 或 SSH 连接远程服务器时，如果遇到 `Received disconnect from xxx: 2: Too many authentication failures` 这类错误，通常是因为：

1. **SSH 配置了多个 Host 规则**，且没有设置精确匹配
2. **本地存在多个 SSH 密钥**（如 `~/.ssh/` 目录下有多个 `id_rsa`、`id_ed25519` 等）
3. **SSH 客户端会挨个尝试所有密钥**，在找到正确密钥之前，失败次数已经超过服务器限制（通常是 6 次）

简单来说，就是 SSH 太"勤快"了，把你所有的钥匙都试了一遍，结果被门卫（服务器）当成可疑人员拒之门外。

## 解决方案

在 `~/.ssh/config` 文件中为每个 Host 添加 `IdentitiesOnly yes` 配置，让 SSH 只尝试指定的密钥：

```bash
# ~/.ssh/config

# GitLab 配置
Host gitlab.xxx.com
  HostName gitlab.xxx.com
  User root
  IdentityFile ~/.ssh/other_rsa
  # 关键配置：只使用指定的密钥文件
  IdentitiesOnly yes
  # 不使用任何 SSH Agent
  IdentityAgent none

# GitHub 配置
Host github.com
  # 使用 443 端口（适用于防火墙限制场景）
  HostName ssh.github.com
  User git
  Port 443
  IdentityFile ~/.ssh/viki_rsa
  IdentitiesOnly yes

# 默认配置（通配符匹配）
Host *
  User root
  IdentityFile ~/.ssh/viki_rsa
  PreferredAuthentications publickey
  IdentityAgent "xxx"
```

## 配置说明

### 核心参数

- **`IdentitiesOnly yes`**：只使用配置文件中指定的 `IdentityFile`，不尝试其他密钥
- **`IdentityAgent none`**：禁用 SSH Agent，避免尝试 Agent 中的所有密钥
- **`IdentityFile`**：指定该 Host 使用的私钥路径

### 配置优先级

SSH 配置文件是按顺序匹配的，第一个匹配的 Host 规则会生效。因此：

- 将具体的 Host 配置放在前面（如 `gitlab.xxx.com`、`github.com`）
- 将通配符配置 `Host *` 放在最后作为兜底

### GitHub 的特殊配置

```bash
Host github.com
  HostName ssh.github.com  # 使用 SSH 专用域名
  Port 443                 # 使用 HTTPS 端口
```

这个配置适用于网络环境限制了 SSH 默认端口（22）的情况，GitHub 在 443 端口同样提供 SSH 服务。

## 验证配置

修改配置后，可以测试连接：

```bash
# 测试 GitHub 连接
ssh -T git@github.com

# 测试 GitLab 连接
ssh -T git@gitlab.xxx.com

# 查看详细连接过程（调试模式）
ssh -vT git@github.com
```

如果配置正确，应该能看到类似 "Hi username! You've successfully authenticated" 的成功信息。

## 小结

遇到 "too many authentication failures" 错误时，不要慌，只需要告诉 SSH："别瞎试了，用这把钥匙！"（`IdentitiesOnly yes`）问题就解决了。
