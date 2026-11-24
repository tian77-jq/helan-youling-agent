# 腾讯混元诊断报告

## 当前状态：NOT_READY

### 已存在

- 云函数入口：`cloudfunctions/generateImage/index.js`
- SDK：`@cloudbase/node-sdk ^3.18.3`
- 模型：`hunyuan-image / HY-Image-3.0-Plus-4090-Tob-v1.0`
- Provider、image-service、Prompt Builder 和 AI 灵境图片展示/保存代码

### 失败位置与原因

1. `config/cloud.js:imageMode` 仍为 `LOCAL_MODE`，所以不会调用 `wx.cloud.callFunction`。
2. 本地环境没有可确认的混元密钥/额度状态；密钥不能写入前端或仓库。
3. 无法从本地证明 `generateImage` 已在 CloudBase 上传并安装依赖。
4. 没有真实云函数返回的 `success/imageUrl/taskId`，因此不能标记 READY。

### 修复方案

在微信开发者工具中对 `cloudfunctions/generateImage` 执行“上传并部署：云端安装依赖”，在 CloudBase 控制台开通混元图片模型与额度，确认云函数超时，再用新二维码测试成功与失败两条路径。验证通过后才把 `imageMode` 切到 `HUNYUAN_MODE`。

### 任务模式说明

当前 CloudBase Node SDK `generateImage()`直接返回图片 URL；本项目未伪造 JobId 轮询。若采用腾讯云 API 3.0 JobId 接口，应另建提交/查询云函数，不混用返回协议。
