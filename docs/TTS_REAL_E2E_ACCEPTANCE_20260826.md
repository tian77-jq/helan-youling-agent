# TTS Real E2E Acceptance · 2026-08-26

## 当前状态

`CURRENT_STATUS = BLOCKED`

`BUILD_ID = 20260826-phase28-real-tts-e2e`

`CURRENT_BLOCKER = BLOCKED_TENCENT_AUTH`

## 已完成

- 新增安全云函数：`cloudfunctions/ttsSpeak/index.js`。
- 云函数使用腾讯云 `TextToVoice`，服务端读取环境变量，不向前端暴露密钥。
- Base64 MP3 转 Buffer 后上传 CloudBase，返回 `audioFileId`、脱敏可记录的 `requestId` 和字幕时间轴。
- 角色文本 + VoiceType + 语速 + 情感生成 SHA-256 缓存键，重复播放不重复请求。
- `services/voice-service.js` 统一调用 `ttsSpeak`；未取得用户明确开关时保持字幕回退。
- TTS 失败不影响 answerText、speakText、字幕和数字人格图片。
- Node 语法、JSON、项目回归、角色路由和一致性测试已通过。

## 尚未取得的真实证据

```text
TTS_REAL_PASS = NO
YAN_YANG_VOICE_PASS = NO
SHA_HU_VOICE_PASS = NO
LUO_TUO_VOICE_PASS = NO
COMPILE_PASS = PENDING_HUMAN
PREVIEW_PASS = PENDING_HUMAN
DEVICE_PASS = NO
```

尚未部署云函数、配置腾讯 TTS 授权、确认三组可用 VoiceType，也没有 RequestId、fileID 和真机播放日志；因此不能宣称真实语音闭环已完成。

## 唯一下一步

在 CloudBase 部署 `cloudfunctions/ttsSpeak`，配置 `TENCENT_TTS_SECRET_ID`、`TENCENT_TTS_SECRET_KEY`、`TTS_ENABLED_BY_USER=true` 及三组经过试听确认的 `TTS_VOICE_*` 环境变量；密钥不要粘贴到聊天或前端代码。随后分别取得三角色 RequestId、fileID 和真机播放证据。
