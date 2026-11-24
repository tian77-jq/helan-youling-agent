# 贺兰灵物 Phase 10 Status

更新时间：2026-08-16

## 当前结论

`CURRENT_STATUS = CONDITIONALLY_APPROVED`

`COMPETITION_BUILD_READY = NOT_YET`

人工更新：`VISION_FUNCTION_DEPLOYED = YES`（CloudBase 环境 `cloudbase-d6g1u2dzk45c62fc1`，函数 `visionRecognize`）。

最新人工调用：`VISION_FUNCTION_REACHABLE = PASS`、`CLOUDBASE_ENV_CALLFUNCTION = PASS`。返回值仅含 `tcbContext/userInfo`，与本地业务函数预期的 `{success, reason}` 不一致，因此判定云端当前执行版本不是本地业务实现（很可能仍是默认模板或旧部署版本），不能视为 Vision 识别成功。

## 已完成的本地验证

| 项目 | 状态 | 证据 |
|---|---|---|
| CloudBase 配置静态核对 | PARTIAL | `config/cloud.js` 与 `app.js` 使用 `cloudbase-d6g1u2dzk45c62fc1`；`project.config.json` AppID 为 `wx51184e5233d28f21`；基础库 `3.17.1` |
| Hybrid/Fallback 本地逻辑 | PASS | `scripts/verify-hybrid.js`、`scripts/competition-eval.js` |
| Vision Gate | DISABLED_SAFE | `featureVisionEnabled=false` |
| Vision Function 部署 | YES | 用户已确认普通云函数已部署 |
| JavaScript 语法 | PASS | 50 个 JS 文件，0 个失败 |
| 主包 | PASS | 1,173,906 bytes / 1.12 MiB |
| 客户端密钥扫描 | PASS | 未发现 AppSecret、API Key、Bearer、`sk-`、Private Key 等匹配 |

## 必须人工完成的验证

### CloudBase 环境与 AI

在 CloudBase 控制台选择环境 `cloudbase-d6g1u2dzk45c62fc1`，进入 `AI+ → 快速接入` 开通能力，并在 `AI → 文本生成模型/模型管理` 确认 `hy3` 已启用。随后在微信开发者工具运行真实请求。完成后回复：`CLOUDBASE_ENV_VERIFIED` 和 `CLOUD_AI_LIVE_CALL_PASS`，并附请求结果或错误。

### 微信开发者工具

打开微信开发者工具 → 导入项目 → 选择 `D:\贺兰有灵小程序` → AppID 使用项目配置的 `wx51184e5233d28f21` → 工具/详情中确认基础库 `3.17.1` 或更高 → 编译。若需要部署云函数，在项目文件树右键 `cloudfunctions/visionRecognize` → 选择“上传并部署：云端安装依赖（不上传 node_modules）”。完成后回复编译日志和云函数部署结果。

## Vision

`VISION_DISABLED_SAFE`。当前云函数代码只在 Provider 未配置时安全失败，未接入未经确认的图片模型；本阶段不以假识别结果冒充 PASS。客户端契约为 `{cloudFileID, locale}`，函数部署后仍返回受控 `VISION_PROVIDER_NOT_CONFIGURED`，与当前安全门一致。

## Vision 云函数核对

- 本地 `cloudfunctions/visionRecognize/index.js` 不是默认模板；它应返回 `VISION_PROVIDER_NOT_CONFIGURED`，当前没有任何真实多模态 Provider 调用逻辑。
- `package.json` 仅依赖 `wx-server-sdk@3.0.1`，依赖格式正确，但不包含 Vision SDK/Provider。
- 客户端传入参数为 `{cloudFileID, locale}`；本地函数尚未做参数校验，也尚未返回 `knowledgeId`。
- 云端返回仅有 `tcbContext/userInfo`，说明本地业务代码尚未成为云端实际执行版本，需重新上传并部署云端依赖后再测。

## 真机清单

见 [REAL_DEVICE_TEST_CHECKLIST.md](REAL_DEVICE_TEST_CHECKLIST.md)。
