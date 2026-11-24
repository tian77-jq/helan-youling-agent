# Reality Map — 2026-09-05（修改前）

审计基线：工作区已有大量未提交改动，本轮不重置、不清理。根目录无 package.json、无 AGENTS.md。历史 PASS 不作为当前运行证据。

|能力|现状|证据/缺口|
|---|---|---|
|Home 合并入口、QA 后置|RUNTIME_CONNECTED|index.wxml 已按 Trip→三 IP→QA 排列；未真机证明|
|AI Workspace|STATIC_UI_ONLY|三按钮共用 composer/result；qaState/tripState 没绑定页面；hasPlan 被 QA 清除|
|Trip|RUNTIME_CONNECTED|conversationGateway.handle→页面；沙坡头分支提前返回静态 slots，绕过 AI|
|Trip Visual|CODE_EXISTS|resolvePlan 调用存在，但 sceneAsset 不渲染；名称岩画被山抢先匹配|
|Night|RUNTIME_CONNECTED|5 条本地知识测试运行通过；无云/设备证据|
|Buyer Data|MOCK_ONLY|245→240 标准化测试通过；toKnowledgeContext 无运行调用者，intro 被固定占位替代|
|Host|MOCK_ONLY|contract 测试通过；宿主页导入 zhiyou-ningxia；backToHost 仅 navigateBack|
|Realtime|CODE_EXISTS|无已认证实时数据证据|
|生图|RUNTIME_CONNECTED|客户端调用云函数；本轮未验证云部署；缓存仅 requestId，无用户隔离|
|存储容错|CODE_EXISTS|runtime-state / conversation-state 同步存储异常未捕获，可中断页面加载|
|Scene 库|TOKEN_ONLY|productionScenes 是声明式 CSS 元数据，无专属像素/路径；不能称实景|
|资产权利|CODE_EXISTS|本地 manifest gate 通过；声明不等于原始授权证据|
|发布|CODE_EXISTS|生产 gate 运行退出 1；六项人工/生产证据 false；无统一 verify:release|
|设备视觉|CODE_EXISTS|runtime-regression-gate 硬编码 PASS_AUTOMATOR 与旧文件名，非本轮执行|
|语音|CODE_EXISTS|VOICE_V1_FROZEN 保持；不研究 TTS|

Top 10：①Buyer→RAG 断链 ②生图身份/缓存隔离 ③存储异常白屏 ④工作台并非三任务容器 ⑤Scene 错配与虚假实景标签 ⑥生产证明/发布开关缺失 ⑦Host 真实闭环缺失 ⑧分享泄露原始输入且自动请求 ⑨Scene 声明未落实 ⑩设备/弱网证据缺失。

本轮优先修复可在本地复现并回归的五组：存储容错、视觉匹配、工作台状态与呈现、生图用户隔离、执行式发布证据。Buyer 数据缺少可信来源/授权与租户服务，不能灌入 synthetic 数据假装 live RAG。生产审核/发布不执行。
