# 贺兰灵境 · AI 文旅视觉共创引擎（第一阶段）

## 双层视觉决策

1. 先以 `services/scenicVisionService.js` 在 `knowledge/index.js` 的已核验景区中匹配名称或 ID。
2. 命中时返回 `LOCAL_KB`：使用知识库图片，并在行程卡标注“官方实景参考”。
3. 未命中时返回 `FALLBACK_MODE`：显示占位状态，不伪造景区照片、不阻塞行程文本。
4. 后续将 `config/cloud.js` 的 `VISION_MODE` 设为 `HUNYUAN_ENABLED` 后，才允许由 `generateTravelImage()` 适配腾讯混元云函数，并统一标注“AI旅行效果预览”。

## 稳定性约束

- 默认 `LOCAL_ONLY`，不依赖 API Key、不发起云函数调用。
- 服务层所有匹配异常均返回占位数据，页面不因视觉失败中断。
- 核心景区始终优先使用本地知识库，不让生成图替代真实景区图。
- 未收录地点在第一阶段保持文字方案与占位状态；第二阶段才提供 AI 效果预览。

## 后续混元接入

1. 部署独立的 `generateTravelImage` 云函数。
2. 云函数接收 `scene`、`style`、`description`、`cultureTags`，返回受控图片 URL。
3. 在服务层增加 30 秒超时、`catch` 降级为 `FALLBACK_MODE`。
4. 完成真机验证后将 `VISION_MODE` 切换为 `HUNYUAN_ENABLED`。
