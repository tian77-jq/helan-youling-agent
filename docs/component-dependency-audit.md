# 组件依赖审计 · Phase 31E

审计时间：2026-08-29。

| 项目 | 结果 |
| --- | --- |
| 有实际定义文件的自定义组件 | 0 |
| `usingComponents` 非空页面 | 0 |
| `componentGenerics` | 0 |
| 插件组件 | 0 |
| 循环组件依赖 | 0 |
| `wx://not-found` 引用 | 0 |
| `components/quality-badge` 代码引用 | 0 |

`feature/digital-avatar/index.json` 保留了空的 `usingComponents: {}`，不引用任何组件；项目内 `components/quality-badge` 仅剩空目录，没有组件文件和任何引用。

## 受控实验

- 实验：临时设置 `lazyCodeLoading: "requiredComponents"`，用微信开发者工具 CLI 执行 Preview 编译。
- 结果：`COMPILE_PREVIEW_PASS`，包体 1,264,240 B。
- 限制：CLI 预览编译**不能**证明 Fresh Launch、所有页面路由和真机渲染安全。
- 最终配置：`lazyCodeLoading` 不设置（disabled）。

此前真实运行环境曾发生 `__wxAppCode__`、组件注入/页面路由异常。虽然当前组件图为空且编译通过，但没有取得 Fresh Launch 与全页面真机 smoke 证据；因此不以一项代码质量评分交换 RC 稳定性。

如要重新启用，必须先在单独工作副本中完成：首页、AI 问答、AI 灵游、AI 灵境、IP 故事、商城的 Fresh Launch 与真机验证，且无白屏、`wx://not-found`、组件找不到或严重路由错误。
