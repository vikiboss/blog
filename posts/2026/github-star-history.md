---
title: 'GitHub 星星历史那些事儿'
date: 2026-09-10
topic: '技术'
excerpt: '本文站在用户视角，聊聊 Star History、GitHub 星星 API 的变动及其对前者服务的影响，以及后续官方和社区合作并最终解决问题的事情。'
tags:
  - 'GitHub'
  - 'Stargazer API'
  - 'Star History'
  - 'Star Count'
  - 'GitHub REST API'
---

几年前，我写了一个叫做 [原神助手](/genshin-helper) 的开源项目。那时还没有 AI，所有代码都是我一个字母一个字母敲出来的，非常注重用户体验。因为功能设计合理、界面美观好看，挺多玩家在用，也受到了许多知名账号的推荐。

有人用了，Star 自然也就开始一点一点地涨起来。对于开源社区来说，项目的星星（Star）数量很大程度上体现了该项目的受欢迎程度。为了能够比较直观地看到数量变化，加上平时不少逛 GitHub 社区，就看到很多项目用了 [Star History](https://www.star-history.com) 提供的免费 Star 历史图表，就像下面这样。

[![原神助手星星历史（新仓库数据，旧仓库被误封）](https://api.star-history.com/chart?repos=vikiboss/gs-helper&type=date&legend=top-left)](https://www.star-history.com/?repos=vikiboss%2Fgs-helper&type=date&legend=top-left)

接入很简单，只要在 README.md 里用图片语法插入项目的星星图链接就行，比如下面这样。

```markdown
![原神助手星星历史](https://api.star-history.com/chart?repos=vikiboss/gs-helper)
```

其中的 `vikiboss/gs-helper` 是仓库名称。基于此你可以很快拿到最近比价火的 DeepSeek Harness 的星星历史。

```markdown
![DSH 星星历史](https://api.star-history.com/chart?repos=deepseek-ai/deepseek-harness)
```

![DSH 星星历史](https://api.star-history.com/chart?repos=deepseek-ai/deepseek-harness)

额外提一嘴，今年二月，OpenClaw 超越 Linux 和 React，成为星星最多的项目，20 万颗星星花了 88 天。然而，DeepSeek Harness 只花了 15 天，打破了 OpenClaw 保持了近半年的记录。Star History 也支持多个项目一起比较，逗号分隔，注意 URL 编码，就像下面这样。

```markdown
![DSH vs OpenClaw](https://api.star-history.com/chart?repos=deepseek-ai/deepseek-harness%2Copenclaw/openclaw)
```

不得不说 DeepSeek Harness 还是很牛批的，已经上手有一阵子了，不管在架构设计、用户体验，还是「一切皆插件」的开发理念，都十分不错，基于 Web 平台暴露服务的方式，也了激发了更多可能，可以说是潜力无限。

![DSH vs OpenClaw （能看到增长速度明显更快）](https://api.star-history.com/chart?repos=deepseek-ai/deepseek-harness%2Copenclaw/openclaw)

扯远了，回到主题。像我的小项目一样，正因为这个需求很普遍，Star History 的服务被非常多项目依赖，甚至你都能在黄仁勋的演讲上看到这个项目的身影。

![黄仁勋在 GTO 2026 上展示 Star History 的图表](https://image.viki.moe/blog/github-star-history/c711b3.png)

因为它的简单、好用，在需要的时候能够恰好满足要求，所以我给新项目也安排上了。

![60s API 星星历史](https://api.star-history.com/chart?repos=vikiboss/60s)

![R2 Web 星星历史](https://api.star-history.com/chart?repos=vikiboss/r2-web)

一切都很简单，编辑仓库名，然后插入地址，就这么顺利，效果也非常好。

然而，从今年七月份开始，所有项目的星星历史统计服务不可用了，原因是 GitHub 限制了 Star History 数据访问。Star History 写了一篇 [博客](https://www.star-history.com/blog/github-stargazer-api-restriction) 说明这个事情。

大概意思是，GitHub 为了保护用户隐私，限制了 Stargazers API 的访问权限，只允许仓库所有者和协作者查看星标数据。Star History 的核心功能就是通过调用这个 API 获取每日星标记录，然后绘制项目的增长曲线。

API 被限制后，第三方服务无法再获取数据，导致对非所有者仓库的图表生成完全失效。这样一搞，导致生成星星历史图表变得非常复杂，阻力重重。你必须得为每个项目都生成一个访问 token，然后重新生成并更新 URL，同时你还不能生成任何没有权限的仓库的星星数据。

对当时的我来说，我宁愿删掉这一部分，也不愿意给每个项目重新搞一套复杂的流程，去放这样一个可有可无的东西。所以，我后续几乎默认为这个项目已经死了，不再关注，直到前几天看到 GitHub 官方发的一篇文章: [New API endpoint provides privacy-safe star history data](https://github.blog/changelog/2026-09-04-new-api-endpoint-provides-privacy-safe-star-history-data)。

![GitHub 发布了新的星标数据 API](https://image.viki.moe/blog/github-star-history/1ffc1c.png)

是的，事情等来了转机。

这篇文章大概意思是，GitHub 带来了一个新的隐私安全星标历史 API，无需 token，获取速度从分钟级降至秒级，无需个人访问令牌（PAT）即可使用，数据粒度细化到日。不难看出，这个 API 就是针对 Star History 这类项目专门定制的。

后面的发现证明我的猜想没错，而且在它背后，还藏着一段故事。

从七月初 GitHub 限制星标 API 开始，Star History 的作者 [Tim Qian](https://x.com/Tim_Qian) 不断收到社区的抱怨和问题报告，称其网站和 README 里的图表开始出现问题，Zod 的作者也 [参与了讨论](https://x.com/colinhacks/status/2074675719565959535)。

Tim Qian 后续发了篇 [抱怨的帖子](https://x.com/Tim_Qian/status/2074769819635962045)，指出了一个使用上问题，个人 token 无法用于组织项目，表明原 API 被限制后获取数据的方式阻力很大，而且对用户不友好。

![Tim Qian 的抱怨帖子](https://image.viki.moe/blog/github-star-history/ffd487.png)

不久之后，终于等来了转机。GitHub 开源团队的 [Ashley](https://github.com/ashleywolf) 主动联系了 Tim 并将他引荐给了 GitHub 工程团队并进行了长达 30 分钟的通话。Tim 在通话中解释了 Star History 的工作原理及其所需的数据，也就是随时间推移的星标数量，并不涉及用户数据。

大约一个月后，Ashley 向他介绍了 [Camilla](https://x.com/moraes_c_)，由她负责接手这项工作。Tim 在新功能到来之前一直在处理负面的项目报告。他觉得 GitHub 的限制是一个疏忽，它并没有意识到人们以这种方式使用星星 API。

后面，GitHub 团队开始构建一个专门的 API 来记录星星历史计数，并在此期间和 Tim 进行了多次会议和几轮电子邮件，让他得以顺利进行测试。新的 API 终于来了，如下。

```bash
GET /repos/{owner}/{repo}/stargazers/history
```

它按日历周分组星星，最新的一周排在最前面。每个条目包括该周开始的 Unix 时间戳、每周星星数量，以及一个 days 数组。每页最多包含 30 周，总页数限制为 100 页。这大约覆盖了 57 年，因此可以涵盖所有 GitHub 仓库。

```jsonc
[
  { "week": 1788048000, "total": 19, "days": [2, 1, 4, 4, 4, 3, 1] },
  { "week": 1787443200, "total": 23, "days": [5, 6, 3, 3, 4, 2, 0] },
  { "week": 1786838400, "total": 35, "days": [2, 7, 4, 6, 6, 6, 4] }
]
```

这个 API 一出来后，Star History 立马采用并部署。使用了新的 API 后，Star History 项目又焕发新生，限制少了很多，而且不管在性能还是准确度等维度上，都达到了前所未有的高度，服务再次稳定可用。至此，这个故事也就告一段落了。

我很喜欢开源社区之间的这种互动。

对于 GitHub 而言，它的变更是合理的，是出于用户隐私考虑的结果。但另一方面，它没有合理地评估影响，导致流行的开源服务崩溃。虽然他也没有责任为开源项目的稳定运行负责，但还是能过听取社区的声音并主动沟通跟进，然后努力和社区合作，最终达到了一个双赢的局面。

对于 Star History 项目而言，精准捕捉到用户需求但没有合适的实现途径，于是使用了一种「奇技淫巧」来实现，从结果和影响力上来说是好的，就是容易出现本文中的崩溃问题。好在，通过作者的抱怨和后续与 GitHub 团队的沟通，成功解决了这一问题。

所以说，变化未必就是坏的。如果不是这次服务中断，GitHub 会带来更好用的 API，然后 Tim 发布了更好用、更准确的 Star History 么？XD。

本文就这么多，感谢阅读。

最后，再附一张热门项目的星星历史图供对比参考。

[![热门项目星星历史](https://api.star-history.com/chart?repos=react/react%2Cvuejs/core%2Cvuejs/vue%2Ctorvalds/linux%2Copenclaw/openclaw%2Cdeepseek-ai/deepseek-harness%2Cmicrosoft/vscode%2Cnousresearch/hermes-agent%2Cthealgorithms/python%2Cvercel/next.js%2Cgolang/go&type=date&legend=top-left)](https://www.star-history.com/?repos=react%2Freact%2Cvuejs%2Fcore%2Cvuejs%2Fvue%2Ctorvalds%2Flinux%2Copenclaw%2Fopenclaw%2Cdeepseek-ai%2Fdeepseek-harness%2Cmicrosoft%2Fvscode%2Cnousresearch%2Fhermes-agent%2Cthealgorithms%2Fpython%2Cvercel%2Fnext.js%2Cgolang%2Fgo&type=date&legend=top-left)
