# Shapotou E2E Trace Example

脱敏结构示例（不是用户原文）：

```json
{
  "traceId": "trace-demo-001",
  "sessionId": "session-demo-001",
  "steps": [
    {"requestId":"req-001","module":"trip","scenicId":"shapotou","status":"success"},
    {"requestId":"req-002","module":"trip-refinement","scenicId":"shapotou","inherits":"req-001","status":"success"},
    {"requestId":"req-003","module":"story","storyId":"yellow-river-desert","status":"evidence-gated"},
    {"requestId":"req-004","module":"memory","memoryType":"river-desert","status":"DEVICE_RUNTIME_REQUIRED"}
  ]
}
```

Do not place full prompts, secrets, raw private data or provider stack traces in this record.
