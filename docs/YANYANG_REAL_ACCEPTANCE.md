# 岩羊 yanYang Vertical Slice 验收

日期：2026-08-25

## 结论

`DIGITAL_AVATAR_PARTIAL`

## 已验证的代码链路

固定问题：`贺兰山岩画为什么值得去？`

角色路由结果：`yanYang` → 岩羊 → `/assets/thumbs/products/pillow_yangyang.jpg`

数字人格适配器会从既有 Agent 的 `answer` 兼容生成：

- `answerText`
- `speakText`
- `character: yanYang`
- `emotion: friendly`
- `action: SPEAK`
- `avatarState: IDLE`

## 已有降级

当前没有已验证的微信同声传译插件配置，也没有免费额度保护的腾讯云 TTS 服务端适配器，因此 `voice-service` 返回 `CAPTION_ONLY`，不会发起付费请求。文字答案、口播稿和端侧动画继续可用。

## 尚未声称通过的项目

- 微信开发者工具编译与预览
- 真机音频播放
- 免费 TTS 真实调用
- 音频结束事件后的真机状态恢复
- 腾讯混元云端回答的现场运行

因此不能将本报告标记为 `REAL_DEVICE_PASS` 或 `DIGITAL_AVATAR_GOLD_READY = YES`。
