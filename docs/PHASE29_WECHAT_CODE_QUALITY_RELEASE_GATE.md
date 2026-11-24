# Phase 29 · 微信代码质量与 Release Gate 主报告

日期：2026-08-26

## 结论

`WECHAT_CODE_QUALITY_SCAN = PARTIAL`：用户提供的 2026-08-26 10:42 微信开发者工具截图已确认组件按需注入、主包大小、主包 JS/组件和代码压缩通过；官方当前仅剩“图片和音频资源”未通过。代码侧全量扫描为 `>200K = 0`，因此该项仍需清缓存、重新编译并展开详情定位工具实际扫描文件。

## 三个红项与整改

| 红项 | 截图根因/当前判断 | 对应整改 |
|---|---|---|
| 组件按需注入 | 截图已通过 | `app.json` 保留 `lazyCodeLoading: "requiredComponents"`；首页存在真实 `quality-badge` 组件依赖 |
| 图片和音频 ≤200K | 截图仍未通过；正确排除 `.git` 后，仓库全量扫描覆盖 png/jpg/jpeg/webp/gif/svg/mp3/wav/aac/m4a/ogg，当前 `>200K = 0`。此前命令把 `.git\objects` 当作候选文件，属于误查 | `project.config.json` 明确忽略 `.git` 与未引用的 `assets/thumbs/intangible/`；未压缩或替换三只原创 IP 主视觉 |
| 无依赖代码文件 | 旧回归规则仍寻找已迁移的旧首页 handler，造成误报 | 将 `core-regression-check.js` 对齐现行 `openEntry → /pages/ai-trip/index` 与 `mode=guide` 真实链路；代码质量审计 `unusedJs = 0`、`mainPackageUnusedJs = 0` |

## 包体与资源

- 主包静态估算：`1,602,721 → 1,271,650 bytes`，约 `1.213 MiB`，内部门槛通过。
- `feature` 分包静态估算：`87,580 → 87,580 bytes`，未复制新增大图。
- 全量媒体 `>200K`：0；重复媒体哈希组：0。
- 三只原创 IP 发布图保留：`pillow_yangyang.jpg`、`pillow_fox.jpg`、`pillow_camel.jpg`。
- 未删除原创源资产；仅通过 `project.config.json` 将未引用的 `assets/thumbs/intangible/` 排除发布包。

## 配置与回归

- `app.json`：9 个主包页面、1 个 `feature` 分包、22 个注册路由、4 个 TabBar 页面。
- `lazyCodeLoading`：`requiredComponents`。
- `project.config.json`：开发文档、脚本、云函数、证据与未引用资源均不进入小程序上传包；压缩配置保持开启。
- `verify-project`：PASS。
- `audit-code-quality`：PASS（无未依赖 JS、无缺失引用、无超 200K 媒体）。
- `page-registry-audit`：22 页 PASS，0 errors。
- `interaction-audit`：101 个事件/路由引用 PASS。
- `core-regression-check`：STATIC_PASS。
- `character-router-test`：10/10 PASS。
- `avatar-answer-consistency-test`：15/15 PASS。
- `product-test`：PASS。
- `runtime-regression-gate`：首页自动化渲染 PASS；交互与真机项目仍为 `PENDING_HUMAN`。

## 真实平台证据

- 微信代码质量重新扫描：截图已取得；组件项已通过，媒体项仍未通过，故 `COMPONENT_ON_DEMAND_PASS=true`、`WECHAT_CODE_QUALITY_SCAN=PARTIAL`。
- DevTools 编译、Preview 二维码、真机黄金链路：本轮没有取得真实证据，均不判 PASS。
- 敏感信息：本地静态扫描通过；仍需以开发者工具敏感信息面板复核。
- AI 灵境：混元真实 requestId/taskId/imageUrl/渲染/保存证据未取得，`AI_CREATE_PASS=false`。
- TTS：当前仍为字幕模式，不宣称真实语音。

## Phase 29 Release Gate

执行：`node scripts/gold-release-gate.js`

```text
MEDIA_UNDER_200K_PASS=false
LOCAL_MEDIA_AUDIT_PASS=true
UNUSED_CODE_PASS=true
UNUSED_COMPONENT_PASS=true
PLUGIN_SIZE_PASS=true
MAIN_PACKAGE_INTERNAL_GATE=true
PAGE_REGISTER_PASS=true
SUBPACKAGE_PASS=true
HOME_PASS=true
CHARACTER_ROUTER_PASS=true
TRIP_PASS=true
AI_CREATE_PASS=false
DEVTOOLS_COMPILE_PASS=false
PREVIEW_PASS=false
DEVICE_PASS=false
```

## 当前状态码

`READY_FOR_DEVTOOLS_RESCAN = YES`（媒体项仍需清缓存后复扫定位）

`READY_FOR_DEVICE_ACCEPTANCE = NO`

`GOLD_RELEASE_CANDIDATE_V4 = NO`

只有微信开发者工具红项复扫通过、重新编译无严重控制台错误、取得 Preview 与真机证据后，才可将 V4 改为 YES。
