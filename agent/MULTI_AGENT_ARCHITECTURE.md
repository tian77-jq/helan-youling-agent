# 多 Agent 竞争壁垒

```text
Master Agent：理解目标、约束和任务类型
├─ TourAgent：画像、检索、路线与证据
├─ CultureAgent：西夏/黄河/贺兰/美食解释
├─ VisionAgent：景区 × 文化 × IP Prompt
└─ CommerceAgent：数字作品、IP 商品、景区合作推荐
```

Master 负责路由，不直接编造事实；子 Agent 通过 Knowledge Grounding 返回证据；任一 Agent 失败都有本地降级。
