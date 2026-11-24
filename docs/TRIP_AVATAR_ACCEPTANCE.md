# Trip Avatar Acceptance

状态：`CODE_READY / REAL_DEVICE_TEST_PENDING`

## 代码链路

现有路线 → `plan.summary` → `speech-text-builder` → `shaHu` → `voice-service` → 字幕/动画。

“让沙狐讲行程”不会重新请求第二份路线。用户修改路线后，页面会替换当前 `plan`，下一次讲解读取最新摘要。

## 当前限制

- TTS provider 未配置，当前是字幕+动画。
- 尚未在微信开发者工具和真机验证完整播放状态。
