# HUNYUAN Fallback Root Cause Final

## ROOT_CAUSE

1. Provider 的 `catch` 会把 `wx.cloud.callFunction` 的拒绝转换为体验模式提示；这就是提示出现的直接代码原因。
2. CloudBase CLI 已确认 `generateImage` Active，但线上超时是 3 秒；混元生图请求超时会进入上述 catch。
3. 之前还有两个入口直接调用云函数，已统一到 `services/image-service.js`，避免模块级协议不一致。

## 修复

- HUNYUAN_MODE 已启用。
- Provider 记录 requestId、耗时、code、detail，并统一返回协议。
- `feature/create/studio-service.js` 与 `services/scenicVisionService.js` 已改走 image-service。
- generateImage 已重新部署，云端安装依赖成功。
- 仍需在 CloudBase 控制台提高超时并获得真实 imageUrl，当前不能标记 SUCCESS。

## 真机截图核验（2026-08-24）

- 错误码：`-504003`
- 错误标识：`FUNCTIONS_TIME_LIMIT_EXCEEDED`
- 运行时信息：`Invoking task timed out after 3 seconds`
- 结论：fallback 的当前唯一已证实阻塞是云函数超时配置，不是前端图片展示逻辑。
- 当前状态：`BLOCKED_EXTERNAL_TIMEOUT_CONFIG`。必须在 CloudBase 控制台把 `generateImage` 超时改为至少 60 秒并重新发布/验证，之后才能获得真实 `imageUrl`。
