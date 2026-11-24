# AI_INTENT_ROUTING_REPORT

## 结果

已增加 `responseModeRouter`，位于 `utils/response-mode-router.js`。它在 Trip Agent 之前识别用户意图并输出：

```json
{"intent":"TRIP_PLANNING","confidence":0.95,"response_mode":"itinerary_card"}
```

支持五类：

- `GENERAL_DISCOVERY` → `text_exploration`
- `TRIP_PLANNING` → `itinerary_card`
- `ATTRACTION_QA` → `cultural_explanation`
- `FOOD_RECOMMENDATION` → `food_recommendation`
- `ADJUST_TRIP` → `adjust_existing_trip`

## 10 条路由测试

执行：`node scripts/intent-routing-eval.js`

预期：10/10 PASS。

覆盖问题：宁夏有什么好玩的、第一次来怎么玩、宁夏有哪些值得看的地方、两天怎么玩、两天行程安排、西夏陵是否值得去、贺兰山岩画、宁夏美食、第一次来吃什么、少走一点。

## 调用链

用户输入 → `responseModeRouter` → 现有 Cloud AI / `askPet` 或 Trip Agent → 宁夏 Knowledge / Evidence Guard → 对应文本或行程卡片。

没有更换模型，没有新增 Agent，没有修改 Trip Agent 的规划规则。

## GOLD_CORE

未修改首页、TabBar、商城、AI灵游核心入口、问萌宠 Agent、Trip Agent、Cultural Game。
