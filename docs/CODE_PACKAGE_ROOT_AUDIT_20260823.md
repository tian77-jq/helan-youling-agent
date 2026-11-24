# 贺兰有灵小程序代码包根因审计日志

审计日期：2026-08-23

## 结论

- 微信开发者工具真实预览构建：成功（退出码 0）。
- 实际上传包：1,587,564 字节；主包 1,508,118 字节；`/feature/` 分包 79,446 字节。
- 整个工作区超过 200 KiB 的文件：0。
- 上传范围内超过 200 KiB 的图片、音频：0。
- 最大媒体文件：`assets/thumbs/scenic-collab/ningxia_museum.jpg`，118,722 字节。
- 缺失 `require` 依赖：0。
- 上传范围内未使用 JS：0。
- 仅被分包使用却滞留主包的 JS：0。
- 全部 JS 语法检查：通过。
- 路由：19/19 注册及引用通过。
- WXML 标签、静态资源引用、交互处理器：通过。
- `packOptions.ignore` 失效规则：0。
- 已删除旧路径运行时引用：0。

## 根因与落实修改

1. 删除了已经由 `feature` 分包替代、但仍残留在 `pages` 下的 6 组旧页面副本：IP 详情、商品详情、推荐结果、拍照识别、旅行纪念、问卷。
2. 删除根目录遗留 `detail.js` 和无运行依赖的 `utils/ai-service.js`。
3. `utils/mechanical-response-detector.js` 只被审计脚本使用，已移入被排除的 `scripts` 目录，并修正测试引用。
4. `project.config.json` 的 32 条混杂忽略规则已收敛为 11 条；删除所有指向不存在文件/旧页面的规则，补充排除 `evaluation` 和根目录审计报告。
5. 清除了微信开发者工具的文件缓存与编译缓存，并在清理后再次真实预览构建；两次构建包体积一致。
6. 修正行程稳定性门禁：景点/美食必须绑定知识 ID，交通/休息段不伪造知识 ID；复测 10/10 通过。

## 复核命令与结果

```text
node scripts/audit-code-quality.js       PASS
node scripts/verify-project.js           PASS
node scripts/trip-stability.js           PASS (10/10)
node scripts/core-regression-check.js    STATIC_PASS
node scripts/gold-release-gate.js        STATIC_PASS
node scripts/interaction-audit.js        PASS (98 events)
node scripts/ai-full-regression-test.js  PASS
node scripts/scenic-vision-service-test.js PASS
微信开发者工具 cli preview               PASS (exit 0)
微信开发者工具 cache file/compile         PASS
清缓存后 cli preview                      PASS (exit 0)
```

## 边界说明

- 本日志的包体积取自微信开发者工具 `preview --info-output`，不是本地估算值。
- 腾讯混元真实生图仍受线上云函数 3 秒超时限制；代码包质量通过不等于云函数超时已经修改。该项需完成腾讯云 CLI 授权后把超时设置为 900 秒，再做真实生图验收。
