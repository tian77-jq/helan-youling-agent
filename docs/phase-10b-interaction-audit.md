# Phase 10B Interaction Audit

审计范围为 `app.json` 实际注册的 13 条路由（未把被 `project.config.json` 忽略的旧副本计入运行包）。共扫描 53 个 WXML 事件绑定，Handler 缺失数为 0。

| 页面 | 主要交互 | 事件/Handler | 目标 |
|---|---|---|---|
| 首页 | 让灵灵规划、AI规划行程、问萌宠 | `startTrip` / `go` | `/pages/trip/index` |
| 首页 | AI识景·内测 | `go` | `/feature/photo/index`；Vision 关闭时显示安全说明 |
| 首页 | 景区联名、美食联名、商品 | `onScenicTap` / `onFoodTap` / `openProduct` | 弹窗、预览、商品详情 |
| AI灵游 | 生成、重新生成、少走一点、换景点、增加美食 | `generate` / `adjust` | 本地 Knowledge + trip-agent |
| AI灵游 | 问萌宠、旅行纪念、返回、分享 | `guideTopic` / `createMemory` / `goHome` / `open-type=share` | 知识讲解、分包、首页、微信分享 |
| IP/推荐/商城 | 选项、推荐、详情、预售、收藏 | 对应页面 Handler 均存在 | 已注册主包/分包路径 |
| 旅行纪念/问卷 | 选择、生成、保存、复制、提交、分享 | 对应页面 Handler 均存在 | 本机存储、后台、微信分享 |

导航审计：13/13 注册路由有效；普通页面使用 `navigateTo`，首页 TabBar 返回使用 `switchTab`，未发现死路由。

## 微信开发者工具人工点测

首页 → 让灵灵规划 → AI 灵游；首页 → AI规划行程；首页 → 问萌宠；首页 → AI识景·内测（应进入内测页并明确说明 Vision 未启用）；景区联名卡；美食联名卡；商城、故事馆、推荐、语言、旅行纪念；AI 灵游生成、连续修改、萌宠卡片、返回、分享。

每次点击应观察页面跳转、Toast/Modal、loading 或结果变化；不得以“无反应”作为安全失败表现。
