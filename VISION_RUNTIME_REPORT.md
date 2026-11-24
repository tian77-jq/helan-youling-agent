# VISION_RUNTIME_REPORT

## 1. 真实调用状态

`BLOCKED_NOT_VERIFIED`

当前不能声明真实模型调用通过：

- `config/cloud.js` 中 `featureVisionEnabled=false`。
- `cloudfunctions/visionRecognize/index.js` 未配置真实 `VISION_PROVIDER_ENDPOINT`，当前只返回 `VISION_PROVIDER_NOT_CONFIGURED`。
- 本机未检测到微信开发者工具，无法执行 `wx.chooseMedia`、Cloud Storage、云函数和真机链路。
- 当前工作区没有两张指定的真实测试输入图片和真实运行日志。

## 2. 模型信息

未发生真实 Vision Model 请求。`cloudAiModel=hy3` 是文本模型配置，不能冒充视觉模型；Vision Provider 未配置。

## 3. 测试图片结果

| 测试 | 期望 | 实际 |
|---|---|---|
| 西夏陵 | MATCHED / `nx_xixialing` / 沙狐 | NOT_RUN |
| 电脑、水杯或桌面 | UNKNOWN | NOT_RUN |

没有使用 Mock、固定返回或模拟图片填充结果。

## 4. 延迟

无真实请求，因此无 `requestTime`、`responseTime` 或延迟数据。真实 Cloud Vision 路径已增加 `VISION_RUNTIME_LOG` 字段：`imageId`、`model`、`requestTime`、`responseTime`、`candidate`、`confidence`、`knowledgeId`、`finalStatus`。

## 5. 失败处理

上传失败、网络失败、模型未配置和未知实体均走安全失败，不进入景点讲解，不影响 AI 灵游、问萌宠、Trip Agent 或 Cultural Game；页面显示无法确认/稍后重试提示。

## 6. GOLD_CORE

未修改首页、AI灵游、问萌宠、TabBar、Trip Agent、Cultural Game。实际注册页面 `feature/photo/index` 已接入独立 `vision-agent`，并支持 `nx_xixialing` 到本地知识实体的证据映射。

## 验收前置条件

配置并部署真实 Vision Provider 和 `visionRecognize` 云函数；在微信开发者工具或真机完成两张真实图片测试；导出两条完整 `VISION_RUNTIME_LOG` 后，才能将本报告状态改为 PASS。
