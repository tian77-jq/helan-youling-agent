# V2.0 分阶段测试记录

## Phase 0

- 时间：2026-08-23
- 配置、页面、分包、TabBar、云函数基线：已记录
- 结果：通过

## Phase 1：首页纯展示

- 开发者工具编译：通过
- 最新 BUILD：V2 phase build（二维码 `v2-phase2-preview.png`）
- 主包：1,478,540 字节
- 首页截图：此前 Phase 1 官方自动化截图正常
- 真机：待人工扫码确认

## Phase 2：服务层

- `scenic-service`、`trip-service`、`image-service`、`knowledge-service` 已建立
- 页面不直接调用云函数：新 AI 页面通过 service 边界
- 静态健康检查：通过

## Phase 3：AI 灵游

- 新页面：`pages/ai-trip/index`
- 本地知识库规划和失败降级：已接入
- 真机规划体验：待人工扫码确认

## Phase 4：AI 灵境

- 新页面：`pages/ai-create/index`
- 当前只生成稳定 Prompt 对象，不调用腾讯混元
- 混元云函数接入：按要求延期

## 自动化说明

本次重新启动开发者工具后，自动化 WebSocket 端口未成功连接，因此没有把自动化结果冒充通过；上一轮 Phase 1 已有首页官方截图。手机微信真实打开仍是最终验收条件。
