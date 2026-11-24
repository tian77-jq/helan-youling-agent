# HUNYUAN Runtime Status

## 当前结论：DEPLOYED / NOT_VERIFIED

### 已确认

- 小程序入口：`pages/ai-create/index.js`
- 服务层：`services/image-service.js`、`services/prompt-builder.js`
- Provider：`providers/hunyuan-image-provider.js` → `providers/hunyuan-provider.js`
- 云函数：`cloudfunctions/generateImage/index.js`
- SDK：`@cloudbase/node-sdk` 3.18.3
- 云函数模型：`hunyuan-image` / `HY-Image-3.0-Plus-4090-Tob-v1.0`
- 云函数成功返回：`imageUrl`、`taskId`、`provider`、`persisted`

### 未确认/失败原因

1. 已切换 `imageMode: HUNYUAN_MODE`，但尚未取得真实图片返回。
2. CloudBase CLI 已确认函数 Active，并以云端安装依赖重新部署。
3. 无法从 CLI 证明腾讯云混元额度、权限和环境配置已开通。
4. 当前函数超时为 3 秒，尚未完成真实图片 URL、错误码或成功截图验收。

### 认证方式

采用 CloudBase 云函数服务端认证；API 密钥不得进入小程序包。当前没有在仓库写入任何密钥。

### 异步说明

当前 CloudBase Node SDK 的 `generateImage()` 直接返回图片 URL（URL 有效期有限），不是本项目自建的 JobId 轮询 API。因此代码采用云函数调用超时与失败降级；若改用腾讯云 API 3.0 Explorer 的 JobId 接口，需要另行实现提交/查询两步云函数，不能混用返回格式。
