# FREE_ONLY Runtime Audit

日期：2026-08-25

## 结论

`UNCONTROLLED_PAID_CALLS = 0`（代码路径审计结论）

这不是腾讯云账户余额证明，也不是实际 TTS 成功证明。

## 代码证据

- `services/voice-service.js` 固定 `FREE_ONLY_MODE = true`。
- provider 未通过 `isAvailable()` 时直接返回 `CAPTION_ONLY`。
- `providers/wechat-tts-provider.js` 和 `providers/tencent-tts-provider.js` 当前均返回不可用，不发起网络请求。
- 前端没有 Secret、SecretId、Token 或 TTS API 直连。
- TTS 失败只影响音频，文字回答和端侧动画继续保留。

## 当前实际模式

`CAPTION_ONLY`：字幕 + IP 图片动画。

如未来启用腾讯云通用语音合成，必须由服务端实现额度检查、后付费关闭/阻断和人工批准开关后，才能把 provider 标记为可用。
