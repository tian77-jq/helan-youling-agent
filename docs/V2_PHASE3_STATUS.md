# V2.0 Phase 3 状态基线

审计日期：2026-08-23

## 目录与页面

主包页面（9）：

`pages/index/index`、`pages/ai-trip/index`、`pages/ai-create/index`、`pages/trip/index`、`pages/ip/index`、`pages/recommend/index`、`pages/language/index`、`pages/shop/index`、`pages/admin/index`

分包（1）：`feature`，12 个页面，包含详情、文化、记忆、旧创作流程。

## Service 层

`cloud-service.js`、`image-service.js`、`knowledge-service.js`、`scenic-service.js`、`scenicVisionService.js`、`trip-service.js`

## 云函数

`generateImage`、`knowledgeSearch`、`tripPlanner`、`visionRecognize`。

## 配置

- 编译类型：`miniprogram`
- 目标基础库：`3.7.12`
- JS/WXML/WXSS 压缩：开启
- 按需注入：`requiredComponents`
- TabBar：首页、发现、文创展厅、我的

## 包体与依赖

- 最近正式编译总包：1,557,991 字节
- 主包：1,478,545 字节
- `feature` 分包：79,446 字节
- 健康检查：PASS
- 缺失依赖：0
- 未使用 JS：0
- 主包误留分包 JS：0
- 超过 200 KB 图片/音频：0

## 当前状态判断

V2 首页和新 AI 入口已经独立；旧 `pages/trip`、`pages/recommend`、`pages/language` 仍作为兼容页面保留。Phase 3 的工作重点是运行时保护、Prompt provider 边界、数据格式统一、云函数错误协议和真机验收记录，不删除旧业务资产。
