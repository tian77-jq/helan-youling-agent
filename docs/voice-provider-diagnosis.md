# Voice Provider Diagnosis · 2026-08-29

## Confirmed short circuit

当前 RC 的 `services/voice-service.js` 在 `VOICE_PROVIDER_RELEASE_MODE === 'SUBTITLE'` 时直接返回：

`{ ok: false, mode: 'CAPTION_ONLY', reason: 'RELEASE_SUBTITLE_MODE' }`

因此真机日志中出现 `VOICE_TRIGGER` 和 `speak entered`，但不会出现 Tencent/Wechat TTS 请求、音频 URL 或播放器事件。这是发布配置造成的确定性短路，不是播放器故障。

本轮已增加两类无隐私诊断：

- `[VOICE_PROVIDER_DECISION]`：角色、匿名文本哈希、请求模式、选中 Provider、Provider 状态、熔断状态。
- `[VOICE_SHORT_CIRCUIT]`：`SUBTITLE_MODE`、`NO_REAL_PROVIDER`、`TENCENT_PERMISSION_BLOCKED` 或 `WECHAT_PLUGIN_NOT_AUTHORIZED`。

## 当前实际状态

| 项目 | 状态 |
| --- | --- |
| Release voice mode | `SUBTITLE` |
| Tencent provider | `PERMISSION_BLOCKED`；客户端 Provider 也保持不可用 |
| WechatSI plugin | 代码接口保留，但 `app.json` 未声明插件，后台授权未验证 |
| Real audio | `NO` |
| Device audio | `NOT_TESTED_AS_REAL_AUDIO` |

## 为什么本轮不猜插件信息

腾讯官方插件指引明确要求先在小程序管理后台添加插件，再按插件文档配置项目；实际可用状态需通过公众平台核实。当前没有该后台会话，因此不能把插件 AppID、版本或授权状态写成已确认。[腾讯云官方插件指引](https://cloud.tencent.com/document/product/1301/104693)

腾讯云 TTS 本身提供官方服务端 API，但需要开通服务并具备服务端鉴权；当前项目尚未取得可验证的线上授权和成功音频证据。[腾讯云官方语音合成简介](https://cloud.tencent.com/document/api/1073/37985)

## 下一步

只有在管理员完成插件添加/授权，或 CloudBase `ttsSpeak` 取得真实可用的服务端授权后，才能创建新的 voice build，并验证 `TTS request → audio URL → AUDIO_PLAY → onPlay → 手机听到声音` 全链路。当前 RC 继续保持字幕模式，不修改 AI、行程、图片或组件加载策略。
