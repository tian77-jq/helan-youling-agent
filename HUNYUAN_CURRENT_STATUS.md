# 腾讯混元当前接入状态

## 结论

调用链代码已具备，但当前项目**尚未达到真实混元生图可验证状态**：`config/cloud.js` 的 `imageMode` 仍为 `LOCAL_MODE`，云函数是否已在 CloudBase 部署、模型额度和权限是否开通，无法由本地代码证明。

## 调用入口

`pages/ai-create/index.js` → `services/image-service.js` → `vision-agent/image-provider.js` → `providers/hunyuan-provider.js` → `wx.cloud.callFunction({name:'generateImage'})` → `cloudfunctions/generateImage/index.js`。

## 认证方式

密钥只能放在腾讯云函数运行环境或 CloudBase AI 配置中；前端不保存 API Key。当前本地环境未发现可用于混元的安全配置，因此未强行切换线上模式。

## 请求与返回

请求：`prompt`、`size`、`requestId`；云函数使用 `hunyuan-image` 和受限尺寸，成功返回 `imageUrl`、`taskId`、`provider`。

## 当前失败原因

1. `imageMode=LOCAL_MODE`，正常路径不会调用远程模型。
2. 必须确认 `generateImage` 已上传并安装依赖。
3. 必须在 CloudBase 开通混元模型、额度与权限。
4. 必须用新二维码进行真实设备回归。
