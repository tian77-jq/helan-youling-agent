# 开放问答与个性化规划根因报告

## 结论

小程序确实接入了 CloudBase AI，模型配置为 `cloudbase / hy3`，真实调用函数是 `wx.cloud.extend.AI.createModel('cloudbase').generateText({model:'hy3', messages})`。此前问题的主因不是混元不能回答，而是首页入口和输出解析把请求挡在模型之前或模型之后。

## 已定位的根因

1. 首页 `pages/index/index.js` 的 `startTrip()` 曾把所有输入固定为 `mode:'guide'`。因此“预算300元、学生、两个人、想去贺兰山和沙坡头”没有进入规划链。
2. 问答入口遇到未命中的开放问题时，`response-mode-router` 返回 `CLARIFICATION_REQUIRED`，orchestrator 直接返回本地澄清话术，没有调用开放问答模型。
3. Hunyuan 偶尔在 JSON 外增加说明文字，原来的严格 `JSON.parse` 会把有效回答判为失败，再显示本地兜底，造成“像没有用 AI”。
4. 旧构建可能继续被微信开发者工具缓存，已更新运行构建标记为 `20260822-ai-dispatch-open-planning-10`。
5. 点名景区但只说“规划/安排一下”时，原规则要求额外出现天数或同行人；现在“规划一下沙坡头”本身已作为明确规划请求处理。
6. Cloud AI 结果读取增加 `choices.message.content`、`text`、`content` 与 `result.content` 兼容，并记录模型原文预览，避免真实运行时因返回结构差异误走兜底。

## 修复后的真实分流

- 首页自然语言入口：明确规划条件进入 `plan`，知识、开放表达进入 `guide`。
- `guide` 中任何非空、未命中的问题进入 `GENERAL_DISCOVERY`，交给 Hunyuan 开放回答，不再被澄清模板截断。
- 开放模型输出支持抽取包裹在说明文字中的 JSON；没有 JSON 包装但有足够长度的自然语言时，直接保留回答。
- 检测到“系统占位、没有具体内容”等模型协议占位话术时，自动用同一 Hunyuan 发起一次纯文本重试，禁止占位内容进入用户界面。
- Cloud AI 初始化、模型创建失败会输出 `[CLOUD_AI_PREFLIGHT]`，不再静默。

## 需要在微信开发者工具确认的日志

输入“宁夏有名的大学是什么”应看到：

`mode=guide`、`intent=GENERAL_DISCOVERY`、`prompt_type=open_answer`、`model=hy3`。

输入“预算300元，学生，两个人，想去贺兰山，我还想去沙坡头”应看到：

`mode=plan`、`intent=TRIP_PLANNING`、`selected_agent=camel`，并先出现 `[CLOUD_AI_PREFLIGHT] ready=true` 或明确的 Cloud AI 错误原因。

## 当前状态

代码链路已修复；微信开发者工具/真机结果仍必须以构建标记 10 和上述日志为准，不能用 Node 模拟测试替代真实运行验证。
