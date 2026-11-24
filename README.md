# 贺兰有灵 · AI 文旅智能体小程序

> 懂宁夏、会规划、能讲解、能创作的 AI 文旅智能体。以微信小程序为载体，把文化问答、行程生成与连续修改接入同一交互流程，并给出景点来源与路线风险说明。

[![Platform](https://img.shields.io/badge/Platform-微信小程序-07C160)](https://developers.weixin.qq.com/miniprogram/dev/)
[![Architecture](https://img.shields.io/badge/Architecture-多Agent%20%2B%20RAG-blue)](#技术架构)
[![i18n](https://img.shields.io/badge/i18n-zh%20%2F%20en%20%2F%20ar-orange)](#核心能力)

## 项目简介

在原有「贺兰山生态 IP + 景区联名 + 美食联名 + 故事馆 + 商城」微信小程序上进行最小侵入式升级，让 AI 旅行任务成为主流程。项目曾获中国国际大学生创新大赛校赛铜奖，并参加 2026 微信小程序开发大赛。

**我在项目中的角色：项目负责人 / 核心开发。** 负责多 Agent 编排、行程生成与约束校验、意图路由与跨轮上下文、三语规划核心，以及知识库与本地降级链路。

## 核心能力

- **AI 灵游**：识别时间、天数、城市、人数、预算、亲子/老人/学生、兴趣、节奏与交通偏好，输出结构化行程卡片。
- **连续修改**：基于当前方案执行少走、降预算、亲子、老人、文化、美食和重新规划等调整，无需从头生成。
- **宁夏知识库**：景区、美食、角色与安全提示优先于自由生成，降低幻觉风险。
- **萌宠 Agent**：岩羊（生态探索官）、沙狐（文化故事官）、双峰驼（宁夏旅行官）。
- **三语支持**：同一业务逻辑支持 `zh-CN`、`en-US`、`ar` 的规划核心结果。
- **旅行纪念**：模板、既有联名视觉与个性文案组合，支持本机保存与微信分享。
- **拍一拍**：真实调用可配置的安全识别后端；未配置时明确报错，不伪造识别结果。

## 工程亮点（可复现验证）

| 方向 | 做法 | 验证结果 |
| --- | --- | --- |
| 多 Agent 分工与多轮意图切换 | 主控 Agent 路由行程、文化、创作、商品等专职 Agent，结合已有行程状态判定修改意图，统一接入知识来源与本地降级 | 意图路由 **40/40**、跨轮上下文 **50/50** |
| 路线生成可执行性约束 | 覆盖 8 类约束的确定性检查器，保留必访点并限制自动修复最多 2 轮 | 50 条本地回放中，通过检查且每日有安排的行程由 **20/50 → 45/50** |
| 显式偏好与默认时段冲突 | 规划器复用结构化约束和景点知识目录，按用户偏好及地点规则排布时段 | 览山公园、博物馆、沙坡头等时段用例复跑 **5/5** |

复跑脚本与详细记录见 [`evaluation/`](evaluation/) 与 [`docs/`](docs/)。

## 技术架构

```text
pages/                  小程序页面（首页 / AI 灵游 / IP 故事馆 / 伴手礼 / 商城）
feature/                详情、拍照、旅行纪念、问卷等分包
utils/trip-agent.js     意图解析、约束解析、行程规划、连续修改与讲解（本地知识 Agent）
utils/ai-orchestrator.js Cloud / Local 混合编排与 fallback
utils/cloud-ai.js       CloudBase AI 受控 JSON 调用与 Schema 校验
knowledge/index.js      宁夏景区、美食与萌宠角色结构化知识
config/cloud.js         CloudBase 环境、AI_MODE 与 Feature Gate（唯一配置入口）
adapters/ providers/    模型与能力适配层
cloudfunctions/         Vision / TTS / 行程规划等云函数安全失败脚手架
docs/                   架构、评测与工程说明
```

**AI 策略**：`AI_MODE=hybrid` 时先尝试 CloudBase AI 解析旅行意图，再交给本地 Knowledge + trip-agent 组合事实行程；云端不可用、超时或 JSON 不合规时自动降级到本地 Agent，保证核心流程可用。模型是否已在 CloudBase 控制台启用需人工确认。

## 运行方式

1. 使用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)导入本目录。
2. `project.config.json` 中保留了原项目 AppID。若你没有该项目权限，可在导入时选择「测试号」，或使用自己的 AppID；核心的本地知识 Agent、行程规划与连续修改逻辑不依赖特定账号即可运行。
3. 点击「编译」，重点验证首页、AI 灵游、拍照页、旅行纪念、IP 故事馆和商城。
4. 发布前开启合法域名校验，并在微信公众平台配置正式 HTTPS 服务域名。

本项目没有 npm 依赖和单独构建命令；开发者工具使用的基础库版本见 `project.config.json`。

### 静态验证

```bash
node --check utils/trip-agent.js
node --check utils/ai-orchestrator.js
python -c "import json; json.load(open('app.json', encoding='utf-8'))"
```

最终必须在微信开发者工具中执行编译、模拟器多尺寸检查和真机预览。

## CloudBase / AI 服务配置

`config/cloud.js` 是唯一配置入口。当前配置要点：

- `AI_MODE: 'hybrid'` — 云端优先、本地兜底。
- `featureVisionEnabled: false` — 比赛版本不开放视觉入口、不发起视觉模型请求，避免图片 token 成本。
- 图片识别使用 Cloud Storage 与 `visionRecognize` 云函数契约；未接通时不上传图片、不生成猜测结果。

任何模型 Key、Secret 或 Token 只能存放在服务端环境变量或密钥管理服务，不得写入客户端代码。云函数 `cloudfunctions/ttsSpeak/config.js` 中的凭据均从环境变量读取。

## 安全与隐私设计

- 不在客户端存储任何模型密钥。
- 埋点（`utils/tracker.js`）不记录用户问题正文、图片路径、聊天内容或个人身份。
- 票价、开放时间、预约、天气和交通班次不由模型自由生成，统一提示以官方最新公告为准。
- 图片仅用于当次上传识别；正式后端需落实传输加密、最短留存与删除策略。

## 文档索引

- [技术架构](docs/competition-tech-architecture.md)
- [第三方资源说明](docs/third-party-resources.md)
- [AI 服务契约](docs/ai-service-contract.md)
- [CloudBase 生产就绪清单](docs/cloudbase-production.md)
- [意图路由报告](AI_INTENT_ROUTING_REPORT.md)
- [产品能力审计](docs/PRODUCT_CAPABILITY_AUDIT_20260927.md)
- [全域评测基线](docs/trip-planning-global-benchmark.md)

---

**注意**：本项目为竞赛与作品集展示用途。发布、提审、隐私协议、域名、API 密钥和比赛报名均需人工处理。
