# Runtime Smoke Checklist

Build ID：`20260819-runtime-recovery-01`

在微信开发者工具重新编译后，用真机或模拟器执行：

1. 首页输入“第一次来宁夏，两天时间，喜欢历史和美食”，点击“让灵灵规划”，确认打开 AI 灵游并自动显示结果。
2. 首页点击“AI规划行程”和“问萌宠”，确认入口均可打开。
3. 景区联名轮播滑过 10 项，记录 `IMAGE_RUNTIME_PASS_COUNT`。
4. 逐张点击 10 项，确认进入对应景区详情，记录 `CLICK_RUNTIME_PASS_COUNT`。
5. 在详情点击“听萌宠讲”和“加入 AI 行程”。
6. 验证文化闯关、商城心愿、我的页面、旅行纪念。

失败即停止后续 Phase，并记录 Console 中的 `[TRIP_FLOW]`、`[SCENIC_IMAGE][ERROR]` 日志。
