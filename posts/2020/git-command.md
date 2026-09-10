---
title: 'Git 常用命令速览'
date: 2020-10-11
topic: '笔记'
excerpt: '一份详尽的 Git 常用命令速查表。'
tags:
  - 'Git'
  - 'CLI'
  - '速查清单'
  - '版本控制'
  - '命令行'
---

先放一张常用命令总览图：

![Git 常用命令](https://i.loli.net/2020/10/15/Swsq8OFLTMDzGjE.jpg)

## 最常用的 Git 命令

### 配置默认信息

在首次使用 Git 时，需要配置用户名和邮箱：

```bash
git config --global user.name "[username]"
git config --global user.email "[email_address]"
```

### 初始化版本库

```bash
# 将当前目录初始化为 Git 版本库
git init
# 重命名当前分支为 main
git branch -M main
```

> 推荐使用 main 作为主分支名，参见 [GitHub 官方说明](https://github.com/github/renaming#new-repositories-use-main-as-default-branch-name)

### 关联远程仓库

```bash
git remote add origin [repo_url]
```

### 暂存更改

```bash
# 暂存所有修改（包括新增、修改、删除）
git add .
# 或者使用
git add -A
```

### 提交更改

```bash
git commit -m "[commit_message]"
```

### 推送到远程仓库

```bash
# 首次推送需要 -u 参数建立追踪关系
git push -u origin main
# 之后可以直接使用
git push
```

## 进阶常用命令

### 一、修改与提交操作

#### 查看当前版本库状态

```bash
git status
```

#### 修改最后一次提交

如果提交后发现提交信息写错了，可以使用 `--amend` 修正：

```bash
git commit --amend
```

运行后会进入编辑器（通常是 vim），按 `i` 进入编辑模式，修改完成后按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

### 二、分支操作

#### 新建分支

```bash
git branch [branch_name]
```

#### 切换分支

```bash
# 切换到指定分支
git checkout [branch_name]
# 切换到上一个提交
git checkout HEAD^
# 切换到前 3 个提交
git checkout HEAD~3
```

#### 删除本地分支

```bash
git branch -d [branch_name]
```

#### 新建并切换到指定分支

```bash
# 创建并切换分支（推荐使用）
git checkout -b [branch_name]
# 或者使用新命令
git switch -c [branch_name]
```

#### 合并分支

将指定分支合并到当前分支：

```bash
git merge [branch_name]
```

#### 变基操作（Rebase）

把当前分支的提交重新应用到目标分支上：

```bash
git rebase [branch_name]
```

> **注意**：rebase 会改写提交历史，如果目标分支是 `main`、`master` 等主分支，建议将主分支也 rebase 到最新的更改，保持历史的线性。

### 三、撤销操作

#### 软撤销（Soft Reset）

只撤销 commit 记录，保留所有文件改动：

```bash
git reset --soft HEAD^
```

这个命令会把上一次提交撤销，但改动的文件仍然保留在暂存区，可以重新修改后再提交。

如果只是想修改提交信息，推荐使用：

```bash
git commit --amend
```

#### 硬撤销（Hard Reset）

撤销 commit 的同时，删除所有文件改动，恢复到指定提交的状态：

```bash
# 撤销上一个提交
git reset --hard HEAD^
# 撤销前 3 个提交
git reset --hard HEAD~3
```

> **危险操作警告**：硬撤销会永久删除未提交的代码，不懂的话千万别乱用，否则一下午写的代码全白给！

#### 误操作恢复

如果不小心误删了代码，还有一线希望，可以通过 `reflog` 查找历史记录：

```bash
# 查看所有操作记录
git reflog
# 找到误删前的 commit_id，恢复到该版本
git reset --hard [commit_id]
```

### 四、查看提交历史

```bash
# 查看 Git 日志（按 q 退出）
git log
# 查看上一次提交（或指定 commit_id 的提交）
git show [commit_id]
# 查看指定文件的修改历史
git log -p [file_name]
# 以列表形式查看指定文件的每行修改记录
git blame [file_name]
# 以图形化方式查看分支历史
git log --graph --pretty=oneline --abbrev-commit
```

## 附录：Git 命令速查表

### 基础配置

```bash
# 初始化版本库
git init

# 配置全局用户信息
git config --global user.name "[username]"
git config --global user.email "[email_address]"

# 查看版本库状态
git status

# 克隆远程仓库（Git 协议最快）
git clone [repo_url]

# 关联远程仓库
git remote add origin [repo_url]
```

### 文件操作

```bash
# 将所有修改添加到暂存区
git add .

# 通配符添加
git add *                    # 添加所有文件
git add *.js                 # 添加所有 .js 文件
git add Hello*               # 添加 Hello 开头的文件
git add *Hello               # 添加 Hello 结尾的文件
git add Hello?               # 添加 Hello 后跟一个字符的文件

# 查看文件修改内容
git diff [file_name]

# 从版本库中删除文件（同时删除本地文件）
git rm [file_name]

# 丢弃工作区的修改
git checkout -- [file_name]

# 取消暂存区的修改
git reset HEAD [file_name]
```

### 提交管理

```bash
# 提交更改
git commit -m "[commit_message]"

# 查看提交历史
git log
git log --pretty=oneline         # 单行显示
git log --graph --abbrev-commit  # 图形化显示

# 查看指定提交
git show [commit_id]

# 查看操作历史
git reflog
```

### 分支操作

```bash
# 查看所有分支
git branch

# 创建分支
git branch [branch_name]

# 切换分支
git checkout [branch_name]

# 创建并切换分支
git checkout -b [branch_name]

# 删除分支
git branch -d [branch_name]       # 安全删除
git branch -D [branch_name]       # 强制删除

# 合并分支
git merge [branch_name]
git merge --no-ff -m "[comment]" [branch_name]  # 禁用快进合并
```

### 远程操作

```bash
# 拉取远程更新
git pull

# 推送到远程
git push -u origin [branch_name]  # 首次推送
git push                           # 后续推送

# 推送标签
git push origin [tag_name]         # 推送指定标签
git push origin --tags             # 推送所有标签
```

### 版本回退

```bash
# 回退到上一个版本
git reset --hard HEAD^

# 回退到上两个版本
git reset --hard HEAD^^

# 回退到上 100 个版本
git reset --hard HEAD~100

# 回退到指定版本
git reset --hard [commit_id]
```

### 标签管理

```bash
# 查看所有标签
git tag

# 创建标签
git tag [tag_name]                           # 在当前提交打标签
git tag [tag_name] [commit_id]                # 在指定提交打标签
git tag -a [tag_name] -m "[message]" [commit_id]  # 创建附注标签

# 查看标签信息
git show [tag_name]

# 删除标签
git tag -d [tag_name]
```

### 暂存工作区

```bash
# 暂存当前修改
git stash

# 查看暂存列表
git stash list

# 恢复暂存内容
git stash pop    # 恢复并删除暂存
git stash apply  # 恢复但保留暂存
```
