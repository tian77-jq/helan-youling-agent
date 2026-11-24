# 贺兰灵物 GOLD_CORE Manifest

版本：2026-08-19  |  状态：`STATIC_PASS` 仅代表静态检查通过

## 核心回归链路

| ID | 链路 | 静态入口 | 运行验收 |
|---|---|---|---|
| CORE-01 | 首页 → 让灵灵规划 → AI 灵游 | `pages/index/index.js` → `navigation.openTrip` | 首页输入后切换到 Trip，自动生成结构化行程 |
| CORE-02 | 首页 → 问萌宠 → Knowledge Agent | `aiOrchestrator.askPet` | 返回有来源标识的回答，失败可解释 |
| CORE-03 | 拍照识宁夏 → Vision → Knowledge Verify | `utils/cloud-vision.js` | 未配置/未知时输出明确安全状态，不猜测 |
| CORE-04 | 发现 → 景区详情 → 加入行程 | `feature/attraction/detail` | 详情可打开，加入后写入 `currentTrip` |
| CORE-05 | 发现 → 美食详情 → 加入路线 | `feature/food/detail` | 详情可打开，加入后 UI 同步 |
| CORE-06 | 文化闯关 → 任务 → 徽章 | `feature/cultural/index` | 完成任务后徽章持久化 |
| CORE-07 | 商城 → 我想要 → 我的心愿 | `utils/tracker.js` | 心愿可增删，刷新后仍存在 |
| CORE-08 | 我的 → 行程/收藏/心愿/纪念/徽章 | `pages/admin/index` | 用户资产可读取 |
| CORE-09 | 旅行纪念 → 生成 → 分享 | `feature/memory/index` | 生成状态明确，分享链路可用 |
| CORE-10 | 中文 / English / العربية | `pages/trip/index.js` | 事实一致、语言可理解 |

## 门禁命令

```powershell
node scripts/core-regression-check.js
node scripts/gold-release-gate.js
node scripts/verify-project.js
node scripts/trip-stability.js
```

`STATIC_PASS` 不等于 `RUNTIME_PASS`。运行门禁必须在微信开发者工具和真机完成，并记录轮次、设备、错误码和延迟。
