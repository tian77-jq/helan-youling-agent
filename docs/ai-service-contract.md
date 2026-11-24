# AI 安全后端接口契约

## 图片识别

`POST /v1/recognize`

- Content-Type：`multipart/form-data`
- 图片字段：`image`
- 其他字段：`locale`，取值 `zh-CN`、`en-US` 或 `ar`
- 建议限制：单图、压缩后上传、服务端校验 MIME/文件头/尺寸，20 秒内响应

成功响应：

```json
{
  "data": {
    "id": "helan-rock-painting",
    "name": "贺兰山岩画",
    "confidence": 0.92,
    "culturalTags": ["史前文明", "岩画", "贺兰山"],
    "agentId": "sand-fox"
  }
}
```

`id` 必须是小程序 `knowledge/index.js` 已知条目。客户端会拒绝未知 ID，避免模型自由生成一个不存在的景点。

## 服务端要求

- API Key、Secret 和模型 Token 只存放在服务端安全环境变量或密钥管理服务。
- 使用 HTTPS、微信合法域名、用户/设备级限流、大小限制、内容安全检查和访问日志脱敏。
- 不在日志记录原图、EXIF、用户问题正文或身份信息。
- 图片仅为当次识别短暂处理；明确自动删除时限并在隐私政策中披露。
- 模型超时、拒答、空结果或 JSON 失败时返回受控错误，不返回内部堆栈。
- 生产环境应把识别结果与可信知识库匹配，再返回稳定 ID。

## 未实现接口

当前没有生产大模型行程规划接口。若未来接入，应复用现有结构化 Schema，并在服务端做 JSON Schema 校验、事实检索、超时、重试、幂等与费用保护；客户端仍保留本地知识 Agent 作为稳定降级能力。

