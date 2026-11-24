# HUNYUAN Cloud Function Real Test

## STATUS: FAILED_EXTERNAL_429

### 线上配置

- 函数：`generateImage`
- 状态：`Active`
- 超时：`60s`（已在线查询确认，不再是 3 秒）
- 内存：`1024MB`

### 真实调用

- 时间：2026-08-24
- requestId：`cli-real-20260824-0900`
- 耗时：约 `397ms`
- provider：`hunyuan`
- stage：`generate`
- status：`FAILED`
- errorCode：`429`
- 返回：没有 `imageUrl` / `taskId`
- 原始错误：`Request failed with status code 429`

结论：调用已经到达混元 provider，当前阻断点不是云函数超时，而是混元侧限流、额度或模型资源权限。必须在 CloudBase AI 控制台确认混元生图资源包/额度后重试；在拿到非空真实 `imageUrl` 前，不能标记生图成功。

## 2026-08-24 官方 SDK 复测

- 部署版本：`@cloudbase/node-sdk >= 3.18.3`，模型 `HY-Image-3.0-Plus-4090-Tob-v1.0`
- `925f8867-cf6f-41ab-be12-6166451e08e2`：真实调用成功，耗时约 12.4 秒，返回 `provider: hunyuan-node-sdk`、`source: HUNYUAN_MODE`、`revisedPrompt`、HTTPS `url`，并成功保存 `fileID`。
- `a17d602f-5ff1-45dd-95b1-8aa3b79cb902`：随后调用返回 `429`，证明当前存在混元侧额度/限流状态，而非本地模拟图。
- 已修正：`imageUrl` 返回混元 HTTPS URL，`fileID` 单独保存，避免小程序直接渲染 `cloud://` 导致图片不显示。
- `6bf2b6b9-6a69-4682-9edd-4ca4f74862cc`：沙坡头海报真实调用成功，耗时约 14.2 秒，返回 HTTPS `imageUrl` 和 `fileID`。
