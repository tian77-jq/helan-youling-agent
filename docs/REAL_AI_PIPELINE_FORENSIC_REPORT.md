# PHASE22 — REAL AI PIPELINE FORENSIC REPORT

## REAL_AI_PIPELINE_STATUS

`IMPLEMENTED_PENDING_MANUAL_WECHAT_VALIDATION`

本报告基于真实微信入口代码追踪和运行日志埋点完成。当前环境没有微信开发者工具运行会话，因此人工输入结果不虚构，需在开发者工具中执行最后三组验证。

## 1. 真实调用链

真实用户输入从 `pages/trip/index.js` 的 `generate()` 进入：

```text
pages/trip/index.js · generate()
  ↓
conversation-manager.getSession()
  ↓
tourist-context-memory.ingest()
  ↓
responseModeRouter()
  ↓
responseBehaviorRouter()
  ↓
ai-orchestrator.respond()
  ├─ TRIP_PLANNING → plan() → trip-agent.planTrip()
  ├─ ADJUST_TRIP   → adjust() → trip-agent.adjustTrip()
  └─ 文本回答       → ask-pet-ai → Cloud AI → Evidence Gate / local answer
  ↓
response-formatter
  ↓
pages/trip/index.js 渲染 text 或 plan
```

`pages/trip/index.js` 已移除直接的 `tripAgent`、`travelPlanner`、`routePlanner`、`generateTrip` 引用。页面所有 AI 请求均通过 orchestrator：包括普通输入、guide 模式和景点讲解入口。

## 2. 原绕过位置与真实原因

原先的主要绕过点不在页面主 `generate()`，而在文本回答的 fallback：

```text
ask-pet-ai.js
  Cloud AI 失败 / JSON 无效
  ↓
tripAgent.explainKnowledge()   ← 错误旁路
```

同时，未知 route 曾默认选择 `camel`（宁夏旅行官），使 food、culture、general 的最终 agent 变成旅行规划语义。

现在已改为：

- FOOD：直接使用 food knowledge 生成 food answer
- CULTURE：直接使用 attraction knowledge 生成 story answer
- GENERAL：直接使用 discovery knowledge 生成 direct answer
- TRIP：只有明确规划时调用 trip-agent

## 3. Cloud AI 实际 messages

`utils/cloud-ai.js` 现在明确构造三段消息：

```text
SYSTEM:
你是宁夏AI旅行伙伴……只有用户明确要求安排行程时才生成路线。

SYSTEM:
HISTORY:
USER: 第一次来宁夏
ASSISTANT: ……

USER:
带父母
知识库事实: ……
```

第二轮不再只发送“带父母”。history 来自同一 `sessionId` 的 `conversation-manager.history`，最多发送最近 8 条消息。

新增日志：

```text
[REAL_AI_TRACE] user_input=... page=pages/trip/index.js sessionId=... conversation_history=... intent=... behavior=...
[REAL_AI_TRACE] agent=... prompt=... model=... response=pending
[REAL_AI_TRACE] prompt=... history=... model=...
[REAL_AI_TRACE] response=...
```

## 4. Session 隔离原因与修复

原先页面初始化时可能从旧的 `conversation-state` 读取内容，但新 AI session 没有在页面真实入口完成可观察的切换日志。

现在：

- `onLoad()` 创建新聊天 session。
- 同一页面连续调用 `generate()` 保持原 `sessionId`。
- `conversation-manager` 每次恢复/复用打印：

```text
[SESSION] old=s_xxx new=s_xxx
```

- 新聊天打印：

```text
[SESSION] old=s_old new=s_new
```

- history 和 tourist context 都按 session 保存。

## 5. 修改文件

- `pages/trip/index.js`
- `utils/ai-orchestrator.js`
- `utils/ask-pet-ai.js`
- `utils/cloud-ai.js`
- `utils/conversation-manager.js`
- `utils/tourist-context-memory.js`
- `docs/REAL_AI_PIPELINE_FORENSIC_REPORT.md`

未新增 Agent、页面或模型；未修改首页 UI、TabBar、商城、Vision。

行程调整入口也已补齐同一 session 的 context、history 和 Cloud AI trace，不再存在未携带会话上下文的 AI 调整调用。

## 6. 微信开发者工具人工测试

当前环境无法代替用户操作微信开发者工具，因此状态必须如实记录为：`待人工执行`。

请在 Console 过滤 `REAL_AI_TRACE`，执行：

### 测试 1

输入：`宁夏有什么特色美食？`

应观察：

```text
intent=FOOD_RECOMMENDATION
behavior=FOOD_GUIDE
agent=rock-goat
prompt=food_answer
final_mode=text_first
```

不得出现 `trip-agent.planTrip` 或 `final_mode=itinerary_card`。

### 测试 2

输入：`贺兰山岩画有什么值得了解和注意？`

应观察：

```text
intent=ATTRACTION_QA
behavior=STORY_EXPLANATION
agent=sand-fox
prompt=story_answer
final_mode=text_first
```

### 测试 3

同一聊天连续输入：

1. `第一次来宁夏`
2. `带父母`
3. `少走路`

第二轮 Cloud AI 的 `HISTORY` 必须包含第一轮；第三轮必须包含前两轮。最终才允许出现：

```text
intent=TRIP_PLANNING
behavior=TRIP_PLAN
final_mode=itinerary_card
```

并且上下文应包含 `first_visit=true`、`companions=[parents]`、`action_limits=[low_walking]`。
