---
title: '使用 smee-it 解决本地接收 GitHub Webhook 的难题'
date: 2025-11-28
topic: '技术'
excerpt: '一个简洁、类型安全的 smee.io 客户端，用于在本地接收 GitHub Webhook 等事件。'
tags: 
  - 'TypeScript'
  - 'Webhook'
  - 'GitHub'
  - '开源'
---

开发 [GitHub App](https://docs.github.com/zh/apps) 或 Bot 的时候，总会遇到一个很头疼的问题：怎么在本地接收 [Webhook](https://docs.github.com/zh/webhooks)？

GitHub 要给你发消息，但你的开发机器在本地网络里，没有公网 IP，GitHub 根本找不到你。GitHub 官方也不提供 WebSocket 方案，无法直接本地监听事件。

后来发现了 [smee.io](https://smee.io) 这个服务，思路挺聪明的：你在 smee.io 上获取一个专属的频道 URL，把这个 URL 配置成 Webhook 的目标地址，GitHub 就会把消息发到 smee.io，然后你的本地客户端通过 [SSE (Server-Sent Events)](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events) 实时接收。不需要公网 IP，也不用部署任何服务。SSE 类似于单向的 WebSocket，浏览器和 Node.js 都原生支持。

不过 [smee-client](https://github.com/probot/smee-client) 这个客户端用起来有点不太顺手。它的设计思路是收到事件后转发到本地的 HTTP 服务器，也就是说你可能还得跑一个 HTTP 服务来接收转发的请求。如果只是想快速看看 Webhook 的内容，这就有点繁琐了。而且它的 TypeScript 类型也不太完善。

## smee-it

于是我写了 [smee-it](https://github.com/vikiboss/smee-it)，核心想法很简单：利用 smee.io 提供的 SSE 接口来本地接收 Webhook 事件，但不强制转发到 HTTP 服务器，直接通过事件订阅拿数据。提供类似 WebSocket 的实时事件流效果的同时，不需要额外部署本地或者远程 HTTP 服务，大大简化了 Webhook 使用流程。

```ts
import { SmeeClient } from 'smee-it'

// 替换成你的频道 URL，可以在 https://smee.io 创建
const client = new SmeeClient('https://smee.io/your-channel')

client.on('message', (event) => {
  console.log('收到 Webhook:', event.body)
  console.log('请求头:', event.headers)
})

client.start()
```

就这么简单，没有 HTTP 服务器，没有 `target` URL，直接拿到数据。

整个库用 [TypeScript](https://www.typescriptlang.org/) 写的，类型支持很完善，用 [Vitest](https://vitest.dev/) 跑了 27 个测试用例，覆盖率 100%。打包用的 [tsup](https://tsup.egoist.dev/)，同时输出 ESM 和 CJS，支持 Tree-shaking。

如果你不想用公共的 smee.io，也可以连接自己部署的服务器（参考 [smee 源码](https://github.com/probot/smee.io)）。还提供了 `rawBody` 字段，方便做 [HMAC 签名验证](https://docs.github.com/zh/webhooks/using-webhooks/validating-webhook-deliveries)。

## 一些实用的功能

动态创建频道很方便，不用手动去网页上点：

```ts
// 自动在 smee.io 创建新频道
const channelUrl = await SmeeClient.createChannel()

// 或者用自己的服务器
const channelUrl = await SmeeClient.createChannel('https://smee.your-company.com')
```

配合 [@octokit/webhooks](https://github.com/octokit/webhooks.js) 验证签名也很简单。虽然 smee.io 是公开服务，任何人知道你的频道 URL 都能看到数据，但可以通过验证签名来确保消息确实来自 GitHub：

```ts
import { SmeeClient } from 'smee-it'
import { Webhooks } from '@octokit/webhooks'

const webhooks = new Webhooks({ secret: process.env.WEBHOOK_SECRET! })
const client = new SmeeClient('https://smee.io/your-channel')

client.on('message', async (event) => {
  const signature = event.headers['x-hub-signature-256']

  if (!(await webhooks.verify(event.rawBody, signature))) {
    console.error('签名验证失败')
    return
  }

  console.log('收到合法事件:', event.body)
})

client.start()
```

## 技术细节

整个库的代码不到 150 行（不含注释），就一个核心类 `SmeeClient`。用 [eventsource](https://github.com/EventSource/eventsource) 处理 SSE 连接，内置了事件发射器支持 `on/off` 订阅模式。

CI/CD 用的 [GitHub Actions](https://github.com/features/actions)，代码提交后自动跑测试，打 tag 就自动发布到 [npm](https://www.npmjs.com/package/smee-it)。

需要注意的是，smee.io 毕竟是公开服务，任何人知道你的频道 URL 就能看到所有数据，甚至可以往里面发伪造消息。所以这个库主要适合本地开发调试、CI/CD 测试或者开源项目。如果是敏感项目，建议[自己部署 smee 服务器](https://github.com/probot/smee.io#deploy-your-own)，或者一定要做签名验证。

## 结语

[smee-it](https://github.com/vikiboss/smee-it) 是个小工具，解决了在本地快速接收 Webhook 事件这个具体痛点。如果你也在开发 GitHub App、Bot 或任何 Webhook 集成，欢迎试试：

```bash
pnpm add smee-it
```

**相关链接：**

- [GitHub 仓库](https://github.com/vikiboss/smee-it) - 查看源码、提 Issue
- [npm 包](https://www.npmjs.com/package/smee-it) - 查看版本历史和使用统计
- [API 文档](https://github.com/vikiboss/smee-it#api-reference) - 完整的 API 参考
- [smee.io 官网](https://smee.io) - 创建你的第一个频道
