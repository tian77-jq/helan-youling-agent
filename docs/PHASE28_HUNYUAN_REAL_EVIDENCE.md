# Phase 28 Hunyuan Real Evidence

日期：2026-08-26

## 状态

`HUNYUAN_IMAGE_BLOCKED_EVIDENCE_PENDING`

## 代码侧确认

- `config/cloud.js`：`imageMode = HUNYUAN_MODE`。
- `services/image-service.js`：统一调用 `vision-agent/image-provider`。
- `providers/hunyuan-provider.js`：调用 `generateImage` 云函数，要求返回非空 `imageUrl`。
- `cloudfunctions/generateImage/index.js`：存在真实云函数实现，不生成本地假图。
- 页面仅在真实 provider 且 `imageUrl` 非空时允许保存作品。
- `product-test`：AI 灵境 prompt 字段检查通过。

## 未取得的真实证据

当前没有本阶段新的云函数调用日志、`requestId/taskId`、真实 `imageUrl`、渲染截图或作品保存记录。因此不能标记 `HUNYUAN_IMAGE_PASS = true`，也不能使用 LOCAL_DEMO 图片冒充真实混元结果。

## 验证记录模板

正式运行后需补充：`requestId`、`taskId`、provider、duration、脱敏后的 imageUrl/cloud file id、页面渲染状态、保存状态。禁止记录 SecretId/SecretKey。
