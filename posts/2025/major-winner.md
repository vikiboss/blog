---
title: '我写了一个 CS2 Major 竞猜在线抄作业项目'
date: 2025-12-08
topic: '生活'
excerpt: '快进来抄作业，Major 钻石币在向你招手。'
tags:
  - 'CS2'
  - 'Major'
  - '竞猜'
  - '前端开发'
  - '项目实战'
top_image: 'https://s2.loli.net/2025/12/08/4arLDptGVYHuwc3.png'
---

[Counter-Strike 2](https://www.counter-strike.net/)（反恐精英 2，也称 CS2） 是由 Valve 开发并发行的一款在线射击游戏，是 Counter-Strike: Global Offensive（反恐精英：全球攻势，也称 CSGO）的续作。CS2 采用全新的起源 2（Source2）引擎开发，不仅推出了新式烟雾弹和子刷新频率构架等更新，游戏的画质也得到了大幅升级、地图也翻新制作，是 [Steam 上最热门的游戏](https://store.steampowered.com/charts/mostplayed)。

![CS2 官网首页截图](https://s2.loli.net/2025/12/08/WXmcYnghykU5QIq.png)

Major 是 CS2 中最重要的赛事，一般每年举办两次。在 Major 期间，游戏内会推出相应的活动，其中就有竞猜系统，玩家可以通过这个竞猜系统来预测比赛结果，预测成功可以完成竞猜任务，完成一定数量的任务可以持续升级赛事纪念币，并获得丰厚奖励。

![Major 竞猜奖励](https://s2.loli.net/2025/12/08/VIloCRY8hmbU243.png)

![Major 竞猜界面](https://s2.loli.net/2025/12/08/5a6TfV2hxKukgqi.png)

Major 竞猜凭借着它 3000 万+ 月活的庞大玩家群体基础，和它本身的趣味性和娱乐性，吸引了大量玩家关注，其中就包括我，~~虽然上半年的奥斯汀 Major 我绞尽脑汁只拿了个银币，都怪菊花队，这届奥斯汀 Major 能拿钻石币的都是什么神人。~~

在近几次的 Major 期间，有多位 UP 主搜集了大量主播竞猜情况并将其汇总成图片，在各大社交媒体、群聊间被转发传阅参考。今年的 Major 在布达佩斯（Budapest，匈牙利的首都）举办，依然有不少 UP 主在赛前搜集主播的竞猜作业（比赛竞猜情况，俗称「作业」，参考他人的竞猜作业，也称「抄作业」）并制作了汇总图片供大家参考。例如来自 B 站的 [@原劫色](https://space.bilibili.com/472947493) 和 [@三米七七](https://space.bilibili.com/1428295) 等 UP 主，他们发布了多篇相关视频，汇总了大量主播竞猜作业：

![主播 Major 竞猜作业一览图](https://s2.loli.net/2026/01/30/JdLXDSIsgkAhw8u.png)

然而，单纯依靠图片来追踪竞猜进度并不方便，需要自己一个个人眼对照核对，非常的反人类。比如上图的布达佩斯 Major 第一阶段作业汇总，在比赛进行到一半时，通过人眼核对可以知道大家的 3-0 和 0-3 都炸的差不多了，极少主播的竞猜还能生还，~~真惨吧~~，但具体是谁还需要一个个去对照，效率极低。

这不，需求来了！作为一个搬了两三年砖的前端开发，为了更高效地参考和跟踪主播竞猜进度，我决定动手写一个在线抄作业项目，将这些主播竞猜作业数据结构化，并提供便捷的查询和排名等功能。

我选用了 [Next.js](https://nextjs.org/) 作为项目框架，花了几天和 [Claude Code](https://www.claude.com/product/claude-code) 斗智斗勇，又当产品又当设计还修 bug，然后手动识别和填充了十几位主播的竞猜数据，终于取得了阶段性进展，目前已经可用并上线了。

![Major Winner 主界面](https://s2.loli.net/2025/12/11/c567EkBWbfYV9Xm.png)

目前支持的功能包括：比赛进度展示、主播竞猜排行、主播阶段作业查询、队伍晋级情况等。功能还比较基础，但已经能大幅提升参考和跟踪 Major 竞猜进度的效率。如果后续有时间和精力，我还会继续完善更多功能。

如果你也对 CS2 Major 竞猜感兴趣，或者有类似的抄作业、跟踪赛事进度的需求，不妨试试这个在线抄作业项目：[major.viki.moe](https://major.viki.moe/)。

如果你是主播或者 UP 主，并且愿意分享你的 Major 竞猜作业数据，欢迎通过我的邮箱 [hi@viki.moe](mailto:hi@viki.moe) 与我联系，我会将你的数据添加到项目中，帮助更多的玩家更好地参考和跟踪 Major 竞猜进度。

此外，如果你有任何的建议和反馈，也欢迎在 [GitHub Issue](https://github.com/vikiboss/major-winner/issues) 里交流，也欢迎大家参与贡献。

- 在线地址: [major.viki.moe](https://major.viki.moe/)
- 源码仓库: [vikiboss/major-winner](https://github.com/vikiboss/major-winner)
- 交流群：[902511365](https://qm.qq.com/q/oiHxyHNfl6) （Major Winner）
