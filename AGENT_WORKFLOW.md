# Agent 工作流

```text
用户问题
  ↓
Master Agent：识别任务类型与约束
  ├─ Tour Agent：天数/人数/兴趣/预算 → 路线
  ├─ Culture Agent：西夏/黄河/贺兰/美食 → 证据讲解
  ├─ Creative Agent：景区 × 文化 × 萌宠 → ImagePrompt
  └─ Commerce Agent：作品 → IP 商品/景区合作路径
  ↓
Knowledge Grounding：校验 source/type/confidence
  ↓
前端结构化渲染
```

任何子 Agent 失败都返回明确降级状态，不阻塞首页或其他模块。
