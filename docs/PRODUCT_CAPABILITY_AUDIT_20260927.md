# 产品能力与技术答辩材料核对（2026-09-27）

对照材料：`competition/mock-defense/FINAL_DEFENSE_BOOK.md`、`competition-defense/JUDGE_DEEP_QA.md`。本报告区分仓库代码、可重复本地证明与线上/真实运营证据；文案或设计稿不作为功能证明。

## 已有代码且可本地验证

| 答辩能力 | 当前实现/证据 | 答辩口径 |
| --- | --- | --- |
| 宁夏知识问答与证据约束 | `utils/conversation-gateway.js`、`utils/ai-orchestrator.js`、知识目录和 evidence gate；`scripts/knowledge-catalog-ai-regression.js` | 可展示本地检索、Knowledge ID 与拒绝无依据实时信息；不要承诺所有模型回答均已专家认证。 |
| 行程生成和可行性检查 | `utils/trip-agent.js`、Trip/plan feasibility 模块；既有 trip 回归脚本 | 本地规划逻辑与已列入项目的案例可复测；景区实时开放、天气、班次仍需外部数据。 |
| 角色选择与任务路由 | `services/character-router.js`、orchestrator/agent 路由、`scripts/character-router-test.js` | 目前能证明应用内路由和角色适配；“多个独立自主 LLM 子 Agent”不是由角色名/模块名自动证明的，答辩宜称统一编排下的专业任务路由。 |
| 本地降级 | orchestrator/local fallback 代码及 conversation/trip regression | 离线或 provider 失败时可演示已覆盖的 fallback；不要把 fallback 描述成实时云服务可用。 |
| 本地记忆、收藏、作品入口 | Star Atlas、memory 服务和本地存储；`scripts/memory-closure-gate.js` | 可讲设备本地保存/展示；不要称为跨设备云端数字资产、交易或用户训练数据。 |
| 文创展陈 | Shop 页面和概念产品素材 | 页面注明概念设计、非售卖；当前不证明库存、下单、支付或实际销售。 |
| 英语/阿语语义归一 | 新增 `utils/multilingual-semantic.js` 与 `scripts/multilingual-runtime-test.js` | 目前可本地验证样例别名转 canonical 语义和 landmark ID；广泛自然语言覆盖仍需扩充测试集。 |
| 统一三语 Runtime | `utils/i18n-runtime.js`、三份 locale registry、`scripts/i18n-runtime-test.js` | 存储、订阅、fallback、tabBar 更新契约可在 Node mock 中验证；微信模拟器的真实页面截图尚无证据。 |

## 有代码，但真实线上/设备证明不足

| 能力 | 查到的状态 | 尚缺证据 |
| --- | --- | --- |
| 混元图片生成 | `services/image-service.js` → `vision-agent/image-provider.js` → `providers/hunyuan-image-provider.js` → `providers/hunyuan-provider.js` → CloudBase `generateImage`。本轮 `scripts/hunyuan-image-runtime-test.js` 以 mock CloudBase 响应通过，验证成功 URL/fileID 传递。 | mock 不调用腾讯云。`cloudbaserc.json` 仓库配置为 60 秒；历史 `docs/HUNYUAN_PRODUCTION_AUDIT.md` 与 `docs/HUNYUAN_FALLBACK_ROOT_CAUSE_FINAL.md` 记录此前线上 3 秒超时/真机 `-504003`，且缺少真实模型输出。需要核实云端当前生效配置、模型权限/额度、真实 `imageUrl` 和真机保存展示后才能称已恢复。 |
| 云端大模型英语/阿语回答 | `utils/cloud-ai.js` 有 provider-neutral 的 response-locale policy；conversation gateway 将当前 locale 作为 responseLocale 送入统一编排。 | 本地 prompt wiring 不等于 Hunyuan/DeepSeek 线上实际输出验证。本轮未执行真实云模型请求。 |
| 分享、作品传播 | 代码中有页面分享回调/分享入口的部分实现（须按对应页面分别核验） | 不能据此声称分享转化率、传播网络效应或真实用户行为。 |

## 当前不具备或不能由本仓库证明

- CommerceAgent 所代表的实际交易闭环：当前文创内容为概念展示；没有可验证的支付、订单、退款和售后闭环。将 Commerce 描述为商业模式/后续试点方向，不说成已上线收入能力。
- 景区合作、IP 授权、供应链、真实买家、用户增长、留存、收入和转化指标：需要合同、授权书、平台后台或去标识化实测记录；仓库文案不能替代。
- 文化知识的全面专家审校与阿拉伯语母语审校：本轮仍需人工复核，不能声称已完成。
- 真机多语言输入法、Arabic glyph、RTL 排版和混元图像生成：当前无本轮设备截图/运行日志，标记为待真机验收。

## 本轮已恢复/优化

- 新增单一 `currentLocale` runtime 和 `APP_LOCALE_V1` 持久化；迁移旧 `hly_locale`，默认中文；语言切换发出订阅通知并调用原生 tabBar 更新。
- 接入 zh-CN / en-US / ar 词条、缺词 fallback、格式化、RTL 标记；首页、发现、Trip、我的、设置、文创入口已开始消费 registry。仍有页面内存量硬编码，故本轮整体多语言状态为 PARTIAL。
- Arabic / English 查询先映射 canonical 语义，再进入同一知识、landmark identity、Trip 和 orchestrator；不复制知识库或页面。
- 混元图片调用链增加本地 mock contract 回归，创作保存优先使用 `fileID`；这修复了代码侧结果接收/存储契约，但没有更改或部署云端函数。

## 答辩建议

可演示：统一行程/问答流程、本地知识 ID 与 evidence 约束、角色路由、设备本地记忆、三语 Runtime 的已接入部分、Hunyuan 函数请求的代码结构。

必须说“仍在验证”：微信运行时的三语切换与 Arabic RTL、真实混元图片生成、阿语自然语言质量、真机时间轴、真实用户/景区/商业闭环。不要用本地 mock 的通过结果替代线上或真机证明。

## 本轮最终回归记录

- `scripts/verify-release.js --code-only`：36 项中 33 项通过；`verify-project` 因主包 1,604,760 bytes 超过 1.50 MiB 失败，`audit-code-quality` 仍发现 2 个被工作区 ACL 锁定的 TTS JS；生产 gate 另有 6 项设备/平台/负载证据失败。
- 本轮新增三语运行时测试、英语/阿语语义测试、混元 mock 调用契约测试均通过；24 页 registry 通过。
- I18n gate：126 个核心/Trip/Discover registry keys，缺失 0；Trip WXML translation binding 未绑定字段 0；核心 6 页 WXML 仍检测到 30 个静态中文/英文文本节点。
- 未获取微信开发者工具模拟器截图，也未运行真实云端混元模型；模拟器与设备状态继续标记为待验证。
- Dead JS 清理中：3 个仅供冻结/审计测试的 JS 移到 `scripts/fixtures/` 并保留原测试覆盖；1 个完全无引用配置删除。两个 `providers/` TTS 文件因 ACL 拒绝移动/删除，仍留原位，因此代码审计计数从 5 降到 2。
