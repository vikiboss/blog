---
title: '记一次使用 Python 爬取 B 站 UP 主信息的经历'
date: 2020-11-29
topic: '技术'
top_image: 'https://i.loli.net/2020/11/29/esjylJK4a256W3L.png'
excerpt: '使用 Selenium 和 BeautifulSoup 实现对美食区 UP 主粉丝数、UID 等数据的抓取与分析。'
tags:
  - 'Python'
  - 'Bilibili'
  - 'Selenium'
  - '爬虫'
  - '数据分析'
---

## 需求

尽可能获取 B 站美食博主列表，按照粉丝数排序，最终目的是能找出粉丝数前列 UP 主的 ID 和昵称。

## 思路

- 将几个包含很多美食区视频的网页的 URL 存起来
- 通过请求 URL 拿到尽可能多的投稿视频的链接
- 通过视频链接拿到 UP 主的主页链接，并分析出 UP 主的 UID
- 通过 UID 请求信息接口，拿到 UP 主的 ID 以及粉丝数

## 用到的库及其作用

- `csv`：读写 CSV 文件
- `json`：读写 JSON 文件
- `time`：进行延时操作
- `random`：随机数功能实现
- `codecs`：打开文件（解决中文写入文件后乱码问题）
- `requests`：HTTP 请求库
- `selenium`：模拟浏览器操作
- `fake_useragent`：随机 User-Agent 库
- `threading`：多线程库
- `BeautifulSoup`：解析 HTML 与 XML 的库

## 遇到的问题以及解决方案

### 拿不到 HTML 结构

可能是因为**没有设置 User-Agent**，服务器无法确认请求是否由用户发出。提前设置好请求头 User-Agent（浏览器标识），**伪装成浏览器，模拟用户正常请求**，防止 IP 被封禁。这里可以自己设置 User-Agent 为指定浏览器标识，也可以用库来随机生成。**建议使用 `fake_useragent` 库来随机生成 User-Agent 标识**。

安装 `fake_useragent`：

```bash
pip install fake_useragent
```

使用示例：

```py
from fake_useragent import UserAgent

UA = UserAgent().random
headers = {'User-Agent': UA}
```

### 拿到的 HTML 结构不完整

可能是因为**网页动态加载**（拿到网页并用浏览器解析之后还需要 JavaScript 来动态更新网页内容），导致拿到的网页 HTML 结构残缺，拿不到想要的数据。可以**使用 `selenium` 库来模拟浏览器爬虫**，这样会**等到网页加载完全**再获取网页的 HTML。

安装 `selenium`：

```bash
pip install selenium
```

下载对应版本的浏览器驱动：

