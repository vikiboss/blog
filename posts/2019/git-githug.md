---
title: 'Githug 通关指南：55 关 Git 实战闯关攻略'
date: 2019-12-14
topic: '笔记'
top_image: 'https://i.loli.net/2020/11/21/3ygtAW8ESVJuMKH.jpg'
excerpt: '通过 Githug 游戏化学习 Git，从安装配置到全部 55 关详细攻略。涵盖分支管理、冲突解决、Rebase 等实战技巧，助你轻松掌握版本控制核心技能。'
archived: true
tags:
  - 'Git'
  - 'Githug'
  - 'CLI'
  - '教程'
  - '版本控制'
---

## 前言

### 关于 Githug

Githug 是一个基于 Ruby 开发的交互式 Git 学习工具，通过游戏化的方式帮助开发者系统掌握 Git 版本控制系统。区别于 GitHub（代码托管平台），Githug 专注于通过 55 个精心设计的关卡，覆盖从基础操作到高级技巧的完整知识体系。

> 首次接触 Git？ 建议先阅读 [Git 官方文档](https://git-scm.com/doc) 或 [廖雪峰的 Git 教程](https://liaoxuefeng.com/books/git/what-is-git/index.html) 了解基础概念。

### 学习建议

学习 Git 的关键在于理解其底层原理，而非死记硬背命令。建议在闯关过程中：

- 深入理解每个命令的工作机制
- 思考不同命令之间的关联和区别
- 在实际项目中应用所学知识
- 遇到困难时善用 `githug hint` 和官方文档

### 环境准备

#### Ruby 环境配置

Githug 基于 Ruby 运行环境，因此需要预先安装 Ruby。如已安装可跳过此步骤。

**安装方式**：

- **通用方法**：访问 [Ruby 官网](https://www.ruby-lang.org/zh_cn/downloads/) 下载对应平台的安装包
- **Windows 系统**：推荐使用 [RubyInstaller](https://rubyinstaller.org/downloads/)，提供一键安装体验
- **macOS 系统**：系统自带 Ruby，也可通过 Homebrew 安装最新版本
- **Linux 系统**：使用包管理器安装，如 `apt install ruby` 或 `yum install ruby`

**验证安装**：

```bash
ruby --version
```

命令行输出版本号即表示安装成功。

> 命令行新手？推荐阅读 [MDN 命令行速成课](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Getting_started/Environment_setup/Command_line)。

#### Githug 安装配置

**配置 gem 源**（可选，国内用户推荐）：

```bash
# 移除默认源
gem sources --remove https://rubygems.org/
# 添加国内镜像源
gem sources --add https://gems.ruby-china.com/
# 验证源配置
gem sources -l
```

**安装 Githug**：

```bash
gem install githug
```

安装完成后即可开始使用。

## 初始化与使用

### 创建游戏目录

在终端中切换到期望的工作目录，执行：

```bash
githug
```

首次运行会提示创建游戏目录：

```bash
***********************************************************
* Githug *
***********************************************************
No githug directory found, do you wish to create one? [yn]
```

输入 `y` 确认后，Githug 会在当前目录下创建 `git_hug` 文件夹，包含所有关卡所需的 Git 仓库环境。

**进入游戏目录**：

```bash
cd git_hug
```

**Windows 用户快捷操作**：在文件资源管理器的地址栏输入 `cmd` 并回车，可在当前目录快速打开命令行。

### 核心命令

| 命令                      | 功能说明                |
| ------------------------- | ----------------------- |
| `githug` 或 `githug play` | 验证当前关卡完成情况    |
| `githug test`             | 运行关卡测试（同 play） |
| `githug hint`             | 获取当前关卡提示        |
| `githug reset`            | 重置当前关卡到初始状态  |
| `githug levels`           | 查看所有关卡列表        |

**提示**：Githug 会自动保存闯关进度，随时可以退出并在稍后继续。

## 开始闯关

<details>
<summary>📖 点击展开全部 55 关攻略</summary>

<details>
<summary>第 1 关：init</summary>

**任务**：初始化一个新的 Git 仓库。

**提示**：使用 `git init` 命令可以在当前目录初始化一个 Git 仓库。

**解答**：

```bash
git init
```

执行 `githug` 检查是否通过，通过后会自动进入下一关。

</details>

<details>
<summary>第 2 关：config</summary>

**任务**：配置你的 Git 用户名和邮箱。

**提示**：使用 `git config` 命令可以配置 Git 的各种设置。

**解答**：

```bash
git config user.name "你的名字"
git config user.email "你的邮箱"
```

</details>

<details>
<summary>第 3 关：add</summary>

**任务**：将文件添加到暂存区。

**提示**：使用 `git add` 命令可以将文件添加到暂存区，准备提交。

**解答**：

```bash
git add README.md
```

或者添加所有文件：

```bash
git add .
```

</details>

<details>
<summary>第 4 关：commit</summary>

**任务**：提交暂存区的文件。

**提示**：使用 `git commit` 命令可以将暂存区的文件提交到仓库。

**解答**：

```bash
git commit -m "Initial commit"
```

其中 `-m` 参数后面跟的是提交信息，描述本次提交的内容。

</details>

<details>
<summary>第 5 关：clone</summary>

**任务**：克隆一个远程仓库。

**提示**：使用 `git clone` 命令可以克隆一个远程仓库到本地。

**解答**：

```bash
git clone https://github.com/example/repo.git
```

</details>

<details>
<summary>第 6 关：clone_to_folder</summary>

**任务**：克隆远程仓库到指定文件夹。

**提示**：在 `git clone` 命令后添加目标文件夹名称。

**解答**：

```bash
git clone https://github.com/example/repo.git my_folder
```

</details>

<details>
<summary>第 7 关：ignore</summary>

**任务**：忽略不想被 Git 追踪的文件。

**提示**：创建 `.gitignore` 文件，在其中列出要忽略的文件或目录。

**解答**：

```bash
echo "*.log" > .gitignore
git add .gitignore
git commit -m "Add gitignore"
```

</details>

<details>
<summary>第 8 关：status</summary>

**任务**：查看当前仓库的状态。

**提示**：使用 `git status` 命令可以查看当前工作区和暂存区的状态。

**解答**：

```bash
git status
```

</details>

<details>
<summary>第 9 关：number_of_files_committed</summary>

**任务**：统计有多少文件被提交了。

**提示**：使用 `git log` 和其他命令查看提交历史。

**解答**：

```bash
git log --oneline --stat
```

然后数一数文件数量，输入答案。

</details>

<details>
<summary>第 10 关：rm</summary>

**任务**：从 Git 仓库中删除文件。

**提示**：使用 `git rm` 命令可以从仓库中删除文件。

**解答**：

```bash
git rm deleteme.rb
```

</details>

<details>
<summary>第 11 关：rm_cached</summary>

**任务**：从暂存区移除文件，但保留在工作目录中。

**提示**：使用 `git rm --cached` 命令。

**解答**：

```bash
git rm --cached deleteme.rb
```

</details>

<details>
<summary>第 12 关：stash</summary>

**任务**：暂存当前工作区的修改。

**提示**：当你需要临时切换到其他分支，但又不想提交当前的修改时，可以使用 `git stash`。

**解答**：

```bash
git stash
```

恢复暂存的内容：

```bash
git stash pop
```

</details>

<details>
<summary>第 13 关：rename</summary>

**任务**：重命名文件并让 Git 追踪这个变化。

**提示**：使用 `git mv` 命令可以重命名文件。

**解答**：

```bash
git mv oldfile.txt newfile.txt
```

</details>

<details>
<summary>第 14 关：restructure</summary>

**任务**：移动文件到新的目录结构。

**提示**：使用 `git mv` 命令移动文件。

**解答**：

```bash
git mv *.html src/
```

</details>

<details>
<summary>第 15 关：log</summary>

**任务**：查看提交历史。

**提示**：使用 `git log` 命令查看提交记录。

**解答**：

```bash
git log
```

</details>

<details>
<summary>第 16 关：tag</summary>

**任务**：给当前提交打标签。

**提示**：使用 `git tag` 命令可以给提交打标签，方便版本管理。

**解答**：

```bash
git tag v1.0.0
```

</details>

<details>
<summary>第 17 关：push_tags</summary>

**任务**：推送标签到远程仓库。

**提示**：标签不会自动推送，需要显式推送。

**解答**：

```bash
git push --tags
```

</details>

<details>
<summary>第 18 关：commit_amend</summary>

**任务**：修改最后一次提交。

**提示**：使用 `git commit --amend` 可以修改最近一次提交的信息或内容。

**解答**：

```bash
git commit --amend -m "新的提交信息"
```

</details>

<details>
<summary>第 19 关：commit_in_future</summary>

**任务**：创建一个未来时间的提交。

**提示**：可以使用 `--date` 参数指定提交时间。

**解答**：

```bash
git commit --date="2025-12-31" -m "Future commit"
```

</details>

<details>
<summary>第 20 关：reset</summary>

**任务**：重置到之前的提交。

**提示**：使用 `git reset` 命令可以回退版本。

**解答**：

```bash
git reset HEAD^
```

</details>

<details>
<summary>第 21 关：reset_soft</summary>

**任务**：软重置，保留工作区的修改。

**提示**：`--soft` 参数只重置 HEAD，保留暂存区和工作区。

**解答**：

```bash
git reset --soft HEAD^
```

</details>

<details>
<summary>第 22 关：checkout_file</summary>

**任务**：从仓库中恢复文件。

**提示**：使用 `git checkout` 可以恢复文件到之前的状态。

**解答**：

```bash
git checkout HEAD -- filename
```

</details>

<details>
<summary>第 23 关：remote</summary>

**任务**：查看远程仓库。

**提示**：使用 `git remote` 命令查看远程仓库信息。

**解答**：

```bash
git remote
```

查看详细信息：

```bash
git remote -v
```

</details>

<details>
<summary>第 24 关：remote_url</summary>

**任务**：查看远程仓库的 URL。

**提示**：使用 `git remote -v` 或 `git remote get-url` 命令。

**解答**：

```bash
git remote get-url origin
```

</details>

<details>
<summary>第 25 关：pull</summary>

**任务**：从远程仓库拉取更新。

**提示**：使用 `git pull` 命令拉取并合并远程仓库的更新。

**解答**：

```bash
git pull origin master
```

</details>

<details>
<summary>第 26 关：remote_add</summary>

**任务**：添加远程仓库。

**提示**：使用 `git remote add` 命令添加远程仓库。

**解答**：

```bash
git remote add origin https://github.com/username/repo.git
```

</details>

<details>
<summary>第 27 关：push</summary>

**任务**：推送本地提交到远程仓库。

**提示**：使用 `git push` 命令推送代码。

**解答**：

```bash
git push origin master
```

</details>

<details>
<summary>第 28 关：diff</summary>

**任务**：查看文件的修改内容。

**提示**：使用 `git diff` 命令查看工作区与暂存区的差异。

**解答**：

```bash
git diff
```

</details>

<details>
<summary>第 29 关：blame</summary>

**任务**：查看文件每一行的修改者。

**提示**：使用 `git blame` 命令可以查看文件每一行是谁修改的。

**解答**：

```bash
git blame filename
```

</details>

<details>
<summary>第 30 关：branch</summary>

**任务**：创建新分支。

**提示**：使用 `git branch` 命令创建分支。

**解答**：

```bash
git branch test_branch
```

</details>

<details>
<summary>第 31 关：checkout</summary>

**任务**：切换分支。

**提示**：使用 `git checkout` 命令切换分支。

**解答**：

```bash
git checkout test_branch
```

</details>

<details>
<summary>第 32 关：checkout_tag</summary>

**任务**：切换到某个标签。

**提示**：标签也可以使用 `git checkout` 切换。

**解答**：

```bash
git checkout v1.0
```

</details>

<details>
<summary>第 33 关：checkout_tag_over_branch</summary>

**任务**：当标签和分支同名时，切换到标签。

**提示**：使用 `tags/` 前缀明确指定标签。

**解答**：

```bash
git checkout tags/v1.0
```

</details>

<details>
<summary>第 34 关：branch_at</summary>

**任务**：在指定提交处创建分支。

**提示**：在 `git branch` 命令后指定提交的 SHA 值。

**解答**：

```bash
git branch test_branch commit_sha
```

</details>

<details>
<summary>第 35 关：delete_branch</summary>

**任务**：删除分支。

**提示**：使用 `git branch -d` 命令删除分支。

**解答**：

```bash
git branch -d delete_me
```

强制删除未合并的分支：

```bash
git branch -D delete_me
```

</details>

<details>
<summary>第 36 关：push_branch</summary>

**任务**：推送分支到远程仓库。

**提示**：使用 `git push` 命令推送指定分支。

**解答**：

```bash
git push origin test_branch
```

</details>

<details>
<summary>第 37 关：merge</summary>

**任务**：合并分支。

**提示**：使用 `git merge` 命令合并分支。

**解答**：

```bash
git merge feature_branch
```

</details>

<details>
<summary>第 38 关：fetch</summary>

**任务**：从远程仓库获取更新但不合并。

**提示**：`git fetch` 只下载远程更新，不会自动合并。

**解答**：

```bash
git fetch origin
```

</details>

<details>
<summary>第 39 关：rebase</summary>

**任务**：使用 rebase 整理提交历史。

**提示**：`git rebase` 可以让提交历史更加线性。

**解答**：

```bash
git rebase master
```

</details>

<details>
<summary>第 40 关：rebase_onto</summary>

**任务**：使用 rebase --onto 移动分支。

**提示**：`--onto` 参数可以将分支移动到新的基础上。

**解答**：

```bash
git rebase --onto master feature new_branch
```

</details>

<details>
<summary>第 41 关：repack</summary>

**任务**：重新打包仓库。

**提示**：使用 `git repack` 命令可以优化仓库存储。

**解答**：

```bash
git repack -d
```

</details>

<details>
<summary>第 42 关：cherry-pick</summary>

**任务**：挑选特定的提交应用到当前分支。

**提示**：使用 `git cherry-pick` 可以选择性地应用提交。

**解答**：

```bash
git cherry-pick commit_sha
```

</details>

<details>
<summary>第 43 关：grep</summary>

**任务**：在代码中搜索内容。

**提示**：使用 `git grep` 命令在代码中搜索文本。

**解答**：

```bash
git grep "搜索内容"
```

</details>

<details>
<summary>第 44 关：rename_commit</summary>

**任务**：重命名提交信息。

**提示**：使用 `git rebase -i` 进入交互式 rebase。

**解答**：

```bash
git rebase -i HEAD~2
```

然后将要修改的提交前的 `pick` 改为 `reword`，保存后修改提交信息。

</details>

<details>
<summary>第 45 关：squash</summary>

**任务**：合并多个提交。

**提示**：使用 `git rebase -i` 并将提交标记为 `squash`。

**解答**：

```bash
git rebase -i HEAD~3
```

将要合并的提交前的 `pick` 改为 `squash` 或 `s`。

</details>

<details>
<summary>第 46 关：merge_squash</summary>

**任务**：使用 squash 方式合并分支。

**提示**：`--squash` 参数会将所有提交压缩为一个。

**解答**：

```bash
git merge --squash feature_branch
git commit -m "Squashed commit"
```

</details>

<details>
<summary>第 47 关：reorder</summary>

**任务**：调整提交顺序。

**提示**：使用 `git rebase -i` 调整提交顺序。

**解答**：

```bash
git rebase -i HEAD~3
```

在编辑器中调整提交的顺序。

</details>

<details>
<summary>第 48 关：bisect</summary>

**任务**：使用二分查找定位 bug。

**提示**：`git bisect` 可以帮助快速定位引入 bug 的提交。

**解答**：

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.0
```

</details>

<details>
<summary>第 49 关：stage_lines</summary>

**任务**：只暂存文件的部分修改。

**提示**：使用 `git add -p` 进入交互式暂存。

**解答**：

```bash
git add -p filename
```

</details>

<details>
<summary>第 50 关：find_old_branch</summary>

**任务**：找回已删除的分支。

**提示**：使用 `git reflog` 查看操作历史。

**解答**：

```bash
git reflog
git checkout -b old_branch commit_sha
```

</details>

<details>
<summary>第 51 关：revert</summary>

**任务**：撤销某个提交。

**提示**：使用 `git revert` 创建一个新提交来撤销之前的修改。

**解答**：

```bash
git revert commit_sha
```

</details>

<details>
<summary>第 52 关：restore</summary>

**任务**：恢复文件到之前的状态。

**提示**：使用 `git restore` 命令（Git 2.23+ 新增）。

**解答**：

```bash
git restore filename
```

</details>

<details>
<summary>第 53 关：conflict</summary>

**任务**：解决合并冲突。

**提示**：手动编辑冲突文件，然后标记为已解决。

**解答**：

1. 编辑冲突文件，删除冲突标记
2. 添加到暂存区：`git add filename`
3. 完成合并：`git commit`

</details>

<details>
<summary>第 54 关：submodule</summary>

**任务**：使用子模块。

**提示**：使用 `git submodule` 命令管理子模块。

**解答**：

```bash
git submodule add https://github.com/example/repo.git
```

</details>

<details>
<summary>第 55 关：contribute</summary>

**任务**：为开源项目贡献代码。

**提示**：这一关是鼓励你为开源项目做贡献！

**解答**：

恭喜你完成了所有关卡！现在你可以：

1. Fork 一个你感兴趣的开源项目
2. Clone 到本地并创建新分支
3. 做出改进并提交
4. 推送到你的 Fork
5. 创建 Pull Request

</details>

</details>

## 进阶技巧

完成 55 关后，这里总结一些实际开发中的常用操作模式。

### 分支管理工作流

Git 的分支模型是其核心优势，理解分支操作对团队协作至关重要：

```bash
# 创建功能分支
git branch feature/user-auth

# 切换到分支
git checkout feature/user-auth

# 创建并切换（推荐方式）
git checkout -b feature/user-auth

# 查看所有分支（本地 + 远程）
git branch -a

# 合并分支（快进合并）
git merge feature/user-auth

# 合并分支（保留合并记录）
git merge --no-ff feature/user-auth

# 删除已合并分支
git branch -d feature/user-auth

# 强制删除分支（慎用）
git branch -D feature/user-auth
```

**推荐工作流**：

1. 从主分支创建功能分支
2. 在功能分支上开发和提交
3. 定期从主分支拉取更新并合并
4. 功能完成后合并回主分支
5. 删除已合并的功能分支

### 历史查询技巧

掌握历史查询能快速定位问题和理解代码演变：

```bash
# 查看完整提交历史
git log

# 单行格式查看（快速浏览）
git log --oneline

# 图形化展示分支结构
git log --graph --oneline --all --decorate

# 查看指定文件的修改历史
git log -p filename

# 按作者筛选
git log --author="username"

# 按时间范围筛选
git log --since="2024-01-01" --until="2024-12-31"

# 按提交信息关键词搜索
git log --grep="bugfix"

# 查看某次提交的详细信息
git show commit_hash
```

### 撤销与回退操作

**注意**：以下操作涉及历史修改，团队协作时需谨慎使用。

```bash
# 撤销工作区修改（未暂存）
git restore filename
# 或旧版命令
git checkout -- filename

# 取消暂存（保留修改）
git restore --staged filename
# 或旧版命令
git reset HEAD filename

# 修改最后一次提交
git commit --amend

# 回退到上一版本（保留修改）
git reset --soft HEAD^

# 回退到上一版本（不保留修改）
git reset --hard HEAD^

# 回退到指定版本
git reset --hard commit_id

# 创建反向提交（安全撤销）
git revert commit_id
```

**reset 参数说明**：

- `--soft`：仅移动 HEAD，保留暂存区和工作区
- `--mixed`（默认）：重置暂存区，保留工作区
- `--hard`：重置暂存区和工作区，彻底丢弃修改

## 结语

通过 Githug 的 55 个关卡，你已经系统地学习了 Git 版本控制的核心知识：

**基础能力**：

- Git 仓库的初始化与配置
- 文件的添加、提交、删除操作
- 工作区、暂存区、版本库的状态管理

**进阶技能**：

- 分支的创建、切换、合并与删除
- 远程仓库的协作流程
- 提交历史的查看与修改
- 冲突的识别与解决

**高级应用**：

- 交互式 rebase 的使用
- Cherry-pick 的精确提交选择
- Bisect 的二分查找调试
- Submodule 的模块化管理

### 持续学习建议

Git 是一个博大精深的工具，掌握基础后建议：

1. **实践为主**：在实际项目中应用所学知识，遇到问题时查阅文档
2. **理解原理**：深入学习 Git 的三区模型、对象模型等底层机制
3. **规范协作**：学习 Git Flow、GitHub Flow 等团队协作规范
4. **工具辅助**：熟练使用 Git GUI 工具（如 SourceTree、GitKraken）提高效率

### 遇到问题？

- 使用 `git help <command>` 查看命令帮助
- 阅读 [Pro Git](https://git-scm.com/book/zh/v2) 这本经典书籍
- 在 [Stack Overflow](https://stackoverflow.com/questions/tagged/git) 搜索相关问题
- 参考 [Git 官方文档](https://git-scm.com/doc) 获取权威说明

坚持练习，你一定能成为 Git 高手！

## 参考资源

### 官方文档

- [Git 官方文档](https://git-scm.com/doc) - 最权威的 Git 参考手册
- [Pro Git 中文版](https://git-scm.com/book/zh/v2) - Git 官方推荐书籍，免费在线阅读
- [Git Reference](https://git-scm.com/docs) - 命令行参考速查

### 学习教程

- [廖雪峰的 Git 教程](https://liaoxuefeng.com/books/git/) - 适合初学者的中文教程
- [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN) - 可视化交互学习分支操作
- [Githug 项目仓库](https://github.com/Gazler/githug) - 本文介绍的闯关游戏

### 工作流规范

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) - 经典的分支管理模型
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) - GitHub 推荐的简化工作流
- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) - 提交信息规范

### 可视化工具

- [SourceTree](https://www.sourcetreeapp.com/) - 免费的 Git GUI 客户端
- [GitKraken](https://www.gitkraken.com/) - 跨平台的 Git 图形化工具
- [GitHub Desktop](https://desktop.github.com/) - GitHub 官方桌面客户端
