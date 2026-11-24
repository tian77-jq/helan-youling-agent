# GOLD HUNYUAN FINAL ACCEPTANCE

## 当前结论：BLOCKED（混元侧 429）

- fallback 根因：真实混元请求返回 HTTP `429`；不是当前云函数超时。
- 修复：线上 `generateImage` 已调整为 `60s/1024MB`，并完成在线查询；错误已透传，前端会明确提示限流/额度问题。
- 权限/额度：BLOCKED，需 CloudBase AI 控制台确认混元生图资源包、账户额度和并发限制。
- 云函数：DEPLOYED / Active，在线超时 `60s`。
- 真实图片：未获得 imageUrl。
- 小程序展示与作品保存：代码路径存在，真实验收未完成。
- Demo：暂不能冻结为真实混元版本。

## 2026-08-24 生产修复记录

- 新增 `cloudbaserc.json`：`generateImage` 声明式配置为 `timeout: 60`、`memorySize: 1024`、云端安装依赖。
- `cloudfunctions/generateImage/index.js`：关闭 `revise` 与 thinking 选项，保留真实错误阶段、错误码和原始详情；成功时返回 `imageUrl`、`providerUrl`、`taskId`、`persisted`。
- `providers/hunyuan-provider.js`：不伪造成功；云函数错误透传 `code/detail/rawError`。
- 真实 CLI 调用已验证到达 provider：`cli-real-20260824-0900`，约 397ms 返回 `429`，没有 imageUrl。
- 当前阻断标识：`BLOCKED_HUNYUAN_QUOTA_OR_RATELIMIT`。

已执行并生效的配置命令：

`tcb config update fn generateImage --timeout 60 --memory 1024 -e cloudbase-d6g1u2dzk45c62fc1 --yes`

下一步必须在 CloudBase AI 控制台处理 429（额度/资源包/并发或模型权限），然后重新调用云函数，拿到非空真实 `imageUrl`，再进行微信真机验收；在此之前不能标记 SUCCESS。
