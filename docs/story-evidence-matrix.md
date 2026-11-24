# Story Evidence Matrix

|字段|用途|生产门槛|
|---|---|---|
|storyId|稳定引用和分享|唯一、可追踪|
|knowledgeIds|连接宁夏知识库|至少一个有效知识 ID|
|facts|可核验事实|不能混入纯文学判断|
|narrative|角色化表达|不得改变 facts|
|whyItMatters|文化意义解释|标记为 interpretation|
|relatedPlaces|地点锚定|至少一个地点或明确待核验状态|
|interaction|轻互动|找/猜/选/看之一|
|action|行动出口|问角色、路线、地点或创作至少一项|
|status|发布状态|`PRODUCTION` / `TO_VALIDATE`|

## Gate

内容进入生产前检查 `FACT_SUPPORTED`、`PLACE_MATCH`、`CHARACTER_MATCH`、`NO_HALLUCINATION` 和 `CTA_WORKS`。证据不足时使用 `CONTENT_EVIDENCE_INSUFFICIENT`，不为了叙事完整而补写历史事实。
