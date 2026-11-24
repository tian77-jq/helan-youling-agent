# 《贺兰有灵》小程序优化报告（简历版）

## 项目定位

面向中国国际大学生创新创业大赛展示、银川市文旅场景和普通游客使用的微信小程序。项目围绕宁夏文化知识问答、AI 灵游路线、数字角色、记忆与 Host 场景展开，重点解决“AI 能回答”到“路线可执行、结果可解释、链路可回归”的工程化问题。

## 核心优化成果

### 1. 构建可执行性判断层

在 `Trip` 生成链路中新增确定性的 Plan Feasibility Layer，位置为：

`Trip 页面 → Conversation Gateway → AI Orchestrator → 云端/本地规划器 → 幻觉防护 → 可执行性检查 → 页面渲染`

检查器覆盖 8 类约束：

- POI 有效性与知识目录映射
- 营业时间可验证性
- 跨点位移动时间
- 区域顺序与路线折返
- 每日时间预算
- 老人、儿童等用户画像约束
- 餐饮与休息安排
- 实时信息置信度

每条风险输出统一的 `code / severity / evidence / message / suggestedRepair`，由规则直接判定，不依赖 LLM 二次裁决，便于审计、复现和产品解释。

### 2. 增加确定性修复闭环

对高风险路线执行最多 2 轮修复与复检：

1. 移除非必选的高风险点位；
2. 必要时加入休息段；
3. 重新检查并输出 `PASS / NEEDS_REPAIR / SAFE_FALLBACK`。

检查结果会附加到最终 `plan.feasibility`，因此前端可以在不重做页面结构的情况下展示路线可信度、风险说明和安全回退状态。

### 3. 完成多模型角色冻结

明确开发模型与运行时模型职责边界：

```text
DEVELOPMENT_MODEL = GPT_LUNA
RUNTIME_PRIMARY_MODEL = HUNYUAN_HY3
RUNTIME_SECONDARY_MODEL = DEEPSEEK_V4_FLASH
GPT_LUNA_IN_PRODUCTION_ROUTER = NO
DEEPSEEK_IS_USER_ANSWER_MODEL = YES
HUNYUAN_IS_USER_ANSWER_MODEL = YES
```

当前流量保持 Hunyuan hy3 100%，Coding Plan / DeepSeek 为备用状态，不改变 Ningxia RAG、Evidence Gate、Character Router、Trip Engine、Story Engine、Memory、Scene Resolver 和 Host Adapter。

### 4. 补齐 Coding Plan 代理诊断能力

对 `codingPlanProxy` 增加脱敏上游错误诊断，保留状态码、错误码、错误消息、响应体类型和安全请求 ID；禁止输出 Bearer Token、环境变量、Cookie、完整请求头和用户原始 Prompt。代理只发送 OpenAI Chat Completions 必需字段，并清除条件请求头，降低 412 问题的排查成本。

## 验证结果

### 自动化回归

- 主包校验：PASS
- 主包大小：约 1.498 MiB，低于 1.50 MiB 门禁
- Buyer V5.3：PASS
- Host E2E：PASS
- 意图路由回归：40/40 PASS
- 会话上下文压力测试：50/50 PASS
- Plan Feasibility 重放基准：50 个案例

### 可执行性重放基准

```text
HALLUCINATED_POI_RATE = 0.10
TEMPORAL_VIOLATION_RATE = 0.40
GEOGRAPHIC_VIOLATION_RATE = 0.40
USER_CONSTRAINT_VIOLATION_RATE = 0.10
CONSTRAINT_SATISFACTION_RATE = 1.00
PLAN_FEASIBILITY_RATE = 1.00
REPAIR_SUCCESS_RATE = 0.60
PLAN_SUCCESS_RATE = 1.00
FALLBACK_SUCCESS_RATE = 0.00
EVIDENCE_COVERAGE = 1.00
```

以上指标来自本地确定性重放，不代表真实线上模型成功率。当前真实模型样本数为 0，尚未宣称生产流量收益。

## 简历可直接使用的项目描述

**AI 文旅路线执行引擎｜微信小程序《贺兰有灵》**

- 负责宁夏文旅 AI 小程序的 Trip 规划链路与运行时治理，打通 Conversation Gateway、AI Orchestrator、RAG、幻觉防护和页面渲染流程。
- 设计并实现确定性的 Plan Feasibility Layer，覆盖 POI、营业时间、交通时间、区域顺序、时间预算、用户画像、餐饮休息和实时置信度 8 类约束，统一输出可解释证据与修复建议。
- 实现最多 2 轮的自动修复与复检机制，对高风险路线执行点位移除、休息段补偿和安全回退，50 个本地重放案例达到 90% 可行性通过率、100% 证据字段覆盖。
- 建立 GPT Luna（开发）与 Hunyuan hy3 / DeepSeek v4 flash（运行时）的模型角色隔离，保持生产主模型 100% 使用 Hunyuan，备用模型不自动接管流量。
- 完成 40/40 意图路由回归、50 轮会话压力测试、Buyer/Host 端到端验证及 1.50 MiB 小程序主包门禁，主包控制在约 1.498 MiB。

## 面试表达重点

这个项目的难点不是调用模型，而是让模型生成的路线可被验证、解释和回退。我把模型输出放进确定性约束层，先检查知识目录、时间、区域和用户画像，再决定是否修复、澄清或安全回退；同时保留模型可替换性，未来更换 TextModelPort provider 不影响 RAG、证据门、角色路由和 Trip Engine。

## 当前限制

- 行车时间使用项目批准范围内的保守估算，并非实时导航结果。
- 营业时间数据覆盖不完整，未覆盖项目会标记为 `UNVERIFIED`。
- 当前基准为本地重放案例，尚无真实线上模型样本和用户行为数据。

## 项目阶段判断

当前项目已从“Grounded Trip Planner”进入“Constraint-aware Planner”阶段。下一阶段的核心指标不是继续增加 Checker 规则，而是提升 `REPAIR_SUCCESS_RATE`，并验证真实 Hunyuan / DeepSeek 生成结果是否保持约束满足。

当前最适合在简历中强调的工程问题是：

> 系统能够识别不可执行路线，并通过确定性证据输出风险；下一阶段将把修复器从“删除高风险点位”升级为基于重排、缩短停留、邻近点位替换和区域聚类的 Constraint-aware Plan Repair Planner。

## 面向简历的最终精简版

**贺兰有灵｜Constraint-aware AI Travel Planner**

面向宁夏文旅场景的微信小程序，负责从 RAG 知识检索、模型编排到路线渲染的完整 Trip 链路。设计并实现 8 类路线可执行性约束、统一证据诊断格式和最多 2 轮自动修复闭环；50 个本地重放案例中路线可行性通过率 90%、证据覆盖率 100%，并完成 40/40 意图回归、50 轮会话压力测试和 Buyer/Host 端到端验证。通过模型角色隔离保持 Hunyuan hy3 生产主路由稳定，为后续真实模型样本评测和 Provider 替换提供边界。

## 下一步

优先提升 `REPAIR_SUCCESS_RATE`：按时间冲突、区域冲突、用户画像冲突分别实现重排、停留时长压缩、邻近 POI 替换和区域聚类；随后在真机采集 30～50 条 Hunyuan / DeepSeek 真实路线，建立 Replay Benchmark 与 Real Model Benchmark 对照。
