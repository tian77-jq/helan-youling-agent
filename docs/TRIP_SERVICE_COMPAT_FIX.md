# trip-service Compatibility Fix

日期：2026-08-25

## 根因

`scripts/product-test.js` 仍通过 `services/trip-service` 验证最小 `plan()` Promise 合约，但项目实际规划逻辑已经位于 `utils/trip-agent.js`，此前缺少兼容入口。

## 修复

新增 `services/trip-service.js`，仅适配既有：

- `tripAgent.planTrip()`
- `tripAgent.adjustTrip()`

没有创建第二套规划器，也没有改变 AI 灵游页面或统一 Agent 路由。

## 验证

`product-test` 的 AI 灵游 service 合约现在返回 `promise contract ok`。完整 product-test 需在当前工作区重新执行确认。
