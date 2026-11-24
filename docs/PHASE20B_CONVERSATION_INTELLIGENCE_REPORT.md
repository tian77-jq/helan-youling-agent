# PHASE20B Conversation Intelligence Report

## 1. 当前问题

原流程在非问萌宠入口中直接调用 `aiOrchestrator.plan`，导致景点问答、美食问题和模糊问题都可能生成固定行程模板。

## 2. 架构变化

用户输入 → `conversation-state` 上下文解析 → `responseModeRouter` → 低置信度澄清或对应响应模式 → 现有 Cloud AI / Agent Router / Knowledge / Evidence Gate。

## 3. 新增能力

- confidence 与 `need_clarification`。
- `CLARIFICATION_MODE`。
- 多轮实体引用，如“第二个详细说说”。
- 回答风格层：岩羊探索、沙狐文化、双峰驼规划/美食。
- 响应格式层：文本探索、时间轴路线卡、文化故事、美食列表、路线调整。

## 4. 30 条测试结果

执行 `node scripts/conversation-intelligence-eval.js`，结果写入终端 JSON；验收目标为 30/30 PASS。详细测试集见 `docs/AI_CONVERSATION_TEST.md`。

## 5. 核心功能回归

未修改首页、TabBar、商城、我的、Vision、Trip Agent 核心架构和 Cultural Game。应执行 `node scripts/core-regression-check.js`，并在微信开发者工具完成 AI灵游、问萌宠、文化闯关、商城、我的人工运行检查。

## 6. 下一步建议

在真实 Cloud AI 环境分别运行 30 条测试，记录每条回答的 knowledgeIds、response_mode 和 Evidence Gate 结果，再进行真机多轮体验验收。
