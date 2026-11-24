# 贺兰有灵 V2.0 架构基线

生成时间：2026-08-23

## 当前工程状态

- 主包页面：9 个
- 分包：1 个，根目录 `feature`，12 个页面
- TabBar：`pages/index/index`、`pages/ip/index`、`pages/shop/index`、`pages/admin/index`
- 云函数：`generateImage`、`visionRecognize`
- 编译类型：`miniprogram`
- 目标基础库：`3.7.12`
- 压缩：JS/WXML/WXSS 均开启
- 按需注入：`requiredComponents`
- 当前主包估算：1,503,364 字节（健康检查口径）
- 当前媒体：无图片或音频超过 200 KB

## V2 已完成边界

- `pages/index` 已是静态入口页，不调用云函数、不请求 AI、不加载知识库。
- `pages/ai-trip` 已建立，规划调用 `services/trip-service.js`。
- `pages/ai-create` 已建立，图片生成调用 `services/image-service.js`。
- `services/cloud-service.js` 提供懒初始化，云开发不在 `app.js` 启动阶段初始化。
- `data/` 已建立景区、美食、文化的独立数据入口。

## 当前兼容层

旧 `pages/trip`、`feature/create`、旧 IP/商城详情页暂时保留，作为业务资产兼容层；新首页入口不再依赖这些旧页面。后续按 Phase 3/4 完成迁移后再删除旧入口。

## 已知云函数缺口

当前仓库已有 `generateImage` 和 `visionRecognize`；`tripPlanner`、`knowledgeSearch` 尚未建立独立云函数，当前 AI 灵游使用本地知识库服务降级。此项列入 Phase 5，不在首页重构阶段强行接入。
