# Release Manifest

## 已完成

- 本地项目结构检查通过。
- Task Router / Duration / Character / Grounding 回归通过。
- Hunyuan Image 配置保持独立。
- 语音当前明确为字幕模式，不调用失败 Provider。
- 主包约 1.232 MiB（本地检查值）。

## 未验证

- CloudBase 真实文本模型 ID、requestId、延迟与 50 条质量评测。
- Hunyuan Image 真机 10 次成功率。
- 微信开发者工具 Preview、体验版、审核和正式发布。
- 真实用户量、订单、合作、收入、社会影响数据。

## 用户 ONE_ACTION

在微信开发者工具中完成一次真实预览/真机运行，并把以下 7 项结果回传：无天数选择、2 天规划、路线修改、夜游推荐、文化问答、AI 生图、字幕入口。只有之后才能把 `WECHAT_RELEASE_READY` 从 `NOT_VERIFIED` 改为 `PASS`。
