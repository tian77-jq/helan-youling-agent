# generateImage Function Report

- 调用方式：CloudBase Node SDK `app.ai().createImageModel('hunyuan-image').generateImage()`
- 模型：`HY-Image-3.0-Plus-4090-Tob-v1.0`
- 模式：同步返回图片 URL；本项目不伪造 JobId 轮询
- 部署：Active，Nodejs16.13，云端安装依赖成功
- 当前超时：3 秒，生产生图前必须提高
- 返回成功字段：`success`、`provider`、`imageUrl`、`taskId`、`persisted`
- 返回失败字段：`success:false`、`provider`、`code`、`message`、`detail`
- 真实返回结果：尚未通过小程序 invoke 获得，不能填入假 URL
