# 微信正式发布 Runbook

当前阶段：`READY_FOR_FRESH_DEVICE_RC_TEST`。候选构建：`20260829-gold-production-rc1`。

1. 运行 `node scripts/wechat-release-audit.js`、`node scripts/wechat-production-release-gate.js` 与 `node scripts/gold-rc-gate.js`。
2. 用新 Preview 二维码按 `docs/device-test-card.md` 的 10 步完成 Fresh Launch、核心路径和页面 smoke；记录真实截图和时间。
3. 在微信公众平台核对主体、认证、备案、名称、简介、服务类目及隐私保护指引；这些信息只有主体管理员可确认。
4. 当前发布候选固定为字幕模式；WechatSI 未授权插件声明不进入 `app.json`。
5. 在公众平台确认版本号不冲突后上传候选版本 `2.0.0`；先在体验版完成同一套真机验收。
6. 仅在体验版验收通过后提交审核；记录审核版本、时间和审核编号。审核通过后由主体管理员发布正式版，再用正式二维码完成生产 smoke test。

不得将 Preview、开发版、体验版或“审核通过但未发布”写成正式上线。
