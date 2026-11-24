# 三萌宠声音配置（2026-08-26）

角色配置已建立，但不填未经试听确认的 VoiceType：

| 角色 | 情感方向 | 语速 | VoiceType |
|---|---|---:|---|
| `yanYang` 岩羊 | `peaceful` | -0.2 | CloudBase 环境变量 `TTS_VOICE_YANYANG` |
| `shaHu` 沙狐 | `exciting` | 0.2 | CloudBase 环境变量 `TTS_VOICE_SHAHU` |
| `luoTuo` 骆驼 | `story` | -0.2 | CloudBase 环境变量 `TTS_VOICE_LUOTUO` |

腾讯官方基础语音合成 `TextToVoice` 支持 `VoiceType`、`Codec=mp3`、`EnableSubtitle` 和情感参数；VoiceType 必须以控制台可用音色和实际试听结果为准，不能凭空指定。[官方接口文档](https://cloud.tencent.com/document/api/1073/37995)

当前状态：`VOICE_PROFILE_PASS = PENDING_VOICE_AUDITION`
