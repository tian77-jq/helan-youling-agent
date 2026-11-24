# TOURIST_REAL_ACCEPTANCE_REPORT

## 验收范围

`scripts/tourist-real-eval.js` 对 20 条真实游客表达执行：

`input → Intent → Context → Behavior → Response Formatter → Mechanical Response Detector`

覆盖景点文化、美食、老人同行、亲子、预算、摄影、半日游、模糊问题和首次到访问题。

## 机械话术检测

`utils/mechanical-response-detector.js` 禁止以下表达：

- `请选择`
- `你更想了解`
- `我可以帮你介绍`
- `我可以帮你规划`

当前澄清语改为：

```text
先确定一下你的方向：
1 景点探索
2 美食体验
3 几天旅游规划？
```

## 角色验收

- 文化问题 → 沙狐（`sand-fox`）
- 美食问题 → 岩羊（`rock-goat`）
- 路线问题 → 双峰驼（`camel`）

## 结果

执行 `node scripts/tourist-real-eval.js` 可得到 20 条逐条记录，包含 `input`、`intent`、`context`、`behavior`、`response` 和机械话术命中项。

当前结果为静态路由/格式器验收；脚本明确标记 `runtimeModelExecuted=false`，没有伪造 Cloud AI 的真实回答。真实模型回答仍需在微信开发者工具或真机运行后复核。

## 核心检查

明确问题进入 `DIRECT ANSWER`、`STORY_EXPLANATION` 或 `TRIP_PLAN`；模糊问题进入 `CLARIFICATION`。未新增 Agent、页面或核心架构，未修改首页、TabBar、Vision、商城和 Trip Agent 核心。
