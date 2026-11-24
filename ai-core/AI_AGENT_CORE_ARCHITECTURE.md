# AI Agent Core

用户 → AI Orchestrator → Intent Router → Tour/Culture/Vision/Commerce Agent → Knowledge Grounding → 腾讯混元 Provider → 结构化结果/数字资产。

Orchestrator 只负责路由和生命周期，不把模型密钥放在前端；每个 Agent 都必须返回 success、mode、source 或 evidence，并具备本地降级。
