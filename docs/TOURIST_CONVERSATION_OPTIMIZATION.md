# Tourist Conversation Optimization

## 1. 目标

将 AI 从“客服式选项询问”调整为“主动宁夏导游”：明确问题直接解决，信息不足时才澄清，不再对具体景点问题统一返回“请选择 1/2/3”。

## 2. 架构变化

用户输入 → `responseModeRouter` → `tourist-context-parser` → `response-behavior-router` → 现有 Cloud AI / Agent Router / Knowledge / Evidence Gate → `response-formatter`。

新增文件：

- `utils/tourist-context-parser.js`
- `utils/response-behavior-router.js`
- `scripts/tourist-conversation-eval.js`

更新文件：

- `utils/response-mode-router.js`
- `utils/response-formatter.js`
- `utils/ai-orchestrator.js`
- `utils/cloud-ai.js`

## 3. 游客上下文

解析时间、地点、景点、同行人、年龄、兴趣、预算和行动约束。例如“明天带父母银川一天怎么玩”会提取银川、父母、一天和行程规划意图；“贺兰山岩画有什么值得了解和注意的”会识别为具体文化问答，不再进入澄清。

## 4. 行为规则

| 条件 | 行为 |
|---|---|
| 明确景点问题 | `story_explanation`，直接文化故事与注意事项 |
| 明确美食问题 | `direct_answer`，美食列表与体验建议 |
| 明确时间/同行人/路线需求 | `trip_plan`，调用现有 Trip Agent |
| 清晰的一般探索 | `direct_answer`，文本优先 |
| 信息不足且无法判断目标 | `clarification` |

## 5. 20 条真实游客问题测试

执行：`node scripts/tourist-conversation-eval.js`

当前结果：`20/20 PASS`。

脚本逐条输出：`intent`、`confidence`、`context`、`behavior`、`final_response`。覆盖景点文化问答、父母出游、美食、首次到访注意事项、老人适配、模糊问题、预算、摄影、亲子和半日游。

关键验收：

- “贺兰山岩画有什么值得了解和注意的？” → `ATTRACTION_QA` → `story_explanation`
- “明天带父母银川一天怎么玩？” → `TRIP_PLANNING` → `trip_plan`
- “宁夏有什么美食？” → `FOOD_RECOMMENDATION` → `direct_answer`
- “第一次去宁夏需要注意什么？” → `GENERAL_DISCOVERY` → `direct_answer`
- “西夏陵适合老人吗？” → `ATTRACTION_QA` → `story_explanation`

## 6. 安全边界

未新增 Agent；未修改首页、TabBar、商城、Vision 或 Trip Agent 核心。所有事实回答仍需经过现有 Knowledge 与 Evidence Gate，实时票价、开放时间、天气和交通信息继续要求官方核验。
