# HUNYUAN Fallback Root Cause

## ROOT_CAUSE

- 直接触发点：`providers/hunyuan-provider.js` 中 `Promise.race([wx.cloud.callFunction(...), timeout])` 的 rejection 被 catch，统一返回 `success:false` 和体验模式提示。
- 已确认的线上阻塞：CloudBase `generateImage` 当前超时为 3 秒；混元生图超过该时限时会触发 `HUNYUAN_CLIENT_TIMEOUT`/云函数超时。
- 代码位置：`config/cloud.js:imageMode`、`providers/hunyuan-provider.js` 的 `HUNYUAN_MODE` 分支、`cloudfunctions/generateImage/index.js` 的 `ai.createImageModel('hunyuan-image')`。
- 日志证据：CLI 查询显示 `generateImage Active / timeout 3 / Nodejs16.13`；本次没有真实 invoke 返回日志，因此不把权限/额度写成已确认错误。

## 修复

1. 已切换 `HUNYUAN_MODE`。
2. 已重新部署 `generateImage` 并云端安装依赖。
3. 已统一返回 `provider:'hunyuan'`、`imageUrl`、`taskId`、`detail`。
4. 已加入客户端 65 秒超时和 requestId/耗时记录。
5. 必须在 CloudBase 控制台提高函数超时并确认混元额度/权限，随后用真机完成一次真实调用。
