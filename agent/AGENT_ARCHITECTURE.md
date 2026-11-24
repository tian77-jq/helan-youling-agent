# 多 Agent 架构

```text
AI 总控 Agent
├─ 旅游规划 Agent：需求解析、画像、路线
├─ 文化讲解 Agent：西夏、黄河、贺兰文化
├─ 视觉创作 Agent：景区 × 文化 × 萌宠 Prompt
└─ 商业推荐 Agent：IP 商品、数字纪念和合作路径
```

总控只负责任务路由和上下文，不直接编造事实；子 Agent 必须从 Knowledge Grounding Layer 获取证据，并返回 `source/type/confidence`。
