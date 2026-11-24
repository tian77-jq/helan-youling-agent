# Coding Plan Proxy

小程序不直接持有 Coding Plan Token。部署此云函数后，在 CloudBase 云函数环境变量中配置：

- `CODING_PLAN_TOKEN`：新的 Coding Plan Token（不要提交到仓库）
- `CODING_PLAN_ENDPOINT`：可选，默认 `https://chatapi.weixin.qq.com/openai/v1/chat/completions`
- `CODING_PLAN_MODEL`：可选，默认 `Deepseek-v4-flash`

前端仅通过 `wx.cloud.callFunction({ name: 'codingPlanProxy', data: { messages } })` 访问。
