---
title: 'Git Submodules 备忘录'
date: 2024-12-09
topic: '笔记'
excerpt: '一份简单实用的 Git Submodules 备忘录。'
tags:
  - Git
  - DevOps
  - 运维
  - 版本控制
---

这是一份给自己的、简单而又基础的 Git Submodules 备忘录。因为发现自己一到用的时候就忘了，结果就是一遍又一遍问 GPT……

Git Submodules 允许你将一个 Git 仓库作为另一个仓库的子目录，同时保持两个仓库的独立性。这在需要引用其他项目代码时特别有用，比如共享组件库、工具函数等场景。

## 克隆带有 Submodules 的仓库

当你克隆一个包含 Submodules 的仓库时，有两种方式：

```bash
# 方法一：克隆时自动初始化所有子模块（推荐）
git clone --recurse-submodules <主仓库URL>

# 方法二：先克隆主仓库，再手动初始化子模块
git clone <主仓库URL> [目标目录]
cd <目标目录>
git submodule update --init --recursive
```

**小提示**：`--recursive` 参数会递归初始化所有嵌套的子模块。

## 添加 Submodule 到当前仓库

将一个外部仓库添加为当前仓库的子模块：

```bash
# 添加子模块到指定路径
git submodule add <子模块仓库URL> [路径]

# 示例：将 lodash 添加到 libs/lodash 目录
git submodule add https://github.com/lodash/lodash.git libs/lodash
```

添加后会在项目根目录生成 `.gitmodules` 文件，记录子模块的配置信息。

## 更新 Submodules

### 同步到记录的提交点

当你切换分支、拉取更新，或者子模块的引用提交点发生变化时，使用此命令同步：

```bash
git submodule update --init --recursive
```

这个命令会将子模块更新到主仓库中记录的具体 commit ID。

### 更新到最新提交

如果你想让子模块跟随其远程仓库的最新进度：

```bash
# 方法一：进入子模块目录手动拉取
cd path/to/submodule
git pull origin main  # 或其他分支

# 回到主仓库根目录，提交子模块的变更
cd ../..
git add path/to/submodule
git commit -m "chore: update submodule to latest"

# 方法二：使用 git submodule update 命令（推荐）
git submodule update --remote --merge
git add .
git commit -m "chore: update submodules to latest"
```

**注意**：方法二会更新所有子模块到它们各自远程分支的最新提交。

## 修改 Submodule 的仓库地址

当子模块的远程仓库地址发生变化时（比如从 HTTP 改为 SSH），需要更新配置：

```bash
# 1. 编辑 .gitmodules 文件，修改对应子模块的 url 字段

# 2. 将 .gitmodules 中的变更同步到 .git/config
git submodule sync

# 3. 更新子模块
git submodule update --init --recursive

# 4. 提交变更
git add .gitmodules
git commit -m "chore: update submodule url"
git push
```

## 删除 Submodule

删除子模块比添加稍微复杂一些，需要清理多个地方的配置：

```bash
# 1. 删除子模块目录和 Git 索引中的记录
git rm -f <submodule_path>

# 2. 编辑 .gitmodules 文件
# 找到并删除对应子模块的配置段落，格式如下：
# [submodule "submodule_name"]
#     path = submodule_path
#     url = https://github.com/username/repo.git

# 3. 编辑 .git/config 文件（可选）
# 删除对应的 [submodule "xxx"] 配置段落

# 4. 提交变更
git add .gitmodules
git commit -m "chore: remove submodule"

# 5. 清理 .git/modules 中的子模块数据
rm -rf .git/modules/<submodule_path>
```

**小提示**：从 Git 2.13 开始，`git rm` 会自动清理 `.git/config` 中的配置，所以步骤 3 通常可以省略。

## 常见问题

### 子模块显示为修改状态

有时你会发现子模块一直显示为 modified 状态，即使你没有修改任何内容。这通常是因为：

1. 子模块的 HEAD 指向与主仓库记录不一致
2. 子模块中有未提交的修改

解决方法：

```bash
# 重置子模块到记录的提交点
git submodule update --init --recursive

# 或者进入子模块检查状态
cd path/to/submodule
git status
```

### 忘记初始化子模块

如果克隆后忘记初始化子模块，会发现子模块目录是空的。补救方法：

```bash
git submodule update --init --recursive
```

## 总结

Git Submodules 虽然不是最完美的依赖管理方案，但在特定场景下（如需要精确控制依赖版本、跨项目共享代码）还是很有用的。熟练掌握这几个常用命令，基本就能应对日常开发需求了。

如果你的项目依赖管理比较复杂，也可以考虑其他方案，比如 Git Subtree、包管理器（npm/yarn/pnpm）或者 Monorepo 工具（Nx/Turborepo）。
