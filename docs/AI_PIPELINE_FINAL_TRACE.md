# AI Pipeline Final Trace

## 真实入口

`pages/index/index.js` 或 `pages/trip/index.js` → `navigation.openTripPlanner()` → `pages/trip/index.js:generate()` → `utils/ai-orchestrator.respond()`。

## 当前责任链

|阶段|实现|输出|
|---|---|---|
|用户输入|`pages/trip/index.js`|原始自然语言|
|会话|`conversation-manager.js`|session、历史轮次|
|游客记忆|`tourist-context-memory.js`|同行人、预算、偏好、限制|
|实体理解|`tourist-entity-parser.js`|地点、城市、预算、天数、同行人、约束|
|意图|`response-mode-router.js`|问答/美食/文化/规划|
|规划约束|`trip-agent.parseConstraints()`|硬地点、城市、预算、同行人、天数|
|模型补充|`cloud-ai.extractIntent()`|只补充缺失字段，不得覆盖明确约束|
|生成|`trip-agent.planTrip()`|本地核验景点、图片和时段|
|开放问答|`cloud-ai.askOpen()`|混元开放表达；偏题自动重试|
|事实边界|`knowledge-grounded-answer.js` + `ask-pet-ai.js`|已知事实直接回答，未知事实不编造|
|展示|`response-formatter.js` + `pages/trip/index.wxml`|文本或行程卡片|

## 根因

此前混元意图 JSON 拥有了过高权限：它可以把用户明确说过的景点、城市、同行人和限制改成默认值。示例问题能答，是因为示例刚好命中规则；自然改写则暴露了覆盖问题。

## 约束优先级

`EXPLICIT_USER_CONSTRAINT_PRIORITY` 已落实：用户原话中的地点、城市、预算、同行人、低步行、天数优先；模型只负责补充缺失信息。

## 开放问答边界

高校问题使用核验事实白名单：宁夏大学、北方民族大学、宁夏医科大学。未知事实不得由模型自由创造；开放创作仍允许使用 Cloud AI，但不得把想象写成史实。

## 日志

真实运行可观察：

- `[TOURIST_ENTITY_TRACE]`
- `[CLOUD_AI_RAW_RESPONSE]`
- `[OPEN_AI_RETRY]`
- `[AI_PIPELINE_TRACE]`
- `[FINAL_RESPONSE_TRACE]`

## 当前状态

代码级链路已完成实体层、明确约束优先和 Cloud AI 行程决策层改造。规划使用 `cloud-ai-planner` 生成，所有景点必须通过本地知识 ID 校验；若模型丢地点或擅自增加地点，自动回退安全基线。微信运行验证必须使用构建 13，并检查上述日志；本报告不把 Node 回归结果冒充真机结果。
