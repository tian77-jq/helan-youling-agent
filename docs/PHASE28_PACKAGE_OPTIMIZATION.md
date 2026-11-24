# Phase 28 Package Optimization

日期：2026-08-26

## 结果

| 指标 | Before | After | 处理 |
|---|---:|---:|---|
| 主包静态估算 | 1,602,721 bytes | 1,271,650 bytes | 约减少 331KB |
| 主包 MiB | 1.602 | 1.213 | 低于项目 1.50MiB 内部门槛 |
| feature 分包静态估算 | 87,580 bytes | 87,580 bytes | 未增加重复大图 |

## 处理内容

- 审计发现 `assets/thumbs/intangible/` 21 张图片共约 331KB，当前运行时代码无引用。
- 未删除文件；通过 `project.config.json` 发布忽略清单排除该目录。
- `scripts/verify-project.js` 同步按发布忽略口径计算主包。
- 三只原创 IP 素材未删除、未移动、未压缩替换。
- 未发现超过 200KB 的图片/音频。

## 风险

如果未来页面重新引用 `assets/thumbs/intangible/`，必须先从忽略清单移除并重新做包体审计。当前 `project.config.json` 与 `app.json` 的页面/分包结构未被重构。
