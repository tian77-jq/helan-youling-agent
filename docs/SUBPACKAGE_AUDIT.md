# SUBPACKAGE AUDIT

日期：2026-08-23

## 当前配置

- 主包页面：9 个
- `feature` 分包：12 个页面
- 重复页面路径：0
- 不存在页面路径：0
- TabBar 页面引用：4/4 正确
- 分包页面文件：全部存在

## 迁移边界

`pages/ai-trip` 和 `pages/ai-create` 当前作为稳定入口保留在主包，确保 TabBar/首页跳转链简单可靠；其业务逻辑只通过 `services` 调用。`feature` 分包继续承载详情、文化、记忆、旧创作流程等非首屏页面。

`pages/ip` 与 `pages/shop` 当前是 TabBar 页面，保留在主包是微信 TabBar 路由约束下的稳定选择；详情页和深层功能在 `feature` 分包。旧 `pages/trip`、`pages/recommend`、`pages/language` 暂作兼容页面，未删除，后续完成引用迁移后再移入分包。

## 依赖检查

- 页面直接调用 `wx.cloud.callFunction()`：0
- 新 AI 页面直接调用云函数：0
- 新 AI 页面 → service → 本地/云函数边界：符合
- 历史兼容层仍存在的业务 service 直连：已标记为后续迁移项，不影响首页。
