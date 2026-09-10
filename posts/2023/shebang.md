---
title: '什么是 Shebang (或 Hashbang)'
date: 2023-03-14
topic: '技术'
excerpt: '一行神秘的特殊字符序列。'
tags:
  - Linux
  - Shell
  - Node.js
  - Python
  - 脚本
---

Shebang，也称为 Hashbang 或 Sha-bang，是一种在 Unix、Linux 和类 Unix 系统上广泛使用的特殊字符序列。它的作用是告诉操作系统，这个脚本文件应该用哪个解释器来执行。

## 什么是 Shebang？

Shebang 由两个字符组成：井号（`#`）和感叹号（`!`），它们之间没有空格。这个字符序列必须出现在脚本文件的第一行，紧接着是解释器的完整路径。

例如，一个简单的 Bash 脚本：

```bash
#!/bin/bash

echo "Hello, world!"
```

当你在命令行执行这个脚本时，操作系统会：

1. 读取第一行的 `#!/bin/bash`
2. 启动 `/bin/bash` 解释器
3. 将脚本文件作为参数传递给 Bash 解释器

这样，脚本就能被正确执行了。

## 跨语言支持

Shebang 不仅限于 Bash，它适用于所有需要解释器的脚本语言，只要系统中安装了对应的解释器。例如：

- Python 脚本可以使用 `#!/usr/bin/python` 或 `#!/usr/bin/python3`
- Node.js 脚本可以使用 `#!/usr/bin/node`
- Ruby 脚本可以使用 `#!/usr/bin/ruby`

**注意**：在 Windows 系统上，Shebang 通常不受支持或表现不同，因为 Windows 主要通过文件扩展名（如 `.bat`、`.ps1`）来决定用什么程序执行脚本。

## Shebang 和 Hashbang 有什么区别？

这两个词其实指的是同一个东西，只是叫法不同：

- **Shebang**：更常用的术语，特指用于指定脚本解释器的 `#!` 字符序列
- **Hashbang**：字面意思，Hash（`#`，井号）+ Bang（`!`，感叹号）

在 Unix 和类 Unix 系统中，Shebang 是更广泛使用的术语。不过无论你叫它什么，它们都是同一个东西。

## 常见的 Shebang 形式

以下是各种脚本语言常用的 Shebang 写法：

| 脚本类型   | Shebang 示例         |
| ---------- | -------------------- |
| Bash       | `#!/bin/bash`        |
| Shell      | `#!/bin/sh`          |
| Python 2.x | `#!/usr/bin/python`  |
| Python 3.x | `#!/usr/bin/python3` |
| Node.js    | `#!/usr/bin/node`    |
| Perl       | `#!/usr/bin/perl`    |
| Ruby       | `#!/usr/bin/ruby`    |
| PHP        | `#!/usr/bin/php`     |

**注意**：这些路径假设解释器安装在标准位置。不同的系统（如 macOS、Ubuntu、CentOS）可能将解释器安装在不同的路径。如果你的脚本在其他机器上无法运行，可能需要检查解释器的实际路径。

## 为什么推荐使用 `#!/usr/bin/env` 形式？

你可能注意到，有些脚本使用 `#!/usr/bin/env node` 而不是 `#!/usr/bin/node`。这种写法有什么好处呢？

使用 `#!/usr/bin/env node` 的最大优势是：**它会自动在 PATH 环境变量中查找第一个可用的 Node.js 解释器**。

### 具体优点

**1. 跨平台兼容性更好**

不同操作系统的解释器路径可能不同：

- macOS 可能是 `/usr/local/bin/node`
- Ubuntu 可能是 `/usr/bin/node`
- 通过 nvm 安装可能是 `~/.nvm/versions/node/v20.0.0/bin/node`

使用 `env` 方式就不需要关心具体路径在哪里。

**2. 简化部署流程**

当你把脚本部署到不同服务器时，不需要修改 Shebang，因为 `env` 会自动找到对应的解释器。

**3. 适配不同开发环境**

不同开发者可能使用不同的版本管理工具（如 nvm、asdf），解释器路径各不相同。使用 `env` 方式能让脚本在所有环境中都正常工作。

### 注意事项

使用 `#!/usr/bin/env node` 时，要确保：

- Node.js 已正确安装
- Node.js 可执行文件在 PATH 环境变量中

如果脚本执行时提示找不到 `node` 命令，就需要检查 PATH 配置了。
