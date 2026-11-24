# 竞赛技术证据包

| Claim | Current evidence | Status | Missing evidence |
|---|---|---|---|
| Task Router | 163+ 路由黄金 case，Trip/QA 关键分流通过 | LOCAL PASS | 云端真实对话评测 |
| Duration Resolver | 无时长进入 `TRIP_PLANNING_NEEDS_DURATION`，支持一日游/周末/一周 | LOCAL PASS | 真机 Chips |
| Character Router | `task-contract.js` 统一 `resolvedCharacter` | LOCAL PASS | 全链路线上日志 |
| Grounding | 夜游命中 `lanshan-park`，推荐实体受知识目录限制 | LOCAL PASS | 真实推荐 30 条审计 |
| Evidence Gate | 实时信息统一提示官方公告 | LOCAL PASS | 更多实时字段测试 |
| Trip Planner | 本地计划、时间槽、跨城与老人/亲子约束 | LOCAL PASS | 20 条真实云端行程 |
| Hunyuan Text | 配置别名 `hy3`，调用点为 CloudBase `AI.createModel` | UNVERIFIED | `TEXT_MODEL_REAL_ID`、requestId |
| Hunyuan Image | 配置模型 `HY-Image-3.0-Plus-4090-Tob-v1.0` | CONFIGURED | 真机 10 次成功率 |
| Voice | 当前字幕模式，TTS 不阻塞发布 | LOCAL PASS | 管理员授权后的音频证据 |
| Context Isolation | 当前轮优先，历史只作背景 | LOCAL PASS | 真机连续对话 |

赛事材料只能使用本表中有证据的结论。2026 创新大赛通知强调参赛材料真实性、知识产权/物权清晰和项目实际贡献，不能用推测的用户量、订单、合作或模型能力替代证据。
