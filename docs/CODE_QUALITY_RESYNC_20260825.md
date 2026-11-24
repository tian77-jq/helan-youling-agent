# 代码质量扫描同步记录

本次按微信开发者工具规则重新整理运行包：

- `app.json` 已启用 `lazyCodeLoading: requiredComponents`。
- 首页实际使用 `components/quality-badge`，因此按需注入不再是空组件树，不会触发 `wx://not-found`。
- 所有页面 JSON、组件路径均已存在并通过页面注册审计。
- 运行包内未发现超过 200KB 的图片或音频；最大文件为 `assets/thumbs/scenic-collab/ningxia_museum.jpg`，109147 字节。
- 无依赖 JS：0；主包仅被分包依赖 JS：0。
- 主包统计：约 1.57MB（低于 2MiB 强制上限）。
- 全项目媒体复查：没有任何图片、音频文件大于 204800 字节；截图中 `intangible324KB`、`scenic-collab318KB` 是目录汇总，不是单个资源超限，微信规则检查的是单文件。
- 依赖分析中列出的 12 个无依赖文件已从运行包排除：`data/`、`business/`、`release-demo/` 以及 `project.private.config.json`；这些是开发资料/工具配置，当前页面没有运行时引用。
- 文创展厅中 5 个最低分辨率的概念缩略图（`cc-01` 至 `cc-05`，约 1.5–1.9KB）及对应条目已移除，保留其余联名展品，避免展示模糊占位图。
- `project.config.json.setting.ignoreDevUnusedFiles=false` 已显式配置，避免开发工具误过滤依赖文件。
- 构建标识：`20260825-quality-media-clean-28`。

## 本地复核

```text
node scripts/audit-code-quality.js       PASS
node scripts/page-registry-audit.js      PASS
node scripts/project-health-check.js     PASS
```

如果开发者工具仍显示旧的 12 个无依赖 JS 或图片超限，说明展示的是旧扫描缓存。请在工具中依次执行：清除文件缓存、清除编译缓存、重新编译，再点击“代码质量 → 重新扫描”；确认日志出现新的构建标识后再看结果。
