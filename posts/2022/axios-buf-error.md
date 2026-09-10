---
title: '记录 Axios 的 `Z_BUF_ERROR` Bug'
date: 2022-12-25
topic: '笔记'
excerpt: '一次简单的记录，也是一次对社区态度的呼吁。'
tags:
  - 'Axios'
  - 'Bug'
  - 'JavaScript'
  - 'Node.js'
  - '开源'
---

在 Axios 的 1.2.0 版本中，不少人遇到了 `Z_BUF_ERROR` 的问题。

## 问题描述

当请求设置了 `Content-Encoding` 头，但服务器返回的内容为空时（如 204 请求、HEAD 请求或重定向请求），Axios 仍会调用 `zlib` 的 `BrotliDecoder` 进行 Brotli 解压缩，导致 `zlib` 执行出错。可以参考这个 [issue](https://github.com/axios/axios/issues/5246)。

## 首次修复

随后，开发者在 [PR #5250](https://github.com/axios/axios/pull/5250) 中修复了这个问题，并在 [PR #5306](https://github.com/axios/axios/pull/5306) 中同时修复了响应头没有 `Content-Length` 的情况。

出于某些原因，Axios 核心开发者对发版比较谨慎（参考这个 [评论](https://github.com/axios/axios/pull/5306#issuecomment-1334055495) 和这个 [issue](https://github.com/axios/axios/issues/5337)）。在社区的一再期盼下，1.2.1 版本终于发布了。

## 再次出现

然而好景不长，1.2.1 版本再次出现了 `Z_BUF_ERROR` 的问题。翻了几页 issue 之后，大概定位了报错原因：

在上一次修复"响应头没有 `Content-Length` 的情况"的 [提交](https://github.com/axios/axios/pull/5306) 中，引发了 Brotli 解压缩的 bug。当服务器返回的数据压缩格式为 `br` 时，就会导致 `Z_BUF_ERROR` 错误。

## 临时解决方案

你可以手动设置请求头，指定服务器返回的编码格式，确保不返回 `br` 即可：

```js
axios.get(someApi, {
  headers: { 'Accept-Encoding': 'gzip,deflate,compress' },
})
```

## 修复进展

这个问题在 [PR #5353](https://github.com/axios/axios/pull/5353) 中已经被修复了，但还没发版（至于为什么不发版，前面有提到）。不过昨天（2022/12/24，刚好是平安夜）提了一个发版的 [PR #5404](https://github.com/axios/axios/pull/5404)，希望能尽快发布吧。

## 写在最后

在翻 issue 的时候看到了挺多不礼貌的发言，有一种「你写了 bug 你就得赶紧给老子更新，赶紧发版」的感觉。牢骚归牢骚，还是希望开源社区的维护者和使用者双方之间能多一点理解，多一点包容。
