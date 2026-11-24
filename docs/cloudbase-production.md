# CloudBase Production Readiness

更新时间：2026-08-16

## 已完成

- `config/cloud.js` 统一保存环境 ID、`AI_MODE`、模型提供方、模型 ID 和 Vision Feature Gate。
- `app.js` 在 `onLaunch` 中以 `wx.cloud.init({ env, traceUser: true })` 初始化 CloudBase。
- `utils/cloud-ai.js` 使用官方小程序 CloudBase AI 入口尝试 `generateText`，只允许受控旅行约束 JSON，并做字段白名单、类型和默认值校验。
- `utils/ai-orchestrator.js` 把 Cloud AI 只用于意图/调整解析，把景区事实和行程组合交给本地 Knowledge + trip-agent；超时、错误或 JSON 失败自动 fallback。
- `utils/cloud-vision.js` 定义 Cloud Storage 临时上传、云函数调用和完成后删除；未开启 Feature Gate 时完全不上传。
- `cloudfunctions/visionRecognize` 返回安全的 `VISION_PROVIDER_NOT_CONFIGURED`，不猜景区、不返回虚假结果。

## 当前状态

```text
Environment: cloudbase-d6g1u2dzk45c62fc1
AI_MODE: hybrid
CloudBase init: code complete, console association not verified
Cloud AI: integration code + mocked schema test; live model not verified
Vision: DISABLED_SAFE; provider not configured, function not deployed
Database: not used for knowledge migration
Storage: code path prepared, no image upload while feature gate is false
```

## 人工动作

- 将小程序 AppID 关联到 CloudBase 环境。
- 在 CloudBase AI 控制台启用实际可用模型，并确认 `cloudAiModel`。
- 在微信开发者工具部署云函数并配置正式 Vision Provider；不得把 API Key 写入小程序或云函数源码。
- 完成隐私协议、图片生命周期、云函数权限、真机测试后，才可以把 `featureVisionEnabled` 改成 `true`。

## 依据

实现依据是 CloudBase 官方小程序 AI、云函数和 AI SDK 文档；项目没有引入未经验证的第三方 AI SDK，也没有假定未确认的 Vision 模型名称。

