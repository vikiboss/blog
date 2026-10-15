---
name: translation-tech-article
description: Translates technical and frontend articles (from URL, pasted text, or file) into publication-ready Chinese Markdown saved under ./posts/{year}/. Use when the user asks for a Chinese translation of a technical article, or provides an article and requests a formatted, saved translation with proper frontmatter, Pandoc-style typography, and consistent terminology. Not for casual or non-technical translation, nor for summarizing.
license: MIT
---

# 技术文章翻译

将技术文章完整翻译为符合中文技术社区惯例、可直接发布的 Markdown，保存到 `./posts/{year}/`。优先准确、完整、专业，不摘要、不删减论点、不添加原文没有的事实。

## 流程

### 1. 提取原文信息
从 URL / 粘贴内容 / 文件中获取：标题、作者、发表时间、原文链接。
- 无法确认的字段标为 `未注明`，链接无法确认时标为 `未提供`，**不得猜测**
- 原文不完整时明确说明翻译范围，**不得谎称全文翻译**
- 无网络访问时要求用户粘贴原文

### 2. 生成文件名与路径
- 目录：`./posts/{year}/`，`{year}` 取本次译文的 `date` 年份（不是原文发表年份）
- 文件名：`translation-<3–6 个由连字符分隔的小写英文/数字单词>.md`
- 写入前检查冲突；已存在则换一个合规 slug，**不得静默覆盖**

### 3. 翻译与清理
完整翻译正文，保留原文结构、语气、论证、代码、命令、示例、表格、引用、图片及必要链接与披露。
- 删除：广告、无关推广、课程推销、站点导航、Cookie 提示
- 不要把正常技术讨论误判为推广
- 代码块（含注释）、命令、标识符、URL、图片源原样保留
- 独立出现的英文专有名词首字母大写：`上下文腐烂（Context Rot）`、`这个 Harness 可以`
- 禁止使用破折号，减少使用分号

### 4. 排版并保存
按下方规范排版后写入文件，最后校验 YAML、链接、图片、代码围栏、slug、路径。

## 格式规范

- **忠实性**：不摘要、不增删论据、不改变立场；不确定的技术细节不编造
- **中文**：自然、专业，术语前后一致；中英文/数字间加空格（盘古之白）
- **标点**：中文引号使用 `「」`，禁止使用破折号 `——`，减少使用分号 `；`
- **强调**：用加粗代替斜体（即使用 `**粗体**` 替换所有的 `*斜体*`）
- **链接空格**：链接与相邻中文之间留空格，如 `详见我们的 [迁移指南](url)。`
- **图片**：保留语法、来源、顺序；有意义的 alt 文本翻译
- **脚注**：仅需添加脚注引用，无需添加脚注标题（`## 脚注`），该标题会由解析器添加
- **其他**：其他非常规 Markdown 内容（如在线编辑器）降级为单段落链接文本或斜体文本（无链接时）

## Frontmatter 规范

| 字段 | 规则 |
|---|---|
| `title` | 以 `[译] ` 开头 |
| `date` | 本次译文生成日期 `YYYY-MM-DD`，须与目录年份一致 |
| `excerpt` | ≤40 字，概括核心内容，不写成宣传语 |
| `topic` | 仅 `技术` 或 `前端`；核心主题属前端时选 `前端` |
| `isOriginal` | 不加引号的布尔值 `false` |
| `author` | 原作者全名，未知填 `未注明` |
| `tags` | 3–6 个，必须含 `翻译` |

## 输出模板

```markdown
---
title: '[译] 简洁准确的中文标题'
date: YYYY-MM-DD
topic: '技术'
excerpt: '一句话概括文章核心内容。'
isOriginal: false
author: '原作者完整姓名'
tags:
  - '相关主题'
  - '翻译'
  - '其他相关标签'
---

> 原文：原文标题
>
> 时间：原文发表时间或「未注明」
>
> 作者：原作者姓名或「未注明」
>
> 链接：原文 URL 或「未提供」

---

（完整中文译文。）

---

## 译者注

本文由 AI 辅助翻译，译者进行了后期润色和校对。
```

## 错误处理

| 场景 | 处理 |
|---|---|
| URL 无法访问 | 重试；仍失败则要求用户粘贴原文 |
| 目标文件已存在 | 换一个合规 slug，不覆盖 |
| 元信息无法确认 | 标 `未注明` / `未提供`，不猜测 |
| 原文非英/中 | 照常译成中文，在译者注说明原文语言 |
| 代码注释 | 原样保留，不翻译 |
| 无网络 | 要求用户粘贴原文 |

## 完成检查

- [ ] 路径、slug、目录年份合规，未覆盖已有文件
- [ ] Frontmatter 字段完整合法，`date` 与目录年份一致
- [ ] 正文完整准确，术语一致，图片/alt 处理正确，代码与链接完好
- [ ] 广告清理干净，相关论据/资源/披露保留
- [ ] 盘古之白、中文引号合规；链接与相邻中文之间留空格
- [ ] 以「译者注」结尾
- [ ] 仅在写入成功后报告保存路径
- [ ] 说明未核实或未完整翻译的内容
