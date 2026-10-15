---
title: '[译] 浏览器 User Agent 字符串的历史'
date: 2026-01-29
topic: '技术'
excerpt: '浏览器互相伪装，最终导致 UA 一团乱麻的故事。'
isOriginal: false
author: 'Aaron Andersen'
tags:
  - '浏览器'
  - 'Web'
  - '翻译'
  - '历史'
---

> 原文：History of the browser user-agent string
> 
> 时间：2008 年 9 月 3 日
>
> 作者：Aaron Andersen
>
> 链接：https://webaim.org/blog/user-agent-string-history

---


起初，有 [NCSA Mosaic](http://www.ncsa.illinois.edu/Projects/mosaic.html)，Mosaic 自称 `NCSA_Mosaic/2.0 (Windows 3.1)`，Mosaic 将图片与文字一同显示，众人欢欣鼓舞。

<img src="https://webaim.org/blog/media/useragents/mosaic.jpg" style="max-height: 60px;" />

而后，有一款新的网页浏览器名为「[Mozilla](http://en.wikipedia.org/wiki/Mozilla)」，是「Mosaic Killer」的缩写，但 Mosaic 并不高兴，于是公开名称改为 [Netscape](https://en.wikipedia.org/wiki/Netscape)，Netscape 自称 `Mozilla/1.0 (Win3.1)`，众人更加欢欣。Netscape 支持 [框架](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/frame)，框架在民间流行起来，但 Mosaic 不支持框架，于是有了「[用户代理嗅探](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Browser_detection_using_the_user_agent)」，网站管理员向「Mozilla」发送框架，而向其他浏览器不发送框架。

<img src="https://webaim.org/blog/media/useragents/netscape.jpg" style="max-height: 60px;" />

Netscape 说，让我们取笑微软，把 Windows 称作「调试糟糕的设备驱动」，微软很生气。于是微软做了自己的网页浏览器，名为 [Internet Explorer](https://en.wikipedia.org/wiki/Internet_Explorer)，希望它成为「Netscape Killer」。Internet Explorer 支持框架，却不是 Mozilla，因此没有得到框架。微软渐渐不耐烦，不愿等待网站管理员了解 IE 并开始向它发送框架，于是 Internet Explorer 宣称自己「兼容 Mozilla」，开始冒充 Netscape，自称 `Mozilla/1.22 (compatible; MSIE 2.0; Windows 95)`，Internet Explorer 收到了框架，整个微软都很高兴，但网站管理员困惑了。

<img src="https://webaim.org/blog/media/useragents/ie.png" style="max-height: 60px;" />

微软将 IE 与 Windows 捆绑销售，并使其优于 Netscape，第一次浏览器大战在这片土地上激烈展开。看哪，Netscape 被杀死了，微软欢欣鼓舞。但 Netscape 以 [Mozilla](https://www.mozilla.org/) 之名重生，Mozilla 打造了 [Gecko](https://developer.mozilla.org/zh-CN/docs/Glossary/Gecko)，自称 `Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.1) Gecko/20020826`，Gecko 是渲染引擎，Gecko 很好。Mozilla 变成了 [Firefox](https://www.mozilla.org/firefox/)，自称 `Mozilla/5.0 (Windows; U; Windows NT 5.1; sv-SE; rv:1.7.5) Gecko/20041108 Firefox/1.0`，Firefox 非常好。Gecko 开始繁衍，其他使用其代码的浏览器诞生了，它们自称 `Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.7.2) Gecko/20040825 Camino/0.8.1`，这是一个，以及 `Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.8.1.8) Gecko/20071008 SeaMonkey/1.0`，另一个，每一个都假装是 Mozilla，全都由 Gecko 驱动。

<img src="https://webaim.org/blog/media/useragents/mozilla.png" style="display: inline; max-height: 60px;" />
<img src="https://webaim.org/blog/media/useragents/firefox.jpg" style="display: inline; max-height: 60px;" />

Gecko 很好，IE 不好，嗅探重生，Gecko 得到了好的网页代码，其他浏览器则没有。Linux 的追随者非常悲伤，因为他们构建了 [Konqueror](https://en.wikipedia.org/wiki/Konqueror)，其引擎是 [KHTML](https://en.wikipedia.org/wiki/KHTML)，他们认为它和 Gecko 一样好，但它不是 Gecko，因此没有得到好的页面，于是 Konqueror 开始假装「像 Gecko」以获得好的页面，自称 `Mozilla/5.0 (compatible; Konqueror/3.2; FreeBSD) (KHTML, like Gecko)`，混乱随之而来。

<img src="https://webaim.org/blog/media/useragents/konqueror.jpg" style="max-height: 60px;" />

然后 [Opera](https://www.opera.com/) 来了，说：「我们当然应该允许用户决定我们冒充哪个浏览器」，于是 Opera 创建了一个菜单项，Opera 自称 `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 9.51`，或 `Mozilla/5.0 (Windows NT 6.0; U; en; rv:1.8.1) Gecko/20061208 Firefox/2.0.0 Opera 9.51`，或 `Opera/9.51 (Windows NT 5.1; U; en)`，取决于用户选择哪个选项。

<img src="https://webaim.org/blog/media/useragents/opera.jpg" style="max-height: 60px;" />

苹果构建了 [Safari](https://www.apple.com.cn/safari/)，使用了 KHTML，但添加了许多功能，并分叉了项目，称之为 [WebKit](https://webkit.org/)，但希望页面为 KHTML 编写，于是 Safari 自称 `Mozilla/5.0 (Macintosh; U; PPC Mac OS X; de-de) AppleWebKit/85.7 (KHTML, like Gecko) Safari/85.5`，情况变得更糟。

<img src="https://webaim.org/blog/media/useragents/safari.jpg" style="max-height: 60px;" />

微软非常害怕 Firefox，Internet Explorer 回归，自称 `Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)`，它能渲染好的代码，但只有当网站管理员命令它这样做时。

然后谷歌构建了 [Chrome](https://www.google.com/chrome/)，Chrome 使用 WebKit，它像 Safari，希望页面为 Safari 构建，于是假装是 Safari。因此 Chrome 使用 WebKit，假装是 Safari，WebKit 假装是 KHTML，KHTML 假装是 Gecko，所有浏览器都假装是 Mozilla，Chrome 自称 `Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13`，用户代理字符串成了一团彻底的乱麻，几乎无用，每个人都假装成别人，混乱无处不在。

<img src="https://webaim.org/blog/media/useragents/chrome.jpg" style="max-height: 60px;" />

---

## 译者注

主要内容由 AI 辅助翻译，译者进行了后期润色和校对。

延伸阅读: _[History of the user-agent string](https://humanwhocodes.com/blog/2010/01/12/history-of-the-user-agent-string/)_

