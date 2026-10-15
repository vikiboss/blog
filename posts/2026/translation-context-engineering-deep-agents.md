---
title: '[译] 上下文工程：Deep Agents 如何记住一切'
date: 2026-10-15
topic: '技术'
excerpt: '五种上下文工程技术对抗上下文腐烂，给模型减负的同时不丢任何细节。'
isOriginal: false
author: 'Jess Weng'
tags:
  - 'AI'
  - '智能体'
  - 'LangChain'
  - '上下文工程'
  - '翻译'
---

> 原文：Context Engineering: How Deep Agents Remember
>
> 时间：2026 年 10 月 14 日
>
> 作者：Jess Weng
>
> 链接：https://www.langchain.com/blog/context-engineering-deep-agents-remember

---

如果你曾在考前一晚临时抱佛脚，一定熟悉这种感觉：越往后复习，前面的章节越记不住。

智能体也有同样的问题。随着任务越做越长，它们接收的信息（指令、工具结果、文件等）越来越多；最终，这些 [上下文](https://docs.langchain.com/oss/python/langchain/context-engineering) 会多到模型的 **上下文窗口** 装不下。模型携带的历史、噪声和工具输出越多，它的准确率和推理能力往往就越差。

在智能体工程领域，我们把这叫做 [上下文腐烂（Context Rot）](https://news.ycombinator.com/item?id=44308711#44310054)。本文会介绍管理智能体上下文窗口的各种技术，以及 Deep Agents 这个 Harness 如何借助「中间件（Middleware）」的概念，把这些技术注入智能体的运行过程。

## 理解上下文工程技术

简化来说，一个智能体就是包在一层 Harness 里的模型。

![Harness = 包裹着模型（LLM）](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ac7d0681e478429d6f14812_agent-harness-light.png)

智能体手头可用来对抗上下文腐烂的上下文工程技术，主要分为两类：

- 阻止不必要的信息 **进入** 上下文窗口
- 管理和过滤 **已经在** 上下文窗口里的内容

Harness 会有策略地运用这些方法，让模型在执行给定任务时 **在恰当的时机拿到恰当的上下文**。

不过，要搭好一个能把这些事真正做好的 Harness，说来容易做来难，需要下不少功夫。如果你就是考前一晚才突击复习的那种人，那这活儿可能就太多了。

[Deep Agents](https://www.langchain.com/deep-agents) 是 LangChain 的开源 Harness。它把你选择的模型包起来，用各种技术把上下文移出活跃窗口（放进文件、摘要或另一个智能体），让主智能体只携带必要的内容（日后需要时还能找回原始数据）：

1. **转存（Offloading）：** 大体积的工具结果和用户消息会保存到文件系统，模型只看到一份预览。
2. **摘要压缩（Summarization）：** 对话接近上下文上限时，较早的消息会被压缩成一段摘要。
3. **技能（Skills）：** 任务经验只在模型判定相关时才加载。
4. **子智能体（Subagents）：** 嘈杂的工作在独立的上下文窗口里运行，只把结果带回来。
5. **长期记忆（Long-term memory）：** 智能体学到的东西保存到文件里，延续到下一次对话。

## 把上下文工程技术应用到常见用例

来看看上述技术如何应用到一个真实用例：竞品分析智能体。每周一，这个智能体研究五个竞争对手，并按团队模板写一份报告。单次运行大致是这样：

1. 拉取 A 公司的市场数据导出（几万行）
2. 搜索新闻，读几篇文章，做笔记
3. 对 B 到 E 公司重复以上步骤
4. 起草报告，根据你的反馈修改，然后排版

到第 4 步时，智能体已经带着五份原始导出、几十条搜索结果和两版过时草稿跑过了每一次模型调用，而这些内容大部分对排版最终报告毫无用处。

检索方法（[RAG](https://docs.langchain.com/oss/python/deepagents/rag) 或文件系统搜索）能帮智能体只拉取 **需要** 的内容，但这只解决了问题的一半。再精准的智能体也会积累无用的消息、工具结果和中间产物，所以 Harness 还必须管理上下文窗口里和窗口周边已有的内容。

## 如何实现这些技术：中间件

智能体以循环方式运行：模型决定做什么，调用工具读取结果，如此往复直到任务完成。[中间件](https://docs.langchain.com/oss/python/langchain/middleware/overview) 是插入循环中特定节点的代码：比如智能体启动之前、每次模型调用前后或每次工具调用前后。

- 在每个节点上，它都可以读取上下文，并在下一步运行前修改上下文。
- 本文中的每一项上下文工程技术，都是挂在这些节点上的一件中间件。
  - 其中大部分是内置的，所以使用这些技术不需要自己写中间件（除非你想定制特定环节）。

## 转存：把内容挡在上下文窗口之外

智能体并不总需要看到每次工具调用或人类消息返回的 **全部** 数据，数据量特别大时更是如此。

举个例子，每次 `pull_market_report` 工具调用都会返回一份完整的数据导出（几千行）；但智能体只需要其中的几个数字，因此可以限制模型只看到那几行。

![工具结果转存过程（动图）](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ac7d16728e8261fa2436c9a_context-offloading-light.gif)

FilesystemMiddleware 在每次工具调用时运行：

1. 当工具结果超过约 20000 token 时，完整结果会在进入对话前写入 `/large_tool_results/{tool_call_id}`。
2. 模型只看到一段简短预览（开头和结尾的几行）加上文件路径。
3. 之后智能体需要 B 公司的季度营收时，用 `read_file` 翻查这个文件即可。

超大体积的用户消息（比如粘贴进来的一份通话记录）也会得到同样处理，只是阈值更高（50000 token），并保存到 `/conversation_history/`。

## 摘要压缩：把已有的内容压实

就算我们想尽办法转存冗长的工具调用，在一次长时间运行中（比如五家公司的搜索、笔记和草稿），上下文还是会逐渐堆积。摘要压缩可以把智能体整个上下文窗口凝结成一段「到目前为止发生了什么」的摘要，让它继续推进研究任务。

![转存拦住了小尖峰，摘要压缩则「重置」了整体攀升](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ac7d1ec1e9634285e74f7ec_context-management-light-1.png)

- 图中的尖峰是大工具结果或人类消息到达时产生的；转存在模型看到它之前，就把每一份换成了简短预览，所以上下文只增长一点点。
- 摘要压缩负责应对缓慢攀升：一旦用量达到 85%，较早消息就被压缩成摘要，上下文随之回落。

SummarizationMiddleware 会在每次模型调用前检查 token 用量：

1. 一旦用量越过阈值（默认为 85%），一次独立的 LLM 调用会把较早的消息凝结成一段摘要。
2. 较早的消息从上下文窗口移除，最近的消息则原封不动保留。
3. 模型先看到摘要，再看到最近的消息（最近的内容不会被转述）。

两个重要细节：

- **可以找回。** 被摘要的消息会写入 `/conversation_history/{session_id}.md`。如果智能体在起草报告时需要 A 公司研究中的某个细节，它可以读回来。
- **会循环发生。** 随着运行继续，用量会再次攀升，下一次摘要会包含上一段摘要。

**你也可以在话题切换时触发摘要**，而不只在阈值触发。定制摘要提示词有时会很有帮助。

![转存与摘要压缩对比](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6acfbe0540e67f7ab8076547_offloading-vs-summarization-table-transparent.png)

我们的另一篇文章 [Deep Agents 的上下文管理](https://www.langchain.com/blog/context-management-for-deepagents) 对两者都有更详细的介绍。

## 技能：信息只在需要时才加载

![](https://www.youtube.com/watch?v=bv1qgkbWhms)

假设你的销售团队对季度业务回顾（QBR）有固定的格式要求。智能体一个季度只需要这些指令一次，把它们放在系统提示词里，意味着每次调用都要为此付出代价（token 和响应时间）。正确的做法是把这类信息打包成一个技能。

技能是一个由指令组成的文件夹，可附带脚本和参考文档，提供完成某项专门任务所需的一切。

![技能文件夹的解剖结构](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ac7d428941b180be1e389ce_skill-anatomy-light.png)

智能体预先只看到一段简短描述，只在 QBR 真正出现时才加载 `qbr-report` 的完整指令，其他任务则永远不会携带它们。

技能按层级加载上下文，所以在真正相关之前，上下文窗口一直保持很小。这叫做渐进式披露（Progressive Disclosure）：模型先看到一份「菜单」，需要时才把完整配方拉进来，所以十个技能的上下文成本大约只相当于十行简介。

![渐进式披露（动图）](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ac7d44dddd1bd24cf8c1560_skills-progressive-disclosure-light.gif)

你把技能的位置告诉智能体，SkillsMiddleware 会用到两个钩子：

1. 智能体启动前，它扫描技能文件夹，只读取每个 SKILL.md 的头部。
2. 每次模型调用时，它把这些名称和描述加入系统提示词。

只有当模型判定某个技能相关（并用 `read_file` 工具读取它）时，完整指令才进入上下文。所以我们的智能体在研究阶段并不携带报告模板，直到该排版 QBR 时才加载它。

## 子智能体：把嘈杂的工作隔离出去

转存能有效对付超大的结果，但对于你 **明知** 会很嘈杂的工作（比如跨越几十次搜索和网页来研究一家公司），子智能体是更好的设计选择。子智能体在它自己的上下文窗口里完成这类工作，只返回最终结果，主智能体从头到尾都看不到那些「噪声」。

![子智能体把嘈杂的工作隔离在独立上下文中](https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/6ac7d4926b0fa2c1f904c517_subagents-light-still.png)

SubAgentMiddleware 允许我们定制子智能体的系统提示词和可用工具。

```python
market_researcher = {
    "name": "market-researcher",
    "description": "Researches a company and returns the 3 most notable developments.",
    "system_prompt": "Use pull_market_report, then return 3 short bullet points. Do not return the raw report.",
    "tools": [pull_market_report],
}

agent = create_deep_agent(model=model, subagents=[market_researcher])
```

在我们的例子里，主智能体把每家公司都交给 market-researcher 子智能体。

研究子智能体在自己的上下文里读完整报告，只返回三个要点，所以主智能体只看到这三个要点（连原始报告的预览都看不到）。另外，子智能体的任务通常小而明确，往往可以跑在更便宜的模型上，并且可以并行。

## 长期记忆：跨会话持久化

到这一步，你的智能体已经学到了很多。有些有用，有些没用。

假设你对智能体说：「摘要里用要点列表，不要用段落。」没有记忆的话，这句话你可能每周都要重复一遍。在 Deep Agents 中，长期记忆就是一个 markdown 文件。你用一个参数把文件位置告诉智能体，剩下的交给 MemoryMiddleware：

1. **加载：** 运行开始时读取该文件。
2. **注入：** 每次模型调用时，把文件内容加入系统提示词。
3. **更新：** 当智能体学到值得保留的东西（比如你的格式偏好）时，它会更新这个文件。

## 换个模型，保留记忆

Deep Agents 不绑定任何提供商，这一点也延续到了记忆上。因为记忆只是你自己存储里的一个普通文件（而不是握在某个提供商手里的东西），你可以把同一套后端指向另一个模型：

```python
agent = create_deep_agent(
    model="openai:gpt-6",  # 换个提供商，记忆不变
    memory=["/memories/AGENTS.md"],
    backend=backend,
    store=store,
)
```

到了下周，另一个模型读取同一个文件，依然会用要点列表来写摘要。

## 值得铭记的上下文工程策略

无论你基于 Deep Agents 构建、使用别的 Harness，还是自己造一个，以下几点都值得注意：

- **大输入应该转存，而不是截断。** 截断是有损的；转存让它保持可找回。
- **压缩应该可恢复。** 摘要之后，智能体依然能拿回所需的细节。
- **技能应该按需加载。** 把所有技能的指令塞进系统提示词，会让每次调用都付出上下文代价。
- **嘈杂的工作应该隔离。** 拥有独立上下文的子智能体让主智能体保持专注。
- **记忆应该归你所有。** 存在你自己控制的存储里的记忆，才能在更换模型或提供商后幸存。
- **默认值应该可定制。** 适合一个任务的阈值，很少能适合所有任务。

## 动手试试

```shell
uv add deepagents
```

---

## 译者注

本文由 AI 辅助翻译，译者进行了后期润色和校对。
