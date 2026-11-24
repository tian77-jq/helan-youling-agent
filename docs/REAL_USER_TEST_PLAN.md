# 真实用户测试计划

目标：验证真实用户能否完成核心任务，并把问题转成产品修改证据。当前未执行的数量统一记为 `0`，不得用估算替代。

## 轮次

| 轮次 | 目标样本 | 重点 | 状态 |
|---|---:|---|---|
| Round 1 | 30 | 首次使用、计划完成、AI可信度、错误理解 | PLANNED |
| Round 2 | 100 | 多群体对比、三语、分享与心愿 | PLANNED |
| Round 3 | 200–300 | 稳定性、复访、合作场景 | PLANNED |

样本尽量包含宁夏本地学生、外地大学生、游客、家庭用户、国际学生，以及 English / Arabic 用户；项目组成员不作为唯一样本。

## 任务与埋点

`app_open`, `plan_start`, `plan_success`, `trip_adjust`, `ask_pet`, `vision_start`, `vision_match`, `vision_unknown`, `challenge_start`, `challenge_complete`, `badge_unlock`, `memory_generate`, `share`, `product_intent`。

记录：完成/失败、失败阶段、耗时、是否需要帮助、可信度评分、开放反馈。输出指标：Plan Completion Rate、Vision Completion Rate、Challenge Completion Rate、Share Rate、Wishlist Intent Rate、Error Rate、Crash Rate。
