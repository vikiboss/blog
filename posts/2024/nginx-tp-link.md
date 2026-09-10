---
title: '公网访问 TP-LINK 路由管理页绕过 tplogin.cn 跳转'
date: 2024-09-30
topic: '技术'
excerpt: '教你如何通过 Nginx 反向代理绕过 tplogin.cn 域名检测，实现远程管理。'
tags:
  - Nginx
  - DevOps
  - 运维
  - 网络
  - 路由器
---

## 问题背景

最近在鼓捣家里云，申请了个公网 IP，想把路由器管理页面也暴露到公网方便远程管理。

然而 TP-LINK 的路由器管理页面有个比较讨厌的设计——前端 JavaScript 会检测访问域名是否为 `tplogin.cn`，如果不是就强制跳转。这就导致即使你配置了端口转发，通过公网 IP 或自己的域名访问时，页面会自动跳转到 `tplogin.cn`，根本无法正常使用。

## 解决方案

既然是前端 JavaScript 的域名检测逻辑导致的问题，那我们可以通过 Nginx 的字符串替换功能，在代理转发的过程中把这个检测逻辑"修正"掉。

### Nginx 配置

```nginx
server {
  # 暴露的端口
  listen 1234;

  location / {
    # 路由器管理页地址（通常是 192.168.0.1 或 192.168.1.1）
    proxy_pass http://192.168.0.1/;

    # 核心配置：替换前端写死的域名检测
    # 将 'tplogin.cn' 替换为你自己的域名
    subs_filter 'tplogin.cn' 'your.domain.com';

    # 对所有文件类型生效（包括 HTML、JS、CSS 等）
    subs_filter_types *;
  }
}
```

### 配置说明

- **listen 1234**：对外暴露的端口号，可以根据需要修改
- **proxy_pass**：路由器管理页的内网地址，一般是 `192.168.0.1` 或 `192.168.1.1`
- **subs_filter**：将响应内容中的 `tplogin.cn` 替换为你的域名
- **subs_filter_types \***：让替换规则对所有文件类型生效，确保 JavaScript 文件中的检测逻辑也被替换

### 安装 subs_filter 模块

如果 Nginx 提示 `subs_filter` 指令不可用，说明你的 Nginx 没有编译这个模块。解决方法：

**方法一：安装 nginx-extras**

```bash
# Ubuntu/Debian
sudo apt-get install nginx-extras

# CentOS/RHEL（需要 EPEL 源）
sudo yum install nginx-mod-http-substitutions-filter
```

**方法二：从源码编译**

如果上述方法不行，可以手动编译带 `ngx_http_substitutions_filter_module` 模块的 Nginx。

### 应用配置

配置完成后，重新加载 Nginx 使配置生效：

```bash
# 测试配置文件语法是否正确
nginx -t

# 重新加载配置（推荐，平滑重启）
nginx -s reload

# 或者重启 Nginx 服务
sudo systemctl restart nginx
```

## 使用效果

配置完成后，你就可以通过 `http://your.domain.com:1234` 或 `http://公网IP:1234` 访问路由器管理页面了。前端的域名检测已经被"骗过"，页面可以正常加载和操作。

## 安全提醒

将路由器管理页面暴露到公网存在一定安全风险，建议：

- 使用强密码，并定期更换
- 配置 Nginx 的访问控制（IP 白名单）
- 考虑使用 VPN 或 Tailscale 等更安全的远程访问方案
- 及时关注路由器固件更新，修复安全漏洞

## 总结

这个方案的核心思路就是用 Nginx 的字符串替换功能，在代理转发的过程中把前端代码里写死的域名检测逻辑给"修正"掉。虽然有点 hack 的感觉，但胜在简单实用，不需要刷固件或者修改路由器配置。
