# AI Response Evaluation

## 评价维度

每条回答按以下六项检查：

1. 是否理解用户需求：输入中的目的、对象、时间和限制是否被保留。
2. 是否进入正确模式：intent 与 response_mode 是否匹配。
3. 是否避免固定模板：探索、文化、美食问题不应强行输出 DAY1/DAY2。
4. 是否引用 Knowledge：回答涉及宁夏事实时必须有 knowledgeIds 或本地知识依据。
5. 是否通过 Evidence Gate：知识库外实体、票价、开放时间和实时信息不得被确认输出。
6. 是否存在幻觉：不扩大事实、不捏造景区、数据或承诺。

## 本阶段验收标准

- 30 条路由测试全部 PASS。
- 低置信度问题进入 `CLARIFICATION_MODE`，不调用 Trip Agent 生成路线。
- 多轮引用问题先解析 `conversation-state`，再进入对应模式。
- `TRIP_PLANNING` 使用行程卡片；其他模式保持文本优先或对应列表/文化表达。
- Agent 数量保持三只萌宠，不新增第五个 Agent。
