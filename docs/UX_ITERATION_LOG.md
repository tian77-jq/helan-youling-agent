# UX Iteration Log

只记录有证据的问题；未访谈项不填结论。

| Date | User Problem | Evidence | Fix | Before | After | Status |
|---|---|---|---|---|---|---|
| 2026-08-19 | 首页规划入口可能无法打开 TabBar Trip 页面 | 静态检查发现 `navigateTo` 指向 TabBar 路由 | 改为 `pendingTripRequest + switchTab`，由 Trip `onShow` 自动启动 | 运行时可能失败 | 待真机验证 | IN_PROGRESS |
