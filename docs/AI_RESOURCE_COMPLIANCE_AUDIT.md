# 小程序成长计划 AI 资源包合规审计

审计时间：2026-08-24

## 结论

状态：PASS（代码来源合规）

混元生图的唯一模型调用点是：

`cloudfunctions/generateImage/index.js`

调用方式：云函数服务端 `@cloudbase/node-sdk` → `app.ai()` → `createImageModel('hunyuan-image')`。

小程序端不直接调用混元模型，只通过：

`wx.cloud.callFunction({ name: 'generateImage' })`

## 扫描结果

- `@cloudbase/js-sdk` 直连混元：未发现。
- 浏览器/Web 端直连混元：未发现。
- 第三方 HTTP 直连混元：未发现。
- 云函数 Node SDK 调用：1 处，位于 `cloudfunctions/generateImage/index.js`。
- 小程序基础库 AI 调用：仅保留已有 `wx.cloud.extend.AI` 文本能力，不调用混元生图资源。
- 生图页面直接调用模型：未发现。

## 生图链路

```text
pages/ai-create
  -> services/image-service.js
  -> providers/hunyuan-provider.js
  -> wx.cloud.callFunction
  -> cloudfunctions/generateImage
  -> @cloudbase/node-sdk
  -> hunyuan-image
```

## 资源使用边界

- 真实模型调用必须发生在云函数/云托管服务端。
- `LOCAL_DEMO_MODE` 不调用任何 AI 资源。
- `HUNYUAN_MODE` 只允许由 `generateImage` 云函数调用模型。
- CLI 仅用于部署和调用用户自己的云函数测试，不在 CLI/AI 工具进程中直接调用混元模型。

## 运行时核验

- 环境：`cloudbase-d6g1u2dzk45c62fc1`
- 函数：`generateImage`
- 超时：`120s`
- 内存：`256MB`
- SDK：`@cloudbase/node-sdk >= 3.18.3`
- 模型：`HY-Image-3.0-Plus-4090-Tob-v1.0`

用量页面若仍显示 0，应在同一环境、同一模型资源页面刷新核对；代码侧没有 Web SDK 或第三方直连用法。
