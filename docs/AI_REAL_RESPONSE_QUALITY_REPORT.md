# PHASE25B — Real AI Response Quality Audit

## AI_REAL_RESPONSE_QUALITY_STATUS

`READY_FOR_HUMAN_TEST`

## Final user-visible trace

The final rendering point is `pages/trip/index.js`, after `setData()` applies either `petAnswer` or `plan` to page state. It now emits:

```text
[USER_VISIBLE_RESPONSE_TRACE]
input=...
sessionId=...
intent=...
behavior=...
response_style=...
selected_agent=...
prompt_style=...
final_text_length=...
final_text_preview=...
```

The trace uses `petAnswer.answer` for text output and `plan.summary` for a route card, so it represents the text rendered to the visitor rather than Cloud raw JSON.

## Static template audit

The requested phrase search found no active user-output template in page or Cloud prompt code.

| Location | Match | Runtime role | Action |
|---|---|---|---|
| `utils/response-formatter.js` | Service phrases | Removal guard only | Retained as isolation protection |
| `utils/mechanical-response-detector.js` | Service phrases | Detector only | Retained as audit protection |
| `utils/tourist-personality-layer.js` | Service phrases | Prefix cleanup regex only | Retained as cleanup protection |
| Documentation and test fixtures | Route/customer phrases | Documentation/test data | Not rendered to visitors |

No active `pages/trip` template emits “请选择”、“你更想了解”、“我可以帮你”、“第一天”、“第二天”、“第三天” or “推荐路线” in a non-Trip flow.

## Cloud prompt audit

Each real Cloud request now prints the complete final message array:

```text
[REAL_CLOUD_MESSAGES] [
  { role: "system", content: "..." },
  { role: "system", content: "HISTORY: ..." },
  { role: "user", content: "USER: ..." }
]
```

The system role begins:

```text
你是“灵灵”，宁夏AI旅行伙伴。
首要任务是回答用户当前问题，不要主动生成旅行路线。
只有用户明确要求“规划”“安排”或“几天怎么玩”时，才允许生成路线。
```

It contains no `旅游规划助手`、`路线生成` or `行程安排` wording. The behavior clause additionally forbids route/timeline output for food, culture and general discovery.

## Final-text quality test

Script: `scripts/ai-real-response-quality-test.js`

The script invokes the full orchestrator and evaluates the final `answer` or `plan.summary` text for the requested real-user corpus:

| Case | Input | Required result |
|---|---|---|
| A | 宁夏有什么特色美食？ | Direct food introduction, no day template |
| B | 贺兰山岩画有什么值得了解？ | Cultural story, no route |
| C | 西夏陵值得去吗？ | Attraction value analysis |
| D | 第一次来宁夏。 | Basic first-visit guidance |
| E | 第一次来宁夏 → 带父母 → 少走路 | Elder-friendly, low-walking route |

Latest local full-pipeline score:

| Metric | Result |
|---|---:|
| 机械客服率 | 0.00 |
| 直接回答率 | 1.00 |
| 上下文利用率 | 1.00 |
| 错误进入 Trip 比例 | 0.00 |
| 平均回答长度 | 128.25 字符 |

## Static versus real runtime

Static and local-pipeline situation: the source compiles; final-text quality tests and the prior 51-case regression complete with no failures. Non-Trip output is now blocked from passing through route templates, and the final render path has a user-visible trace.

Real WeChat runtime situation: not yet independently observed from this environment because it cannot operate the user’s Developer Tools session or production Cloud model. A new device/Developer Tools run is still required.

## Does it need further fixing?

No additional source fix is indicated by static and local full-pipeline evidence. Further code changes are warranted only if a new WeChat runtime trace shows a mismatch. In that event, capture both `[REAL_CLOUD_MESSAGES]` and `[USER_VISIBLE_RESPONSE_TRACE]`; the first proves what reached the model, and the second proves what the visitor saw.
