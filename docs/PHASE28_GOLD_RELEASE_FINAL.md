# Phase 28 · Gold Release Candidate Final

日期：2026-08-26

## CURRENT_STATUS

`PARTIAL`

## 真机截图 UX 修改

- 长 Toast 已替换为卡片内轻量状态 chip。
- 角色主视觉放大，保持 `aspectFit`。
- 完整回答默认折叠，口播字幕单独展示。
- 按钮按 IDLE / SPEAKING / AUDIO 状态切换。
- “或直接问萌宠”改为“想从哪里开始？”。

## 包体

- Before：1,602,721 bytes。
- After：1,271,650 bytes，约 1.213MiB。
- 处理：发布忽略未引用的 `assets/thumbs/intangible/`，没有删除原创 IP 或核心资源。
- `PACKAGE_INTERNAL_GATE_PASS = true`。

## Character Router / Answer Consistency

- `character-router-test`：10/10 PASS。
- `avatar-answer-consistency-test`：15/15 PASS。
- 已修复旧 `agent.id` 覆盖问题主题的路径。

## AI 灵游

- `services/trip-service.js` 作为兼容适配器复用既有 `utils/trip-agent.js`。
- `product-test = PASS`。
- “让沙狐讲行程”复用现有路线摘要，不请求第二份路线。

## AI 灵境

- 原混元生图链路保持。
- 真实 `imageUrl`、渲染、保存证据尚未取得。
- `HUNYUAN_IMAGE_PASS = PENDING`。

## IP 故事馆

- 既有角色故事接入统一 Digital Avatar Service。
- 三角色复用 `speech-text-builder` 和 `voice-service`。

## Voice Mode

- `TTS_PASS = false`。
- `VOICE_MODE = SUBTITLE`。
- `FREE_ONLY_MODE = true`。
- `RELEASE_BLOCKED_BY_TTS = NO`，前提是字幕动画真机通过。

## 工程回归

- Product Test：PASS。
- Page Registry：22 页 PASS，0 errors。
- Code Quality：0 unused JS，0 missing requires，0 media > 200KB。
- Verify Project：PASS，主包 1.213MiB。
- Character Answer Consistency：15/15 PASS。
- `node scripts/gold-release-gate.js`：代码侧项目、包体、路由、产品回归和人格一致性均 PASS；AI Create、隐私平台审核、DevTools/Preview/Device 仍保持 false/pending。

## DevTools / Preview / Device

- DevTools compile：未取得本阶段结果。
- Preview：未取得二维码。
- Device：未取得真机日志。
- 严重控制台错误：未取得真实运行日志，不能宣称为 0。

## 当前剩余风险

- 微信开发者工具重新编译后需确认扫描结果与源码一致。
- 真机需验证 320–430px 下布局、按钮、字幕和安全区。
- 真实混元生图与作品保存需要云端证据。
- TTS 仍为字幕模式，不得包装成真实语音播放。

## 双赛 3 分钟 Demo

1. 展示三只原创 IP，说明生态/文化/旅行三类人格。
2. 问生态问题→岩羊；问西夏历史→骆驼；问夜游/美食→沙狐。
3. 生成三天路线→让沙狐讲已有路线。
4. AI 灵境真实生成后展示作品与岩羊解读；若无真实图片证据则跳过，不使用假结果。
5. 以“宁夏知识资产→可信 Agent→IP 数字人格→AI 共创→文创/景区转化”收束。

## 最终状态码

`GOLD_RELEASE_CANDIDATE_V3 = NO`

`READY_FOR_FINAL_DEVICE_ACCEPTANCE = NO`

代码侧已达到可交给微信开发者工具和真机验收的状态，但尚未获得平台与设备证据。
