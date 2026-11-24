# TTS Real Acceptance

日期：2026-08-25

## 状态

`SUBTITLE_ONLY`

## 微信同声传译审计

本地项目没有微信插件配置、插件 AppID 或 `app.json.plugins` 声明；代码没有直接接入 WechatSI。当前公开官方检索未得到足以确认“当前主体可申请、当前版本可发布、接口仍可用”的一手配置证据，因此不硬接、不将其标记为 AVAILABLE。

## 腾讯云 TTS 审计

腾讯云通用语音合成官方资料显示可领取免费资源包，但免费额度有领取/有效期限制；免费资源包耗尽或过期后，如果控制台开启后付费，可能进入后付费。当前项目没有账户额度、后付费开关或服务端额度保护的可验证证据。

因此：

- `FREE_ONLY_MODE = true`
- `VOICE_PROVIDER` 未切换为 TENCENT_TTS
- 两个 provider 当前均不可用
- 实际行为为 `CAPTION_ONLY`
- 未发生不可控付费调用

## 固定文本端到端结果

固定文本：`你好，我是岩羊，贺兰山生态文化守护者。贺兰山不仅拥有独特的自然生态，也承载着丰富的历史文化记忆。`

| 项目 | 结果 |
|---|---|
| provider | NONE / 未配置 |
| requestTime | 未发起网络请求 |
| audioUrl | 无 |
| duration | 无 |
| playStatus | 未播放 |
| error | `WECHAT_TTS_NOT_CONFIGURED` / `TENCENT_TTS_NOT_CONFIGURED` |
| fallback | 字幕 + 端侧动画 |

这不是 TTS PASS，也不是 DEVICE PASS；真机音频验收需在配置合法 provider 后由开发者工具和手机完成。
