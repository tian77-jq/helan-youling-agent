# AI Conversation Flow Audit

## 旧链路

首页快捷卡片与输入框最终都曾在页面层决定行为，页面自身调用 `generate()` 或其他问答方法；这使入口行为依赖 `mode`、按钮来源和页面状态，形成“快捷示例正常、手动输入异常”的风险。

## 统一链路

现在所有文本请求统一经过：

`pages/index/index.js` / `pages/trip/index.js` → `utils/conversation-gateway.js:handle(input)` → `tourist-entity-parser` → `ai-orchestrator.respond` → `response-mode-router` → `response-behavior-router` → 知识问答或 Cloud AI 规划 → `hallucination-guard` → `response-formatter` → 页面 renderer。

快捷问题和手动输入只允许在 `input` 值来源上不同，不能再决定 intent、agent、prompt 或 formatter。行程调整和景点讲解也已收口到同一 Gateway，页面不再直接发起文本 AI 请求。

## 入口对照

|入口|页面函数|统一入口|最终决策|
|---|---|---|---|
|快捷问题|`useQuick()`|`conversationGateway.handle()`|由自然语言内容决定|
|手动输入|`inputPrompt()` + `generate()`|`conversationGateway.handle()`|由自然语言内容决定|
|首页问灵灵|`startTrip()` → 页面提交|`conversationGateway.handle()`|由自然语言内容决定|
|景点讲解|`guideTopic()` / `explain()`|`conversationGateway.handle()`|由自然语言内容决定|
|行程调整|`adjust()`|`conversationGateway.handle()`|保留已有行程后再调整|

## 规划决策权

用户原话中的地点、城市、同行人、预算、天数和步行限制属于硬约束。Cloud AI 负责生成行程建议，但生成结果必须使用本地知识 ID；丢失用户地点或增加未请求地点时，回退到保留硬约束的安全基线。

## 当前状态

入口统一代码已完成。规划不再只有“参数抽取 + 固定本地路线”：有效 Cloud AI 响应会进入 `cloud-ai-planner`；无效响应才由本地安全路线接管。快捷/手动一致性测试为 6/6，自然语言实体与规划压力测试为 13/13。最新构建标记为 14。
