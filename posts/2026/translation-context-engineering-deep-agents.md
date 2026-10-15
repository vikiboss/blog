---
title: '[译] 深度 Agent 的上下文工程：如何记住而不必把一切都放进上下文'
date: 2026-10-15
topic: '技术'
excerpt: 'Deep Agents 用卸载、摘要、技能、子代理和长期记忆五种中间件技术对抗上下文腐烂。'
isOriginal: false
author: 'Jess Weng'
tags:
  - 'AI'
  - 'Agent'
  - '上下文工程'
  - '翻译'
---

> 原文：Context Engineering with Deep Agents: How To Remember Without Keeping Everything In Context
>
> 时间：October 14, 2026
>
> 作者：Jess Weng
>
> 链接：https://www.langchain.com/blog/context-engineering-deep-agents-remember

---

如果你曾经在考前一晚突击复习，你一定懂这种感觉：学得越多，最开始看的章节就越记不清。

Agent 也有同样的问题。随着任务变长，它们承载的信息（指令、工具结果、文件等）越来越多，最终这些[上下文](https://docs.langchain.com/oss/python/langchain/context-engineering)会远超模型*上下文窗口*所能从容容纳的量。模型携带的历史、噪声和工具输出越多，其准确率和推理能力就越容易变差。

在 Agent 工程领域，我们把这称为 [context rot（上下文腐烂）](https://news.ycombinator.com/item?id=44308711#44310054)。这篇文章介绍管理 Agent 上下文窗口的技术，以及 Deep Agents 这个 harness 如何通过一个叫中间件（middleware）的概念把它们注入到 Agent 的运行过程中。

### 理解上下文工程技术

简单来说，一个 Agent 就是包着一层 harness 的模型。

Harness = 包裹在模型（LLM）外围的一层

Agent 手头可用于对抗上下文腐烂的上下文工程技术主要分为两类：

- 防止不必要的信息*进入*上下文窗口
- 管理和过滤*已经在*上下文窗口里的内容

Harness 会有策略地应用这些方法，让模型在给定任务中**在正确的时刻拿到正确的上下文**。

不过，要把一个 harness 做好说起来容易做起来难，需要下很大功夫（如果你是那种考前一晚才突击的人，这工作量可能有点太大了）。

[Deep Agents](https://www.langchain.com/deep-agents) 是 LangChain 的开源 harness。它包裹住你选择的模型，用各种技术把上下文*移出*活跃窗口（放进文件、摘要或一个独立的 Agent），这样主 Agent 只携带必要的内容（需要时仍可取回原始数据）：

1. **卸载（Offloading）**：大的工具结果和用户消息保存到文件系统，模型只看到预览。
2. **摘要（Summarization）**：对话接近上下文上限时，把较旧的消息压缩成摘要。
3. **技能（Skills）**：任务相关的知识只在模型判断其相关时才加载。
4. **子代理（Subagents）**：嘈杂的工作在独立的上下文窗口中运行，只把结果传回来。
5. **长期记忆（Long-term memory）**：Agent 学到的东西保存到文件，延续到下一次对话。

## 将上下文工程应用于常见场景

来看看上述技术如何应用到一个真实场景：竞品分析 Agent。每周一，这个 Agent 研究五个竞争对手，并按团队模板撰写报告。单次运行大致如下：

1. 拉取公司 A 的市场数据导出（数万行）
2. 搜索新闻、读几篇文章并做笔记
3. 对公司 B 到 E 重复上述过程
4. 起草报告、根据你的反馈修改，然后排版

到第 4 步时，Agent 已经在每次模型调用中背上了五份原始导出、几十条搜索结果和两版旧草稿。对最终报告的排版来说，这些内容大部分都是无关的。

检索方法（[RAG](https://docs.langchain.com/oss/python/deepagents/rag) 或文件系统搜索）能帮 Agent 只拉取需要的内容，但这只解决了一半问题。即使是一个精准的 Agent 也会积累不必要的消息、工具结果和中间产物，所以 harness 还必须管理上下文窗口内部和周边已有的内容。

## 如何实现这些技术：中间件

Agent 以循环方式运行：模型决定做什么、调用工具、读取结果，如此往复直到任务完成。[中间件](https://docs.langchain.com/oss/python/langchain/middleware/overview)是插入到这个循环特定节点的代码：比如 Agent 启动之前、每次模型调用前后、或每次工具调用前后。

- 在每个节点上，它都可以读取上下文，并在下一步运行之前修改它。
- 本文中的每项上下文工程技术，都是挂载在这些节点上的一块中间件。

  - 这些大部分都是内置的，所以使用这些技术不需要自己写中间件（除非你想定制某些细节）。

## 卸载：把内容挡在上下文窗口之外

我们的 Agent 并不总是需要看到每次工具调用或人类消息返回的*全部*数据，尤其是在数据量很大的时候。

例如，每次 `pull_market_report` 工具调用都会返回完整的数据导出（数千行），但 Agent 只需要其中的几个数字，因此可以限制模型只看到那几行。

工具结果卸载流程（动图演示）

FilesystemMiddleware 会在每次工具被调用时运行：

1. 当工具结果超过约 20,000 token 时，完整结果会先写入 `/large_tool_results/{tool_call_id}`，然后才进入对话。
2. 模型只看到一段简短预览（开头和结尾的几行）以及文件路径。
3. 之后当 Agent 需要公司 B 的季度营收时，可以用 `read_file` 翻阅这个文件。

超大的用户/人类消息（比如粘贴的一份通话记录）会得到同样的处理，但阈值更高（50,000 token），保存到 `/conversation_history/`。

## 摘要：压缩已有的内容

尽管我们尽力卸载冗长的工具调用，在长时间运行中上下文还是会逐渐堆积（比如五家公司的搜索、笔记和草稿）。摘要技术可以把 Agent 整个上下文窗口压缩成一份「目前为止发生了什么」的总结，让它得以继续研究任务。

卸载挡住了小尖峰，而摘要则「重置」整体攀升趋势

- 尖峰是大型工具结果/人类消息的到来；卸载在模型看到之前把每一份都换成简短预览，所以上下文只增长一点点。
- 摘要负责应对缓慢的攀升：一旦用量达到 85%，较旧的消息被压缩成摘要，上下文随之回落。

SummarizationMiddleware 会在每次模型调用前检查 token 用量：

1. 一旦用量跨过阈值（默认为模型上下文窗口的 85%），一次独立的 LLM 调用会把较旧的消息压缩成一份摘要
2. 较旧的消息从上下文窗口中移除，而最近的消息原样保留
3. 模型现在先看到摘要，再看到最近的消息（这样最新的内容不会被改写转述）

两个重要细节：

- **可恢复。** 被摘要的消息会写入 `/conversation_history/{session_id}.md`。如果 Agent 在起草报告时需要公司 A 研究中的某个细节，它可以读回来。
- **可循环。** 随着运行继续，用量再次攀升，下一次摘要会包含上一次的摘要。

**你也可以在话题切换时触发摘要**，而不只是在某个 token 阈值处。自定义摘要的 prompt 往往很有帮助。

我们另一篇文章 [Deep Agents 的上下文管理](https://www.langchain.com/blog/context-management-for-deepagents)对这两点有更详细的介绍。

## 技能：只在需要时加载信息

假设你的销售团队对季度业务回顾（QBR）有特定的格式要求。Agent 一个季度才需要一次这些指令，把它们常驻在系统 prompt 里，意味着每次调用都要为它们付出代价（token 和响应时间）。更好的做法是把这些信息打包成一个技能（skill）。

技能是一个文件夹形式的指令包（可附带脚本和参考文档），为 Agent 提供完成某项专门任务所需的一切。

技能文件夹的构成

Agent 一开始只看到简短描述，只在真正遇到 QBR 时才加载 `qbr-report` 的完整指令（其他任务永远不会携带它们）。

技能按层级加载上下文，所以在真正相关之前，窗口始终保持很小。这叫渐进式披露（progressive disclosure）：模型先看到一份「菜单」，需要时才取出完整菜谱，所以十个技能占用的上下文大约只相当于十行简介。

渐进式披露（动图演示）

你把技能目录指给 Agent，SkillsMiddleware 使用两个钩子：

1. Agent 启动之前，它扫描技能文件夹，只读取每个 SKILL.md 的头部。
2. 每次模型调用时，它把这些名称和描述加入系统 prompt。

完整指令只在模型判断某个技能相关时才进入上下文（通过 `read_file` 工具读取），所以我们的 Agent 平时做研究不携带模板，直到需要排版 QBR 时才加载它。

## 子代理：隔离嘈杂的工作

卸载能有效对付超大的结果，但子代理是那种你*明知*会很嘈杂的工作（比如跨几十次搜索和页面研究一家公司）的好选择。子代理在它自己的上下文窗口中完成这些工作，只返回最终结果，主 Agent 从头到尾都看不到那些「噪声」。

SubAgentMiddleware 让我们可以自定义子代理的系统 prompt 和可用工具。

```python
market_researcher = {
    "name": "market-researcher",
    "description": "Researches a company and returns the 3 most notable developments.",
    "system_prompt": "Use pull_market_report, then return 3 short bullet points. Do not return the raw report.",
    "tools": [pull_market_report],
}

agent = create_deep_agent(model=model, subagents=[market_researcher])
```

在我们的例子中，主 Agent 把每家公司交给 market-researcher 子代理。

研究子代理在自己的上下文中阅读完整报告，只返回三个要点，所以主 Agent 只看到这三个要点（连原始报告的预览都看不到）。另外，由于子代理的任务通常小而明确，它们往往可以用更便宜的模型运行，并且可以并行。

## 长期记忆：跨对话持久化

到最后，你的 Agent 会学到很多东西。有些有用，有些没用。

假设你告诉 Agent：「摘要里用要点列表，不要用段落。」没有记忆的话，你可能每周都要重复一遍。在 Deep Agents 中，长期记忆就是一个 markdown 文件。你用一个参数把 Agent 指向它，剩下的交给 MemoryMiddleware：

1. **加载**：运行开始时读取该文件。
2. **注入**：每次模型调用时，其内容加入系统 prompt。
3. **更新**：当 Agent 学到值得保留的东西（比如你的格式偏好）时，它会更新这个文件。

## 换模型，留记忆

Deep Agents 与提供商无关，这一点也延伸到了记忆。因为记忆是你自己存储中的一个普通文件（而不是攥在某个提供商手里的东西），你可以把同一个后端指向另一个模型：

```python
agent = create_deep_agent(
    model="openai:gpt-6",  # different provider, same memory
    memory=["/memories/AGENTS.md"],
    backend=backend,
    store=store,
)
```

到了下周，另一个模型可以读取同一个文件，依然用要点列表写摘要。

## 值得牢记的上下文工程策略

无论你是基于 Deep Agents 构建、使用其他 harness，还是自己造一个，以下几点值得注意：

- **大输入应该卸载，而不是截断。** 截断是有损的；卸载保证内容仍可取回。
- **压缩应该可恢复。** 摘要之后，Agent 仍能找回它需要的细节。
- **知识应该按需加载。** 把所有任务的指令都放进系统 prompt，意味着每次调用都要付出上下文代价。
- **嘈杂的工作应该隔离。** 拥有独立上下文的子代理让主 Agent 保持专注。
- **记忆应该归你所有。** 存放在你控制的存储里的记忆，才能在更换模型或提供商后幸存。
- **默认值应该可定制。** 适合某个任务的阈值，很少能适合所有任务。

## 试一试

```shell
uv add deepagents
```

想跟随现场讲师深入学习？我会在 11 月 3 日讲这个主题：在[这里](https://events.langchain.com/register/agent-memory-101-context-engineering/)报名！

**想更深入地学习上下文工程，可以看看 LangChain Academy 上免费的、自定节奏的** [**Deep Agents 课程**](https://about:blank)**。**

---

## 译者注

本文由 AI 辅助翻译，译者进行了后期润色和校对。原文含多张动图（工具结果卸载流程、渐进式披露等），因原文未提供可直接引用的静态图片地址，译文中以文字说明替代，具体演示请查看原文。
