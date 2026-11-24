# Gold Release Candidate feature readiness

| 功能 | 真实 Provider / 本地证据 | 真机状态 | 失败降级 | Demo 状态 |
|---|---|---|---|---|
| AI 萌宠问答 | 宁夏知识库、编排器、40/40 路由与 30/30相关性回归 | 未在本轮复测 | 本地可信知识回答 | GREEN（待真机复测） |
| AI 灵游 | 本地确定性规划、50轮上下文与5项时段规则 | 未在本轮复测 | 本地安全行程 | GREEN（待真机复测） |
| AI 灵境 | 用户提供的混元真实成功日志 | 未在本轮调用 | 保留选项并显示失败 | GREEN（既有真实证据） |
| 数字人格语音 | WechatSI Provider 接口保留，但插件未进入 `app.json`，后台状态无访问证据；腾讯 TTS 熔断 | 未通过 | 字幕讲解 | YELLOW：NO_ACCESS；保持字幕发布 |
| 微信正式发布 | 本地发布审计、包体和页面注册通过 | 未上传 | 字幕模式可安全运行 | RED：待主体后台、审核和正式发布 |

## Phase 31B 本地硬化结果

| 门禁 | 结果 | 说明 |
|---|---|---|
| Answer Character / Voice Character | PASS | `resolvedCharacter` 由角色路由一次确定并向下传播 |
| Persona Consistency | PASS | 30/30 cases |
| Voice Entry | PASS | 10 次快速触发的真实 TTS 请求为 0；发布仍为字幕降级 |
| Conversation Stress | PASS | 50/50 turns |
| Lazy Code Loading | SAFE / disabled | `requiredComponents` 曾触发组件递归与 `wxAppCode` 白屏，未强行恢复 |
| Preview Upload Transport | PASS | 已修复失效的 `127.0.0.1:7896` 代理链路 |
| Hunyuan Device Render | PENDING_HUMAN | 仅有 Provider 成功证据，尚未取得本轮真机渲染证据 |

说明：本表不将本地自动测试、云函数部署或接口代码视为真机成功。只有现场真机实际完成对应流程，才更新为真机 PASS。
