---
title: 'Guitar Studio! （吉他工作室）'
date: 2024-01-12
topic: '生活'
excerpt: '介绍一个开源的在线吉他工具箱，集成了调音器、节拍器、和弦库等实用功能。'
tags:
  - Project
  - React
  - TypeScript
  - 音乐
  - 开源
  - 吉他
---

![Guitar Studio 主界面](https://s2.loli.net/2025/11/19/fpWaixzZGSovCmE.png)

## 项目介绍

🎸 + 🌐 = 你的 **一站式** 在线吉他工具箱！

作为一个吉他爱好者，练琴时总要在各种工具之间切换：调音器、节拍器、和弦查询、六线谱... 索性就做了这个小项目，把常用的吉他工具都整合到一个网页里。

目前这个项目还在开发中，但已经可以正常使用部分功能了。毕竟自己偶尔也用用嘛。

## 功能清单

### 已实现

- **在线访问** - 打开浏览器就能用，不用下载任何 App
- **现代化界面** - 简洁、直观、响应式设计
- **和弦库** - 使用 [chords-db](https://github.com/tombatossals/chords-db) 数据，查询各种和弦指法
- **调音器** - 基于 [pitchy](https://github.com/ianprime0509/pitchy) 实现，帮你快速调准琴弦
- **节拍器** - 练习节奏感的好帮手

### TODO

- **六线谱** - 查看和学习吉他谱
- **听力训练** - 基于 [Tone.js](https://tonejs.github.io/) 实现，提升音乐素养

## 技术栈

这个项目使用了以下技术：

- **React** + **TypeScript** - 类型安全的现代化开发体验
- **Vite** - 极速的开发和构建工具
- **UnoCSS** - 即时按需的原子化 CSS 引擎

项目完全开源，代码托管在 GitHub 上，采用 MIT 协议。如果你也对吉他感兴趣，欢迎一起来完善这个工具箱！有什么建议或者想要的功能，也欢迎在 GitHub 提 Issue 告诉我！

## 试用地址

- 在线访问：https://guitar.viki.moe
- GitHub 仓库：https://github.com/vikiboss/guitar-studio

虽然功能还没完全做完，但不妨碍你现在就去体验一下嘛~