- Firefox：[geckodriver](https://github.com/mozilla/geckodriver/releases)
- Chrome：[chromedriver](https://chromedriver.chromium.org/downloads)
- Edge：[MicrosoftWebDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver)
- Opera：[operadriver](https://github.com/operasoftware/operachromiumdriver/releases)

使用示例：

```py
from selenium import webdriver

# 创建浏览器实例
browser = webdriver.Chrome()  # Chrome 浏览器
# browser = webdriver.Firefox()  # Firefox 浏览器
# browser = webdriver.Edge()  # Edge 浏览器

# 访问网页
browser.get(url)

# 获取网页 HTML 结构
html = browser.page_source
```

### 数据保存和中文乱码问题

为了方便后续处理数据，这里**使用 CSV 文件格式存储数据**，同时使用 `codecs` 模块打开文件来防止中文乱码。CSV 格式文件很简单，Excel 也能打开并处理，Python 标准库里有 `csv` 模块来读写 CSV 格式文件。

**注意**：`csv` 和 `codecs` 都是 Python 标准库的一部分，无需额外安装。

使用示例：

```py
import csv
import codecs

filename = "data.csv"

# 'ab' 为追加模式，'wb' 为覆盖模式
csv_file = codecs.open(filename, 'ab', "gbk")

# 创建 CSV 写入器
csv_writer = csv.writer(csv_file)

# 写入表头
csv_writer.writerow(("第一项", "第二项"))

# 写入一行数据
info = (1, 2)
csv_writer.writerow(info)

# 写入多行数据
infos = [(1, 2), (3, 4)]
csv_writer.writerows(infos)

# 关闭文件
csv_file.close()
```

### 返回的数据是 JSON 格式

使用 `json` 模块处理 JSON 数据。

**注意**：`json` 是 Python 标准库的一部分，无需额外安装。

使用示例：

```py
import json

jsonData = '{"name": "Viki"}'

# JSON 字符串转为 Python 字典（或其他数据类型）
data = json.loads(jsonData)
print(data['name'])  # 输出：Viki

# Python 字典（或其他数据类型）转为 JSON 字符串
jsonStr = json.dumps(data)
print(jsonStr)  # 输出：{"name": "Viki"}
```

### 爬取速度太慢

使用 `threading` 模块实现**多线程**并发爬取。

**注意**：`threading` 是 Python 标准库的一部分，无需额外安装。

使用示例：

```py
import threading

lst = [123, 456, 789]

def double(n):
    result = n * n
    print(f"{n} 的平方是 {result}")
    return result

# 为每个任务创建线程
for n in lst:
    double_thread = threading.Thread(target=double, args=(n,))
    double_thread.start()
```

## 完整代码实现

以下是完整的爬虫代码：

```py
import csv
import json
import time
import codecs
import requests
import threading
from bs4 import BeautifulSoup
from selenium import webdriver
from fake_useragent import UserAgent

# B 站美食区相关页面 URL 列表
biliFoodUrls = [
    'https://www.bilibili.com/v/food',
    'https://www.bilibili.com/v/food/make',
    'https://www.bilibili.com/v/food/rural',
    'https://www.bilibili.com/v/food/record',
    'https://www.bilibili.com/v/food/detective',
    'https://www.bilibili.com/v/food/measurement',
    'https://www.bilibili.com/v/popular/rank/food'
]


def grabVideoUrl(url, videoUrls, upUrls, upUids, upInfos, browser):
    """捕获视频 URL 和 UP 主 URL"""
    if not url:
        return
    if url[0] == '/':
        url = 'https:' + url
    if 'bilibili.com/video' in url:
        videoUrls.append(url)
        print(f'捕获到视频 URL：\t{url}')
    elif 'space.bilibili.com' in url:
        upUrls.append(url)
        print(f'捕获到 UP 主 URL：\t{url}')


def getVideosUrl(videoUrls, upUrls, upUids, upInfos, browser):
    """从美食区页面获取视频 URL"""
    for web in biliFoodUrls:
        print(f"开始处理页面：\t{web}")
        browser.get(web)
        html = browser.page_source
        webBf = BeautifulSoup(html, 'html.parser')
        al = webBf.find_all("a")
        for a in al:
            url = a.get('href')
            args = (url, videoUrls, upUrls, upUids, upInfos, browser)
            video_thread = threading.Thread(target=grabVideoUrl, args=args)
            video_thread.start()


def grabUpsUrl(videoUrl, videoUrls, upUrls, upUids, upInfos, browser):
    """从视频页面获取 UP 主 URL"""
    print(f"开始处理视频 URL：\t{videoUrl}")
    headers = {
        'User-Agent': UserAgent().random,
        'Upgrade-Insecure-Requests': '1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, sdch, br',
        'Accept-Language': 'zh-CN,zh;q=0.8',
    }
    html = requests.request('GET', videoUrl, headers=headers).content
    webBf = BeautifulSoup(html, "html.parser")
    upDiv = webBf.find(id='v_upinfo')
    if not upDiv:
        print(f"获取视频 UP 主信息遭到拦截\t{videoUrl}")
        return
    upUrl = upDiv.find_all('a')[0].get('href')
    if upUrl[0] == '/':
        upUrl = 'https:' + upUrl
    upUrls.append(upUrl)
    print(f'捕获到 UP 主 URL：\t{upUrl}')


def getUpsUrl(videoUrls, upUrls, upUids, upInfos, browser):
    """批量获取 UP 主 URL"""
    for videoUrl in videoUrls:
        args = (videoUrl, videoUrls, upUrls, upUids, upInfos, browser)
        upUrl_thread = threading.Thread(target=grabUpsUrl, args=args)
        upUrl_thread.start()


def getUpsId(videoUrls, upUrls, upUids, upInfos, browser):
    """从 UP 主 URL 中解析出 UID"""
    for upUrl in upUrls:
        if not upUrl:
            continue
        upUid = upUrl.split("#")[0].split('/')[-1]
        upUids.append(upUid)
        print(f'捕获到 UP 主 UID：\t{upUid}')


def getUpsInfo(videoUrls, upUrls, upUids, upInfos, browser):
    """通过 UID 获取 UP 主详细信息"""
    api = 'https://api.bilibili.com/x/web-interface/card?jsonp=jsonp&mid='
    # 去重
    ids = set(upUids)
    upUids = list(ids)

    for index, upUid in enumerate(upUids):
        print(f"开始处理 mid：{upUid}\t进度：{index+1}/{len(upUids)}")

        headers = {
            'User-Agent': UserAgent().random,
            'Upgrade-Insecure-Requests': '1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch, br',
            'Accept-Language': 'zh-CN,zh;q=0.8',
        }

        res = requests.request('GET', f"{api}{upUid}", headers=headers)
        data = res.json()['data']
        n = 0

        # 重试机制
        while ((not data) and n < 100):
            print(f"请求遭到服务器拦截，重试第 {n+1} 次中...\t总进度：{index+1}/{len(upUids)}")
            headers = {
                'User-Agent': UserAgent().random,
                'Upgrade-Insecure-Requests': '1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch, br',
                'Accept-Language': 'zh-CN,zh;q=0.8',
            }
            res = requests.request('GET', f"{api}{upUid}", headers=headers)
            n += 1
            data = res.json()['data']

        if n == 100:
            continue

        print(f"读取 UP 主信息（mid={upUid}）成功")

        upName = data['card']['name']
        follower = data['follower']
        mid = data['card']['mid']
        upInfos.append({'id': upName, 'follower': follower, 'mid': mid})

    # 按粉丝数排序
    upInfos = sorted(upInfos, key=lambda upInfo: upInfo['follower'])

    print("写入 CSV 文件中...")
    filename = "bili.csv"
    bili_csv = codecs.open(filename, 'ab', "gbk")
    bili_csv_writer = csv.writer(bili_csv)

    for upInfo in upInfos:
        msg = f"写入中\tUP 主 ID：{upInfo['id']}\t粉丝数：{upInfo['follower']}\tmid={upInfo['mid']}"
        print(msg)

        info = (upInfo['id'], upInfo['follower'], upInfo['mid'])
        try:
            bili_csv_writer.writerow(info)
        except:
            continue

    bili_csv.close()

    print(f"写入到 {filename} 完成，本次共爬取到 {len(upInfos)} 个 UP 主信息")


def main(browser):
    """主函数，协调各个爬取步骤"""
    videoUrls = []
    upUrls = []
    upUids = []
    upInfos = []

    # 获取视频 URL
    getVideosUrl(videoUrls, upUrls, upUids, upInfos, browser)

    # 获取 UP 主 URL
    getUpsUrl(videoUrls, upUrls, upUids, upInfos, browser)

    # 等待线程执行完成
    time.sleep(20)

    # 解析 UP 主 UID
    getUpsId(videoUrls, upUrls, upUids, upInfos, browser)

    # 获取 UP 主详细信息并保存
    getUpsInfo(videoUrls, upUrls, upUids, upInfos, browser)


if __name__ == '__main__':
    # 创建浏览器实例
    browser = webdriver.Chrome()

    # 循环爬取 100 次
    for i in range(100):
        print(f"开始第 {i+1} 次爬取...")
        main(browser)

    # 关闭浏览器
    browser.close()
```

## 注意事项

- 本代码仅供学习交流使用，请勿用于商业用途
- 爬取时请注意控制频率，避免对 B 站服务器造成过大压力
- B 站的页面结构和 API 可能会发生变化，代码需要相应调整
- 建议添加更完善的异常处理和日志记录

## 参考资料

- [Selenium Python 教程 - 知乎](https://zhuanlan.zhihu.com/p/111859925)
- [Beautiful Soup 官方文档](https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/)
- [Requests 官方文档](https://requests.readthedocs.io/zh_CN/latest/)
