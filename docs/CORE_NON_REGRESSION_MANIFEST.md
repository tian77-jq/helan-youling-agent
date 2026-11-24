# 贺兰灵物核心不可回归清单

每次修改首页、导航、AI、发现、商城、我的或文化闯关后，先运行：

```powershell
node scripts/core-regression-check.js
node scripts/verify-project.js
```

静态检查通过只代表 `STATIC_PASS`，不能替代微信开发者工具或真机点击验证。

| ID | 核心链路 | 预期 |
| --- | --- | --- |
| CORE-01 | 首页 → 让灵灵规划 → AI灵游自动规划 | prompt 传递，Trip 自动生成 |
| CORE-02 | 首页 → 问萌宠 | 进入 guide 模式并返回知识库回答 |
| CORE-03 | 发现 → 景区 | 进入景区详情 |
| CORE-04 | 发现 → 美食 | 进入美食详情 |
| CORE-05 | 商城 → 我想要 → 我的心愿 | 可加入、取消并持久化 |
| CORE-06 | 我的 → 我的行程 | 读取 currentTrip |
| CORE-07 | 发现 → 文化闯关 | 四关、12 个任务、徽章保存 |
| CORE-08 | 拍照识宁夏 → Vision | 未通过真实 Smoke Test 前保持安全关闭 |

当前锁定项：`HOME_PLAN_CORE_LOCK = ACTIVE`。
