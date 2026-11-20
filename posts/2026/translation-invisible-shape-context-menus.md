---
title: '[译] 看不见的形状：上下文菜单与子菜单的几何学'
date: 2026-11-19
topic: '前端'
excerpt: '从 Mac 的「安全三角」到 Base UI 的速度预测，聊聊子菜单为何难以斜着穿过。'
isOriginal: false
author: 'Soren Blank'
tags:
  - '交互设计'
  - '上下文菜单'
  - '前端'
  - '用户体验'
  - '翻译'
---

> 原文：The Invisible Shape
>
> 时间：2026 年 10 月 1 日
>
> 作者：Soren Blank
>
> 链接：https://sorenblank.com/craft/the-invisible-shape

---

我相信每个用过电脑的人都用过「[菜单](https://en.wikipedia.org/wiki/Menu_%28computing%29)」，它就是一个展示给用户的选项列表。

菜单有很多类型。文本菜单、下拉菜单、垂直菜单、上下文菜单，可能还有我想不起来的。

我觉得我们最常接触的大概是「[上下文菜单](https://en.wikipedia.org/wiki/Context_menu)」或者叫「[弹出菜单](https://en.wikipedia.org/wiki/Context_menu)」。上下文菜单在现代界面里随处可见，几乎你能想到的所有现代软件都在大量使用它。

在我自己为 Web 编写上下文菜单组件时，发现了大型上下文菜单和子菜单带来的一些问题。于是我一头钻进了兔子洞。

今天我们就来探索这个洞里的几个角落。

## 一点历史

1976 年，Xerox Alto 上的 Smalltalk-76 系统提出了第一个真正可用的弹出式上下文菜单（以及许多其他东西）。

![在 Xerox Alto 上运行的 Smalltalk-76](https://image.viki.moe/blog/context-menu/0cffd4.png)

让这一切成为可能的人是 Dan Ingalls。他发明了 `BitBlt`，一个可以把一块像素极快地从一个位置复制到另一个位置的操作。正是它让菜单能弹在屏幕上任何内容之上，再收起来，而不必重绘一切。这在今天听起来很无聊。可当年没人见过这种东西。当 Dan 在 PARC 演示它时，L Peter Deutsch 从椅子上跳了起来，说：**「你刚才是不是做了我以为你做的那个事？」**

1979 年，Steve Jobs 谈成了一笔交易，允许 Apple 的工程师访问 Xerox PARC，作为交换 Apple 的股票。Steve 被 Xerox 当时的 GUI 震撼了。那是一个原创的想法。

<video loading="lazy" src="https://assets.sorenblank.com/craft/the-invisible-shape/steve-jobs-xerox-parc.099f5f5401.webm" controls></video>

> 他们给我看了，呃，三样东西，但我被第一样晃得眼花，另外两样根本没看清。[……] 我被他们展示的第一样东西彻底镇住了，那就是图形用户界面。我觉得那是我这辈子见过最棒的东西……而且，你知道，不到十分钟我就明白，所有电脑早晚都会这样工作。
>
> —— Steve Jobs 谈访问 Xerox PARC

他们在 Xerox PARC 看到的许多概念深刻影响了 Apple Lisa 和 Macintosh 操作系统的设计与开发，最终被整个行业采纳。

冷知识：1984 年的第一台 Mac 根本没有子菜单。它们直到 1987 年才随 Mac II 和 Mac SE 出现。而我们的问题就是从那里开始的。

## 为什么会有这个问题

没人想看到一个列着 50 个条目的菜单。那看起来是这样的。

![光标缓缓穿过一个包含二十多个条目的扁平上下文菜单，沿途滚动菜单，抵达最后一项后再一路返回。](https://image.viki.moe/blog/context-menu/af7e4e.png)

解决这种杂乱最好的办法是按层级组织条目，使用嵌套菜单或子菜单。默认全部收起，只在用户真的想看时才展开子菜单，这样界面就能保持干净。

![一个整洁的图片文件上下文菜单。光标从上方沿弧线移到 Open，再下落到 Open With，旁边立刻展开子菜单，列出默认应用 Preview，然后是 Photos、TextEdit，以及 App Store 和 Other 两个出口。](https://image.viki.moe/blog/context-menu/31794c.png)

在早期软件里，要展开子菜单，用户必须把光标从主条目出发，沿一条精确的直线拖过去。只要光标有一瞬间偏出父条目，菜单就会立刻收起。你没法斜着移动。

在这里，从「Open With」到「Other」的最短路径恰恰是斜着走。

![同一个上下文菜单，Open With 的子菜单已展开，通往最后一项 Other 有两条路径。先是光标沿绿色的 L 形路线：顺着 Open With 这一行进入子菜单，再垂直向下，依次高亮每个应用，抵达 Other 后原路返回。接着光标尝试瞄准同一项的红色斜线：出发不久就偏出 Open With 这一行，子菜单消失，光标继续掠过 Move to Trash 和 Get Info，最后落在子菜单原本所在的空白处。](https://image.viki.moe/blog/context-menu/4af8fd.png)

相信我你不会想这么做的。它又慢又累，而且每天会无数次偏出父菜单，然后把子菜单收掉。

Bruce Tognazzini（Tog）创立了 Apple 的人机界面小组，他解释得比我好：

> 最初设计层级菜单的工程师，显然是把手前臂装在了轨道上，这样才能完美地水平移动，不带任何垂直分量。可我们大多数人的前臂，是装在一个我们喜欢叫作肘部的支点上的。
>
> Bruce Tognazzini，《A Quiz Designed to Give You Fitts》

你的手走的是弧线，不是直线。所以你想横着走的时候，总会往下滑。

这事其实有定律。[转向定律](https://en.wikipedia.org/wiki/Steering_law)（Steering Law）说，穿过一条通道所需时间随通道长度增加，随通道宽度减少：`T = a + b × (A / W)`。横向穿过父条目进入子菜单，就是一条和菜单一样长、却只有一行高的通道。又长又窄最糟的那种。为了让标签更长而加宽菜单，通道只会更长。

![为了让标签更长而加宽菜单，通道只会更长。](https://image.viki.moe/blog/context-menu/ee8e59.png)

## 怎么解决

怎样才能让光标可以 [斜着走](https://harrypotter.fandom.com/wiki/Diagon_Alley)（Diagon Alley），同时保证子菜单不会收起，光标也不会误聚焦到别的菜单？

这在现代软件里已经是解决过的问题了。但背后的机制在每款软件里都不太一样，所以每种方案的行为也略有差异。

而且它很久以前就被解决了。还是 Tog，说的是 Mac：

> 上世纪 80 年代中期我设计 Mac 层级菜单算法时，提出过一个形状像 `<` 的缓冲区，这样用户在靠近子菜单时可以容忍越来越大的误差，而不必担心跳到不想去的菜单。只要指针平均每向下移动一像素就横向移动几个像素，无论移动得多慢，菜单都会保持展开。
>
> Bruce Tognazzini，《A Quiz Designed to Give You Fitts》

那个 `<` 就是那个看不见的形状。下面几乎所有内容都是它的某个版本。

我遇到过最常见的方案有：

- 使用超时
- 放置曲线 SVG 或隐藏路径来填补间隙
- 在光标与子菜单之间画一个看不见的「安全三角」
- 根据光标速度和位置预测用户意图
- 或混合上述几种方法的方案

我们来看看 Web 上能见到的其中一些做法，顺序随意。

注：加粗表示是 DOM 元素，普通字体表示不是 DOM。

## 1. 超时方案

有人可能觉得最简单的修法是加个超时。光标离开父条目后，等 300 毫秒再收起子菜单。但这并不是一个好办法。

![一个简短的上下文菜单，最后一项 Open With 的子菜单在右下展开，下方是一条 300 毫秒的刻度条，标注为「宽限期」，从「光标离开该行」一直延伸到「子菜单收起」。光标两次沿同一条斜线从该行走到子菜单最后一项 Other。第一次移动很快：离开该行时刻度条开始填充，但光标在刻度接近终点前就进入了子菜单，子菜单保持不变。第二次以正常速度移动，光标还在半空中时刻度条到达终点，子菜单消失，光标落在 Other 原本所在的空白处。](https://image.viki.moe/blog/context-menu/94f1e2.png)

看出问题了吗？固定超时对某些用户太慢，对另一些用户又太快。

Tog 也吐槽过这一点。Windows 曾经在你滑出后让子菜单再保持大约半秒，指望你够快：

> 不幸的是，面对错误概率上升，人们的反应是放慢而不是加快，这是一个非常普遍的现象。因此很少有人会想明白，加快速度才能解决问题。微软的解法恰好是反的。
>
> Bruce Tognazzini，《A Quiz Designed to Give You Fitts》

结果就是小心谨慎的用户反而受罚。而那些确实想去下一行的人，也得一起等超时。

## 2. 曲线 SVG 方案

我是在看 [Hakim El Hattab 在 CSS Day 2019 的演讲](https://www.youtube.com/watch?v=o0NtjY17v5w&t=937s) 时发现这个技巧的。他用的是曲线 SVG。Hakim 没有用固定的超时，而是用一条动态的曲线 SVG 来补上父条目与子菜单之间的间隙。

![一个简短的上下文菜单，最后一项 Open With 的子菜单在右下展开。一片边缘弯曲的蓝色形状从该行扫向子菜单的底角，离开时紧贴该行。光标穿过它，沿一条直线斜向抵达最后一项 Other，途经时先高亮 TextEdit，抵达后再高亮 Other，停留片刻后原路返回。整个过程中子菜单始终保持展开。](https://image.viki.moe/blog/context-menu/e11ef0.png)

下面是他在演讲中分享的**曲线** SVG 路径代码。

```ts
const anchor = row.getBoundingClientRect()
const menu = submenu.getBoundingClientRect()

hitArea.setAttribute(
  'd',
  `M ${anchor.x} ${anchor.y}` +
    ` Q ${menu.x} ${anchor.y} ${menu.x} ${menu.y}` +
    ` v ${menu.height}` +
    ` Q ${menu.x} ${anchor.bottom} ${anchor.x} ${anchor.bottom}` +
    ` h ${anchor.width}` +
    ` v ${-anchor.height}` +
    ` z`,
)
```

这段代码先测量该行和子菜单的位置，然后画出连接两者的闭合路径，同时把该行本身挖掉。两条路径用二次贝塞尔曲线 `Q` 来弯曲。Hakim 选择曲线，是为了少覆盖菜单上下相邻的行，同时更多地覆盖光标通向子菜单各项的自然轨迹。

强烈建议你自己去看一遍那个 YouTube 视频，能更好理解他的思路。

## 3. 安全区方案

我是在 [Andreas Eldh](https://x.com/eldh/status/1300485830302203910?s=20) 写的 [Invisible details: Building contextual menus](https://linear.app/now/invisible-details) 一文里读到的。

![个简短的上下文菜单，最后一项 Open With 的子菜单在右下展开。两者之间张开一个蓝色三角形，尖端靠近光标，底边沿子菜单左侧边缘的整个高度。光标穿向子菜单最后一项 Other，三角形以每秒五次的可见步进重绘而非连续跟踪，于是尖端落后于光标再跳着追上，越走越窄，并在光标已经抵达后还残留了一瞬。返程时三角形不再出现，子菜单在光标身后收起，于是它穿过空白回到 Open With 那一行，光标再次到达该行时子菜单重新展开。随后光标改走一条更平缓的直线直指同一项的标签，这条线本会落在上一张图的曲线形状之外，但它同样在三角形之内，三角形的尖端缩成贴着子菜单边缘的一条细带，缩到最小，随后子菜单第二次在它身后收起。](https://image.viki.moe/blog/context-menu/9cf71b.png)

这是安全区方案的代码。Andreas 用一个 div 元素为光标划出可移动的安全区。先测量子菜单尺寸，再获取鼠标坐标，动态绘制 CSS `clipPath` 多边形。

```tsx
export function MouseSafeArea(props: { parentRef: React.RefObject<HTMLDivElement> }) {
  const { x = 0, y = 0, height: h = 0, width: w = 0 } =
    props.parentRef.current?.getBoundingClientRect() || {}
  const [mouseX, mouseY] = useMousePosition()
  const positions = { x, y, h, w, mouseX, mouseY }
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: getRight(positions),
        left: getLeft(positions),
        height: h,
        width: getWidth(positions),
        clipPath: getClipPath(positions),
      }}
    />
  )
}

const getLeft = ({ x, mouseX }: Positions) =>
  mouseX > x ? undefined : -Math.max(x - mouseX, 10) + 'px'
const getRight = ({ x, w, mouseX }: Positions) =>
  mouseX > x ? -Math.max(mouseX - (x + w), 10) + 'px' : undefined
const getWidth = ({ x, w, mouseX }: Positions) =>
  mouseX > x ? Math.max(mouseX - (x + w), 10) + 'px' : Math.max(x - mouseX, 10) + 'px'
const getClipPath = ({ x, y, h, mouseX, mouseY }: Positions) =>
  mouseX > x
    ? `polygon(0% 0%, 0% 100%, 100% ${(100 * (mouseY - y)) / h}%)`
    : `polygon(100% 0%, 0% ${(100 * (mouseY - y)) / h}%, 100% 100%)`
```

这个裁剪路径创建了一个看不见的三角形安全区，把光标位置直接连到子菜单的上下两个角。只要鼠标在这个安全区内朝子菜单移动，它就不会收起。

如今你在 Web 上到处都能看到这个技巧的变体。John Phamous 在 [Twitter 上分享过一个很好的例子](https://x.com/JohnPhamous/status/1970899841485242571?s=20)，展示他为 Vercel 构建的菜单。

但有个问题。真实元素必须在鼠标每次移动时重新渲染，一次快速的甩动就可能让它跟不上。Adobe 的 React Aria 团队 [试过这个方案后放弃了](https://react-aria.adobe.com/blog/creating-a-pointer-friendly-submenu-experience)，原因正是这个。而且它还盖在下面的行之上，在它消失之前，那些行既无法悬停也无法点击。

## 4. Amazon 方案

大多数人是从 Ben Kamens 那里知道安全三角形的。2013 年，他被 Amazon「Shop by Department」菜单那种快到不真实的手感 [钓上了钩](https://xkcd.com/356/)，并弄清了原因。那里没有任何延迟。Amazon 检查你的光标是否正行走在「它刚才的位置」与子菜单角点构成的三角形之内。在里面，子菜单保留。在外面，立刻切换。

他把这些写进了 [Breaking down Amazon's mega dropdown](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown)，并做成了 [jQuery-menu-aim](https://github.com/kamens/jQuery-menu-aim)。[Sophie Alpert](https://sophiebits.com/) 帮他理解了 Amazon 使用的叉积数学，不过他最终还是选了更简单的斜率比较。这里没有 DOM，只有每次鼠标移动时的一场计算。

他的文章里还写道：

> 我确信这个问题在很多年前就被解决过、被遗忘过、被重新发现过、再被解决、再被遗忘、再被重新发现、再被解决。
>
> Ben Kamens，《Breaking down Amazon's mega dropdown》

他说得比他以为的还准。当我发了相关的内容后，Michael Brundage 回复：

![Michael Brundage 的回复](https://image.viki.moe/blog/context-menu/3f9712.png)

这个菜单是 Michael、Gareth Farrington 和 Drew Stamps 在 Amazon 做出来的。他们的专利 [US9733783B1](https://patents.google.com/patent/US9733783B1/en) 于 2012 年 11 月 1 日提交，比 Ben 的文章早了四个月。

而这个专利画的不是一个三角形，而是三个三角形加一个圆。

![Amazon 方案，三个三角形加一个圆](https://image.viki.moe/blog/context-menu/dc68b0.png)

- 主三角形，从光标延伸到略超出子菜单上下角的位置。和大家做的几乎一样。
- 另外两个三角形，一个在上一个在下。它们从光标朝子菜单方向前进 `M` 像素，然后向上 `N` 像素、向下 `P` 像素。这两个点成为新三角形的尖端，于是整个形状在光标附近变得更宽，正好是主三角形最窄的地方。
- 光标周围的一个小圆，让轻微抖动不算作离开。

如果光标落在另一个条目上，会立刻检查它。如果没有，先等一下再检查。如果它在这些形状中的任意一个之内，子菜单保留，整个图形按新位置重绘。如果在外，或者光标完全没动，子菜单就切换。

我最喜欢的部分是 `M`、`N`、`P` 的来源。专利描述了记录大量用户在两点之间移动光标的轨迹，再从这些数据中选出数值。它甚至提到了按用户单独调参。

那两个额外的三角形起到了和 Hakim 的曲线一样的作用，只不过用的是数学而不是 SVG，而且早了七年。

## 5. 预测用户意图

我发现 Base UI 用了这种方法（也在 macOS 的菜单中观察到过）。这是最过度设计的方案，大概也是最好的一个。

![一个简短的上下文菜单，最后一项 Open With 的子菜单在右下展开，下方是一条标着「光标速度」的刻度条，最下面三分之一染成红色并标注 0.1 px/ms。光标两次沿同一条斜线从该行走向子菜单最后一项 Other。第一次匀速移动：离开该行时出现一个带虚线轮廓的琥珀色四边形，下边缘标注「no dom」，它横跨间隙，尖端停在光标离开的位置而不是跟着光标走，速度条稳稳高于红色区间，光标抵达子菜单，此时形状完成使命随即消失。第二次以同样的速度沿同一条线出发，随后放缓，速度条逐步变短，在光标仍处于同一形状内、距面板还有一段距离时掉进红色区间，子菜单在那一刻收起。光标逐渐停在空白间隙中并返回。两次返回时都越过 Open With 那一行而子菜单没有重新展开，它只在光标停下片刻后才出现。](https://image.viki.moe/blog/context-menu/26b23f.png)

上面那个**安全三角**在真实实现里并不是 DOM 元素。没有东西可检查、可悬停，也没有东西盖在你的菜单上。它只是 `mousemove` 监听器里跑的一段数学。

```ts
function hasIntersectingEdge(pointX, pointY, xi, yi, xj, yj) {
  return yi >= pointY !== yj >= pointY && pointX <= ((xj - xi) * (pointY - yi)) / (yj - yi) + xi
}
```

有意思的部分是，它还会测量你移动得有多快。

```ts
const CURSOR_SPEED_THRESHOLD = 0.1 // px/ms
const CURSOR_SPEED_THRESHOLD_SQUARED = CURSOR_SPEED_THRESHOLD * CURSOR_SPEED_THRESHOLD

const distanceSquared = deltaX * deltaX + deltaY * deltaY
const thresholdSquared = elapsedTime * elapsedTime * CURSOR_SPEED_THRESHOLD_SQUARED
return distanceSquared < thresholdSquared
```

在我看来，固定超时是错的工具。它是在猜测这段旅程需要多久，而这取决于距离。

真正的修法不是一个速度值，而是每次移动都重新检查一次，而不是一次性猜定。Base UI 会检查你移动得多快（同时仍保留一个 40 毫秒的小定时器，应对手停下不动的情况）。React Aria 用的定时器会在你每次移动时重启。无论哪种，都不需要知道子菜单有多远。

不过有件事要记住。Tog 的 `<` 是「无论移动得多慢」都保持菜单展开。速度检查恰好相反，你太慢它就收起子菜单。对大多数人这很好，但对那些因为身体原因不得不慢的人就不好。

安全区形状本质上是一个桥，基于「光标正朝子菜单前进」这个猜测。速度检查则确保它在动。

以下这些会在每次 `mousemove` 时检查：

- 是否有更深的子菜单已经展开（如果有，其他检查都不执行）
- 光标是否已经到达子菜单
- 它是否已经停下（停下的光标不会触发事件，所以用一个 `40ms` 定时器兜住）
- 它是否移动得太慢
- 它是否仍在安全区内

Adobe 的 React Aria 团队在 [构建他们的子菜单](https://react-aria.adobe.com/blog/creating-a-pointer-friendly-submenu-experience) 时认真考虑过这些。他们不用三角形，而是用 `Math.atan2` 比较角度，并且选择了更长的超时而不是速度检查，因为运动功能受损的人可能需要更长时间才能到达。他们还：

- 在上下两侧各放宽 15° 的角度
- 只在连续两次错误移动后才收起，因为手抖的人可能会无意中把光标往错的方向甩
- 对触摸和触控笔跳过全部逻辑，因为没有光标需要瞄准

还有一个来自 macOS 的细节，[Costa Alexoglou 注意到](https://www.smashingmagazine.com/2023/08/better-context-menus-safe-triangles/) 过。三角形只在一个方向上起作用。它在进入子菜单的方向保护你，但当你想回到父菜单时，它已经没了，于是那些行立刻就亮起来。

## 演示场

这里有一个包含本文所有方案的交互版。选一种，然后从 `Open With` 划到 `Other`。

（译者注：受限于本站呈现方式，交互式示例请前往 [原文的 Playground](https://sorenblank.com/craft/the-invisible-shape#playground) 体验）

## 接下来

现在每个库都在发自己的一套实现。Base UI、Floating UI、Radix、React Aria，可能还有你正在用的那个。我在 Open UI 中看到过一个 [关于原生菜单元素的公开讨论](https://github.com/openui/open-ui/issues/1190)，其中有个建议是让浏览器自己处理悬停延迟和安全三角形。如果真能实现，我们谁都不用再写这些了。

## 参考资料

- Wikipedia 上的 [Menu (computing)](https://en.wikipedia.org/wiki/Menu_%28computing%29)
- Wikipedia 上的 [Context menu](https://en.wikipedia.org/wiki/Context_menu)
- Wikipedia 上的 [Steering law](https://en.wikipedia.org/wiki/Steering_law)
- Peter Seibel 的《Coders at Work》中的 [Dan Ingalls](https://codersatwork.com/dan-ingalls)
- Gareth Farrington、Michael Brundage 和 Drew Stamps 的专利 [US9733783B1: Controlling a user interface](https://patents.google.com/patent/US9733783B1/en)
- YouTube 上的 [How Steve Jobs got the ideas of GUI from Xerox](https://youtu.be/J33pVRdxWbw)
- Bruce Tognazzini 的 [A Quiz Designed to Give You Fitts](https://www.asktog.com/columns/022DesignedToGiveFitts.html)
- Hakim El Hattab 在 CSS Day 2019 的 [Building Better Interfaces](https://www.youtube.com/watch?v=o0NtjY17v5w&t=937s)
- Ben Kamens 的 [Breaking down Amazon's mega dropdown](https://bjk5.com/post/44698559168/breaking-down-amazons-mega-dropdown)
- Ben Kamens 的 [jQuery-menu-aim](https://github.com/kamens/jQuery-menu-aim)
- Andreas Eldh 的 [Invisible details: Building contextual menus](https://linear.app/now/invisible-details)
- Costa Alexoglou 的 [Better Context Menus With Safe Triangles](https://www.smashingmagazine.com/2023/08/better-context-menus-safe-triangles/)
- [React Aria](https://react-aria.adobe.com/) 的 [Creating a pointer-friendly submenu experience](https://react-aria.adobe.com/blog/creating-a-pointer-friendly-submenu-experience)
- [Base UI](https://base-ui.com/) 的 [safePolygon.ts](https://github.com/mui/base-ui/blob/7ffe6342b09eea1721892e1e274419de17f02873/packages/react/src/floating-ui-react/safePolygon.ts)
- [Floating UI](https://floating-ui.com/) 的 [safePolygon](https://floating-ui.com/docs/usehover#safepolygon)
- Open UI 上的 [Activation behavior for opening submenus](https://github.com/openui/open-ui/issues/1190)

---

## 译者注

本文由 AI 辅助翻译，译者进行了后期润色和校对。

原文中的交互演示图是内联 SVG 动画，受限于本站呈现方式无法显示，已用图片替代。如需体验或查看原版动画，请前往 [原文](https://sorenblank.com/craft/the-invisible-shape) 查看。强烈建议阅读原文以保证最佳的阅读和理解体验。
