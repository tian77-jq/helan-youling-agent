# AI 生图模块地图

| 模块 | 页面/入口 | 统一入口 | 当前状态 |
|---|---|---|---|
| AI 灵境 | `pages/ai-create/index.js` | `services/image-service.js` | HUNYUAN_MODE，真实 URL 未验收 |
| 创作工作室 | `feature/create/studio-service.js` | `services/image-service.js` | 已统一，真实 URL 未验收 |
| 旅行效果图 | `services/scenicVisionService.js` / `pages/trip` | `services/image-service.js` | 已统一，失败降级 |
| 拍一拍识宁夏 | `feature/photo` | 视觉识别，不是生图 | SAFE/知识识别，不调用生图 |
