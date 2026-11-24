# PHASE21D — AI Response Pipeline Root Cause Audit

## AI_RESPONSE_ROOT_CAUSE_STATUS

**ROOT_CAUSE_CONFIRMED_AND_FIXED**

## 真实根因

Intent Router 并不是唯一决定最终回答的地方。原链路在文本回答阶段存在两个旁路：

1. `utils/ask-pet-ai.js` 的 Cloud AI 失败/返回无效 JSON 时，无论原始意图是什么，都调用 `tripAgent.explainKnowledge()` 作为兜底。
2. `ask-pet-ai.js` 在 route 不明确时默认选择 `agents[2]`，也就是 `camel` / `宁夏旅行官`。

因此：

`FOOD_RECOMMENDATION` 和 `ATTRACTION_QA` 虽然已经被正确路由，最终 fallback agent 仍可能变成 `camel`，用户看到的就是旅游规划语义。这个问题发生在 `Intent → Response Behavior` 之后的 `Agent selection / fallback` 层，不是 Conversation Memory 本身造成的。

另外，原 `response-style.js` 的未知意图默认样式也指向 `camel`，使错误进一步被放大。

## 修复后的真实链路

```text
User Input
  ↓
conversation-manager.restore/getSession
  ↓
tourist-context-memory.ingest
  ↓
responseModeRouter
  ↓
responseBehaviorRouter
  ↓
严格选择回答通道
  ├─ FOOD_RECOMMENDATION → FOOD_GUIDE → food_answer → 文本回答
  ├─ ATTRACTION_QA       → STORY_EXPLANATION → story_answer → 文本回答
  ├─ GENERAL_DISCOVERY   → DIRECT_ANSWER → direct_answer → 文本回答
  ├─ TRIP_PLANNING       → TRIP_PLAN → trip_plan → trip-agent
  └─ ADJUST_TRIP         → TRIP_PLAN → adjust_existing_trip → 路线调整
  ↓
Cloud AI
  ↓
Evidence Gate / local answer fallback
  ↓
response-formatter
  ↓
final_mode
```

## 严格调用规则

- `FOOD_RECOMMENDATION` 禁止调用 `trip-agent`。
- `ATTRACTION_QA` 禁止调用 `trip-agent`。
- `GENERAL_DISCOVERY` 禁止直接生成路线。
- 只有 `TRIP_PLANNING` 才调用 `trip-agent.planTrip`。
- 只有 `ADJUST_TRIP` 且已有行程时才调用 `trip-agent.adjustTrip`。
- 非规划文本回答的 fallback 直接基于当前知识条目生成，不再调用 `tripAgent.explainKnowledge()`。

## 新增运行日志

核心链路输出：

```text
[AI_PIPELINE] input=宁夏有什么美食 intent=FOOD_RECOMMENDATION behavior=FOOD_GUIDE selected_agent=FOOD_GUIDE prompt_type=food_answer final_mode=text_first
[AI_PIPELINE] input=贺兰山岩画历史 intent=ATTRACTION_QA behavior=STORY_EXPLANATION selected_agent=STORY_EXPLANATION prompt_type=story_answer final_mode=text_first
[AI_PIPELINE] input=明天带父母银川一天 intent=TRIP_PLANNING behavior=TRIP_PLAN selected_agent=TRIP_AGENT prompt_type=trip_plan final_mode=itinerary_card
```

`selected_agent` 表示本轮调用通道；只有规划类请求才会出现 `TRIP_AGENT`。

## System Prompt 调整

Cloud AI 现在被明确要求：

- 你是宁夏 AI 旅行伙伴。
- 第一目标是回答用户当前问题。
- 只有用户明确要求安排行程时才生成路线。
- 不将美食、文化和景点问答改写成路线规划。
- 不输出固定客服模板。

## 10 条回归结果

执行：`node scripts/ai-response-pipeline-regression.js`

结果：`AUDIT_OK`，10 条均未进入路线模式。

| 输入类型 | intent | behavior | 调用通道 |
|---|---|---|---|
| 宁夏有什么美食 | FOOD_RECOMMENDATION | FOOD_GUIDE | FOOD_GUIDE |
| 西夏陵值得去吗 | ATTRACTION_QA | STORY_EXPLANATION | STORY_EXPLANATION |
| 贺兰山岩画历史 | ATTRACTION_QA | STORY_EXPLANATION | STORY_EXPLANATION |
| 宁夏特产有哪些 | GENERAL_DISCOVERY | DIRECT_ANSWER | DIRECT_ANSWER |
| 第一次来宁夏注意什么 | GENERAL_DISCOVERY | DIRECT_ANSWER | DIRECT_ANSWER |

完整 10 条用例见 `scripts/ai-response-pipeline-regression.js`。
