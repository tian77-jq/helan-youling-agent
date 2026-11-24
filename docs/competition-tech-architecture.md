# 2026 微信小程序开发大赛技术架构说明

## 真实架构

```text
微信原生小程序
├─ AI 首页：任务入口与内容联动
├─ AI 灵游：输入、结构化行程、连续修改
├─ 拍一拍：相机/相册、上传、识别结果、萌宠讲解
├─ 旅行纪念：模板、既有联名图、个性文案、保存/分享
└─ 原有内容：景区、美食、故事馆、商城、问卷
        ↓
本地 Knowledge Agent（当前可运行主链）
├─ 旅行约束解析
├─ 区域与节奏路线组合
├─ 结构化行程 Schema
├─ 当前方案连续调整
├─ 三语核心文案
└─ 三只萌宠角色讲解
        ↓
knowledge/index.js
├─ 景区
├─ 美食
└─ IP Agent

拍照识别（需部署）
小程序 → Cloud Storage 临时文件 → visionRecognize 云函数 → 经审核的 Vision Provider → 受控 JSON → 本地知识核验 → 萌宠讲解
```

## 小程序端

- `pages/index`：品牌视觉中的 AI Hero、三个 P0/P1 入口、今日灵游。
- `pages/trip`：自然语言输入、语言切换、快捷任务、行程时间线、连续修改、分享。
- `pages/photo`：最小权限选择图片、上传状态、失败处理、可信度与文化标签、四种讲解模式。
- `pages/memory`：旅行场景、萌宠、用户记忆与既有联名视觉组合。
- `utils/tracker.js`：仅本机保存匿名事件，最多 500 条；敏感字段名会被剔除。

## Agent 与工具化能力

当前没有伪装成大模型 Tool Calling，而是把能力拆成可测试函数：

- `parseConstraints`：时间、天数、城市、人数、预算、人群、兴趣、节奏、交通。
- `planTrip`：按区域与约束组合景区、美食和弹性时间。
- `adjustTrip`：以当前方案约束为上下文进行修改。
- `explainKnowledge`：由匹配的萌宠角色讲解知识条目。
- `recognizeImage`：调用安全后端并校验受控响应。

未来接入支持 Function Calling 的模型时，可把上述函数映射为 `search_attraction`、`search_food`、`plan_trip`、`adjust_trip`、`explain_attraction` 和 `generate_trip_card`，无需复制页面业务。

## 结构化行程

行程对象包含 `summary`、`constraints`、`days[].items[]`、`foodRecommendations`、`tips`、`locale`、`knowledgeVersion` 和 `generatedBy`。页面不渲染模型自由文本，而是渲染时间线卡片。

## 知识与防幻觉

- 优先从本地景区、美食和 IP 数据取事实。
- 不生成确定票价、开放时间、天气、班次、预约或营业时间。
- 所有方案显示官方信息核验提示。
- 图片识别响应中的 ID 必须存在于本地知识库，否则按识别失败处理。

## 三语

统一使用 `locale: zh-CN | en-US | ar`，路线逻辑只有一套。目的地名称、摘要、理由、时长、核心提示和讲解按语言输出；阿拉伯语页面启用 RTL。现有商品内容仍以中英双语为主。

## 安全与隐私

- 客户端不包含 API Key。
- 图片识别服务地址与模型密钥分离；密钥只在服务端。
- 图片选择仅在用户主动操作后发生，不申请定位权限。
- 埋点不记录问题正文、图片路径、聊天内容和补充建议。
- 正式后端必须使用 HTTPS、域名白名单、鉴权、限流、超时与最短留存策略。

## CloudBase 混合 AI

- `wx.cloud.init` 使用统一环境 `cloudbase-d6g1u2dzk45c62fc1`。
- `wx.cloud.extend.AI.createModel('cloudbase')` 只负责意图/调整 JSON；官方模型 ID 从 `config/cloud.js` 读取。
- Cloud AI 任何异常都回到本地解析器和 trip-agent，页面显示本地稳定兜底状态。
- Vision Feature Gate 当前为 `false`，因此图片不会上传，页面明确标记为内测。

## 当前边界

- 旅行主链目前由可离线运行的知识 Agent 完成；CloudBase AI 调用代码和受控 Schema 已接入，但控制台模型启用及真机联调尚未验证。
- 图片识别客户端、Cloud Storage 清理逻辑和云函数契约已完成，但 Provider 未配置、函数未部署，不能声明识别端到端 DONE。
- 旅行纪念支持本机结构化保存和微信分享，尚未导出合成图片到系统相册。
