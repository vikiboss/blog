---
title: '如何优雅地畅玩 4399 等 Flash 游戏'
date: 2022-12-31
topic: '生活'
excerpt: '带你速通 4399，Flash 算个 der'
tags:
  - 'Flash'
  - '浏览器'
  - '游戏'
  - '历史遗留'
  - '工具'
---

## Flash 和浏览器现状

据 [Adobe 官网描述](https://www.adobe.com/products/flashplayer/end-of-life.html)，**Adobe 在 2020 年 12 月 31 日之后不再支持 Flash Player**，并从 2021 年 1 月 12 日开始阻止 Flash 内容在 Flash Player 中运行。**各大主流浏览器（Chrome、Edge、Firefox 等）也相继在新版本中停止了对 Flash 的支持**，并且无法通过常规方式手动开启 Flash。

## 两难的局面

但我们都知道，国内的 **4399 小游戏（造梦西游、洛克王国、生死狙击等）大部分游戏都是基于 Flash 的**，所以就目前而言，在国内不可能完全彻底终结 Flash。针对此，Adobe 公司将中国区的运营权交给了国内一家公司，于是 Flash 在国内就有了「国内特供版」。被毒害过的朋友都知道，**「国内特供版」塞满了广告弹窗**，如果装了火绒之类的弹窗拦截工具还好一点，如果没有，弹窗会让你措手不及，一个接一个，一不小心整个电脑都被流氓软件占领了。

## 如何优雅地玩 Flash 游戏？

### 方案 1：使用开源的自带 Flash 的专用浏览器（推荐）

这里推荐一款专为 Flash 打造的浏览器，由 [Mzying2001](https://github.com/Mzying2001) 大佬开源的 [CefFlashBrowser](https://github.com/Mzying2001/CefFlashBrowser)。它自带 Flash 插件，支持多语言、收藏夹和打开本地 SWF 文件，界面清爽高效。你可以直接前往 [release](https://github.com/Mzying2001/CefFlashBrowser/releases) 页下载使用。

![浏览器主页面](https://s2.loli.net/2022/12/31/hsac4W16YL9832v.png)

![用这个浏览器玩洛克王国](https://s2.loli.net/2022/12/31/UQK9z6E3RFeLkM8.png)

### 方案 2：使用自带 Flash 的旧版浏览器

内置 Flash 的 Chrome 最高版本是 53 版本，你可以点击 [这里](https://viki.lanzout.com/ilIu50jrdpmh) 跳转到蓝奏网盘下载 Chrome 53 版本。无需任何其他操作，下载后直接打开浏览器，就可以畅玩 Flash 游戏了。

这里仅提供旧版 Chrome 下载。当然，如果你不喜欢 Chrome，也可以自行搜索其他内置 Flash 的浏览器旧版本进行下载。

![Chrome 53 玩洛克王国](https://s2.loli.net/2022/12/31/j4eDXdUVWpxwNh1.png)

### 方案 3：使用纯净的 Flash + 支持 Flash 的浏览器

你可以点击 [这里](https://github.com/darktohka/clean-flash-builds/releases/tag/v1.30) 到 GitHub 的 release 页下载并安装 Flash 的纯净三合一版本。（注：GitHub 上的这个是移植的，原项目在 [GitLab](https://gitlab.com/cleanflash/installer) 上）

支持 Flash 的浏览器比较多，像国内的 QQ 浏览器、360 安全浏览器等均支持。但如果你像我一样厌恶国内这些「毒瘤」，那么推荐你使用旧版的 Chrome。

国外各大知名浏览器从 Chrome 88、Edge 88、Firefox 85 开始都不再支持 Flash。Chrome 支持 Flash 但没有内置 Flash 的最高版本是 87 版本，你可以点击 [这里](https://viki.lanzout.com/ilIu50jrdpmh) 跳转到蓝奏网盘下载 Chrome 87 版本。

当然，你也可以使用支持 Flash 的 Firefox 等其他浏览器的旧版本，或者在安装 Adobe Flash ActiveX 后（三合一安装包安装时可选勾选安装）使用 Edge 的 IE 兼容模式，看你个人喜好。

**好了，现在可以愉快地畅玩 4399 啦～**

## 只想玩本地的 Flash 游戏（SWF 文件）？

刚才第一个方案推荐的浏览器支持打开本地 SWF 文件进行播放。其他浏览器如果可以打开网页的 Flash 游戏，那么你也可以直接用浏览器打开本地的 SWF 文件，一样能播放和游玩。

或者你可以使用方案 3 下载纯净版 Flash，注意安装时勾选独立版本的 Flash Player。这是 Adobe 单独发行的单文件[可执行程序](https://adobe.com/support/flashplayer/debug_downloads.html)，可以直接打开本地或互联网的 SWF 文件进行播放。

不过这个官网页面显示已结束了它的使命，不能直接从官网下载，你可以到这个[归档页面](https://web.archive.org/web/20210112063313/http://fpdownload.adobe.com/get/flashplayer/pdc/32.0.0.465/install_flash_player.exe)下载单独的 Adobe Flash Player。如果无法安装，请尝试将系统时间调到 2020 年绕过限制。

当然，本文介绍了这么多方案，最推荐的还是第一个方案的开源浏览器，支持 Flash 网页游戏和本地 Flash 游戏，一步到位。

---

不知不觉就到 2022 跨年夜了，也算是 2022 年最后一篇文章，希望本文对你有帮助或启发。
