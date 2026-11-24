# 微信正式发布就绪矩阵

| Requirement | Current status | Evidence | Blocker | Auto-fixable | User action required |
|---|---|---|---|---|---|
| AppID | 已配置，主体归属未验证 | `project.config.json` | 后台不可读 | 否 | 确认正式主体 AppID |
| 名称、简介、服务类目 | NO_ACCESS | 本地仅有产品文案，公众平台当前不可读 | 后台不可读 | 否 | 在公众平台核对 |
| 认证、备案 | NO_ACCESS | 无官方后台回执，公众平台当前不可读 | 后台不可读 | 否 | 在公众平台确认状态 |
| 隐私保护指引 | NO_ACCESS | `docs/privacy-data-map.md` 已完成代码映射，后台当前不可读 | 需后台配置与审核 | 否 | 按实际 API 填写后提交 |
| 网络域名 | 本地未发现 `wx.request` / `wx.uploadFile` / socket；CloudBase 为主 | `scripts/wechat-release-audit.js` | CloudBase 线上环境待核对 | 部分 | 核对开发设置中的实际域名与云环境 |
| WechatSI 插件 | NOT_CONFIGURED / NO_ACCESS | Provider 接口保留；`app.json` 未声明插件，后台当前不可读 | 插件是否存在、版本和资格未验证 | 否 | 先在插件管理核验当前状态 |
| AI 生成标识 | 待 UI 真机核验 | AI 灵境结果页实现 | 需真机证据 | 是 | 无 |
| 代码包 / 页面注册 | PASS | 本地审计 | 无 | 是 | 无 |
| 上传、审核、发布 | NOT_STARTED | 无微信后台回执 | 平台操作 | 否 | 上传后分别提交审核、发布 |

结论：当前为 `LOCAL_RC_READY`，未满足 `WECHAT_UPLOAD_READY` 或更高发布状态。任何正式上线声明均需微信公众平台回执和正式版生产环境复测。
