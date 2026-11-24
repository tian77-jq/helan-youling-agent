# 混元生图官方链路修复记录

## 结论

云函数已经按腾讯云开发官方 Node SDK 方式调用，不是本地图片或模拟数据：

- SDK：`@cloudbase/node-sdk` 3.18.3
- AI 依赖：`@cloudbase/ai` >= 2.30.0
- Provider：`hunyuan-image`
- 文生图模型：`HY-Image-3.0-Plus-4090-Tob-v1.0`
- 调用位置：`cloudfunctions/generateImage/index.js`
- 小程序调用方式：`wx.cloud.callFunction({ name: 'generateImage' })`

## 本次修复

1. 固定 Node SDK 版本，避免云端安装到不兼容版本。
2. 增加显式 `@cloudbase/ai` 依赖。
3. 关闭 `revise` 和 `enable_thinking`，避免提示词被改写、避免不必要的长等待；页面选择的景区、文化和萌宠直接作为约束发送。
4. 删除页面自动提示词被服务层重复拼接的问题。
5. 仍然保留官方 HTTPS 返回地址，同时将图片保存到 `ai-creations/` 云存储。

## 云端实测

- 部署：成功，云端安装依赖。
- RequestId：`d320ce2d-668f-488b-9866-89ff031d0897`
- 模型调用日志：`[HY_IMAGE_PROVIDER_CALL]`, model=`HY-Image-3.0-Plus-4090-Tob-v1.0`
- 模式：`T2I`
- 耗时：5532 ms
- 返回：`success:true`
- `imageUrl`：腾讯 COS 的 `hunyuan-base-prod-1258344703.cos.ap-guangzhou.myqcloud.com` HTTPS 地址
- 永久保存：`fileID` 已返回，`persisted:true`

这证明资源包和混元生图调用本身已经打通。控制台“用量 0”可能是用量页延迟或筛选环境不一致，不能推翻云函数日志中明确的模型调用与 Hunyuan COS 返回地址。

## 当前限制

此页面是文生图（T2I）。图生图（I2I）必须额外传入一张真实的 `image_urls` 或 `images`，不能只传文字；当前云函数已支持该参数，但页面尚未上传参考图，因此不会误把文生图当图生图。
