# Release Privacy & AI Compliance Audit

日期：2026-08-25

## 代码侧发现

- 未发现 `wx.getUserProfile`、`wx.getUserInfo`、头像/昵称主动采集逻辑。
- 未发现 `scope.userLocation` 或定位权限声明。
- AI 灵境使用 `wx.chooseMedia`，实际涉及相册/相机选择；页面已提供图片识别用途说明。
- 使用 `wx.saveImageToPhotosAlbum` 保存 AI 作品，失败时提示用户授权；需在开发者工具/真机核对隐私弹窗与平台配置。
- 使用 CloudBase 与 `traceUser:true`，需要发布前核对云开发隐私政策、数据保留和用户告知内容。
- 未发现麦克风录音或语音输入 API。

## 页面标识

数字人格页面和问答卡片已显示：`AI生成/合成内容`、`AI数字人格讲解`。

## 未确认项

- 微信公众平台隐私保护指引配置
- CloudBase 数据库集合权限与保留策略
- 真实线上环境的用户授权弹窗
- AI 生图内容审核与投诉入口

结论：`PRIVACY_PASS = PENDING_PLATFORM_REVIEW`，不能伪造为正式合规通过。
