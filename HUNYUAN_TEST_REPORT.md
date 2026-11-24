# 腾讯混元测试报告

| 测试 | 当前结果 | 说明 |
|---|---|---|
| 文字问答“介绍一下贺兰山岩画” | 本地知识库 PASS | 当前文字模式为 LOCAL_DEMO_MODE，未宣称混元在线 |
| AI 规划“三天宁夏旅行” | 本地 Agent PASS | 有 Evidence 和降级，不等于混元在线生成 |
| AI 生图“生成贺兰山岩羊旅行纪念卡” | BLOCKED | 当前 imageMode=LOCAL_MODE；需部署云函数、开通额度并真机验证 |

## 真实生图验收条件

云函数返回 `success:true`、非空 `imageUrl`、`provider` 为腾讯混元；小程序生成页显示图片并可保存 `digitalAssets`。在此之前不得把本地 Prompt 结果标记为真实混元作品。
