# Three Avatar Voice Acceptance

状态：`SUBTITLE_ONLY / REAL_DEVICE_TEST_PENDING`

| 测试 | 预期角色 | 代码路由 | 字幕 | TTS | 真机 |
|---|---|---|---|---|---|
| 贺兰山有哪些特色动物？ | `yanYang` | PASS | PASS | 未配置 | 待测 |
| 西夏陵为什么重要？ | `luoTuo` | PASS | PASS | 未配置 | 待测 |
| 银川晚上去哪玩？ | `shaHu` | PASS | PASS | 未配置 | 待测 |

三角色共用一个 Agent Core、Character Router、Digital Avatar Service 和 Voice Service，没有重复创建三个模型系统。
