# Phase 22 · 三萌宠原创 IP 数字人格状态

更新时间：2026-08-25

## CURRENT_STATUS

`PARTIAL`

已完成端侧轻量数字人格框架、角色路由、口播稿、字幕动画降级和问答页首个闭环接线；未将 TTS 标记为真实可用，也未宣称真机验收完成。

## 已完成

- 复用现有三张原创 IP 视觉素材：岩羊、沙狐、双峰驼抱枕图；没有用新生成动物或网络图片替代。
- 新增统一角色 ID：`yanYang`、`shaHu`、`luoTuo`，保留旧 ID 映射，避免破坏现有 Agent 和商品数据。
- 问答文本在 `conversation-gateway` 收口为 `answerText`、`speakText`、`character`、`emotion`、`action` 等数字人格字段。
- 新增 `feature/digital-avatar/` 独立分包页；动画使用 WXSS 轻量浮动/呼吸效果，没有 WebGL 或视频。
- 现有 `pages/trip` 问答卡片增加萌宠图片、口播稿、开始讲解、停止和 AI 合成内容标识。
- 新增 TTS provider 接口，但默认 `FREE_ONLY_MODE=true`；没有已配置、可控额度的 provider 时只走字幕+动画，不自动产生付费调用。

## TTS 结论

当前实际运行模式是 `CAPTION_ONLY`。腾讯云官方说明通用语音合成有免费资源包，但额度耗尽后可能转入后付费；因此本阶段没有把腾讯云 TTS 直接接入前端。微信同声传译 provider 保留接口，但当前项目没有可验证的插件配置，不能把它当作已接入能力。

## 本地验证

- `scripts/agent-routing-eval.js`：30/30 通过。
- `scripts/page-registry-audit.js`：22 页通过，0 errors，0 warnings。
- 新增/修改 JS：Node syntax check 通过。
- `scripts/core-regression-check.js`：既有基线断言 4 项失败，涉及旧首页 handler/按钮与旧 ASK_PET_ROUTE 字符串；需在微信开发者工具重新做运行态回归，不能据此宣称全绿。

## 尚未完成

- 微信开发者工具模拟器、真机、包体、AI 灵游/AI 灵境/故事馆运行态回归。
- 真实免费 TTS 服务端额度保护与音频缓存链路。
- AI 灵游结果、景区详情、IP 故事馆、AI 灵境四处的“让萌宠讲解”按钮接入。

## 修改/新增文件

新增：`services/character-router.js`、`services/speech-text-builder.js`、`services/digital-avatar-service.js`、`services/voice-service.js`、`providers/wechat-tts-provider.js`、`providers/tencent-tts-provider.js`、`feature/digital-avatar/*`。

修改：`app.json`、`utils/conversation-gateway.js`、`pages/index/index.js`、`pages/trip/index.js`、`pages/trip/index.wxml`、`pages/trip/index.wxss`。
