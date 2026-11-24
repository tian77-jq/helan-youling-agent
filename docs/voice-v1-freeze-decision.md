# Voice V1 Freeze Decision

## Decision

实时语音/TTS 在 V1 正式上线前冻结。`REAL_TTS_AVAILABLE=false`、`VOICE_FEATURE_STATUS=FROZEN_FOR_V1`、`VOICE_RELEASE_MODE=TEXT_COMPANION_WITH_FUTURE_VOICE`。

## Why frozen

当前已验证文字问答、字幕讲解和角色人格链路；真实 TTS 的权限、插件和服务端音频链路仍未形成可复查的稳定真机证据。继续排查会成为发布阻塞项，因此不再投入 CAM、WechatSI、Provider、音频缓存或播放器调试。

## V1 UX fallback

语音入口保留并改为“灵灵讲解/听我讲故事”。点击后打开半屏 Coming Soon 浮层，不暴露技术术语，不调用 TTS。浮层提供角色化文案、“继续和灵灵聊宁夏”“查看字幕讲解”“知道了”。字幕内容来自当前 `speakText`，文字对话和 Trip 继续可用。

## Future interface

未来只需在用户明确解冻、Provider ready、权限和真机证据齐备后，将 `REAL_TTS_AVAILABLE` 切换为 true，并继续复用 `digital-avatar-service → voice-service` 接口。

## Unfreeze criteria

三角色分别取得真实 request/audio/play 真机证据；权限、成本、失败回退、隐私和缓存策略完成验收；新增语音版本不得阻塞 AI QA、Trip、Story、AI Create 的发布。

## Release rule

`VOICE_BLOCKS_RELEASE=NO`。V1 对外说法是“文字/字幕数字人格交互，声音持续准备中”，不得宣称实时 AI 语音已实现。
