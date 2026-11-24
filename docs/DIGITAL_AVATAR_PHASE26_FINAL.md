# Phase 26 · 三萌宠数字人格真机体验精修总结

日期：2026-08-25

## 1. 当前真机问题

- 美食内容可能显示岩羊，角色与主题不一致。
- “或直接问萌宠”标题与下方景区卡不一致。
- 角色图偏小，Toast 遮挡内容。
- 口播稿标签和整段文本具有开发调试感。

## 2. Character Router 根因与修复

旧适配器优先读取 `result.agent.id`，旧 FOOD 路由可能返回 `rock-goat`，覆盖了问题主题判断。现在使用 Intent → Topic → Entity/Knowledge Focus 的优先级：有明确主题时不再盲信 legacy agent。

## 3. Router 测试

`node scripts/character-router-test.js`：`10/10 PASS`。

- ECOLOGY → `yanYang`
- CULTURE_HISTORY → `luoTuo`
- FOOD / TRAVEL_PLAN / NIGHT_TRAVEL → `shaHu`

## 4. UI 修改

- “或直接问萌宠”改为“想从哪里开始？”。
- 角色主视觉放大并保持 `aspectFit`。
- 长 Toast 改为卡片内状态 chip。
- 口播字幕与完整回答分层，完整回答默认折叠。
- 讲解按钮按 IDLE / SPEAKING / AUDIO 状态变化。
- 轻量端侧动画保留，无 WebGL、视频或大 GIF。

## 5. 字幕/TTS 与 FREE_ONLY_MODE

- `FREE_ONLY_MODE = true`
- 当前实际 provider：未配置，`CAPTION_ONLY`
- 文字回答、字幕和动画不依赖 TTS 成功。
- 未进行真实免费额度账户验证，不能宣称 TTS PASS。

## 6. AI 问答、灵游、灵境、故事馆

- AI 问答：已接入统一数字人格适配器，代码级路由通过。
- AI 灵游：已有路线结果增加“让沙狐讲行程”，不重新规划第二份路线。
- AI 灵境：原生图链路未重构，萌宠解读入口仍待接入。
- IP 故事馆：现有故事保持，统一讲解组件入口仍待接入。

## 7. 包体与工程回归

- 未获得微信开发者工具正式包体报告，包体状态：`PACKAGE_SIZE_PENDING_DEVTOOLS`。
- 页面注册审计：22 页，0 errors，0 warnings。
- JS syntax check：通过。
- Router test：10/10 通过。
- Release Gate：`RELEASE_READY=false`，原因是隐私平台审核、TTS、DevTools 和真机待验证。

## 8. 微信开发者工具/真机

尚未取得新的编译、预览二维码或真机 AFTER 截图，因此状态为：

`READY_FOR_REAL_DEVICE_ACCEPTANCE`

不是 `REAL_DEVICE_PASS`。

## 9. 当前风险

- 当前工作树仍有大量既有未提交改动。
- TTS provider 尚未真实启用。
- 需要在 320–430px 真机宽度上确认 WXML 换行、按钮点击区和安全区。
- AI 灵境/故事馆讲解融合未完成。

## 10. 微信赛事 Demo 路径

1. 问“贺兰山岩画为什么值得去？”→ 岩羊。
2. 问“西夏陵为什么重要？”→ 骆驼。
3. 问“银川晚上去哪玩？”→ 沙狐。
4. 生成三天宁夏路线→ 点击“让沙狐讲行程”。

## 11. 创赛 Demo 路径

宁夏知识资产 → 可信 AI Agent → 角色路由 → 原创 IP 数字人格 → AI 灵游 → AI 灵境共创 → 文创与景区转化。

## 最终状态

`DIGITAL_AVATAR_PHASE26_READY = NO`

`READY_FOR_REAL_DEVICE_ACCEPTANCE = YES`
